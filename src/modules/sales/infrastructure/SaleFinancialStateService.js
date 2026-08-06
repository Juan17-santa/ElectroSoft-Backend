/**
 * SaleFinancialStateService
 *
 * Fuente única de verdad para el estado financiero de una venta:
 * - montoPorPagar: saldo pendiente considerando pagos (abonos), el pago base
 *   (contado/mixto) y los reembolsos de devoluciones RESUELTAS activas.
 * - estado: derivado de la tanda de devoluciones contable y del saldo.
 *
 * Reglas:
 * - Devoluciones contables (activas): no anuladas y con estadoResolucion
 *   distinto de "Anulada" y "RECHAZADA". Una devolución RECHAZADA se comporta
 *   como si nunca hubiera existido.
 * - Si existen devoluciones contables: la venta se muestra como
 *   "Devuelto" (todo el vendido cubierto) o "Devolución Parcial".
 * - Si no existen devoluciones contables: "Finalizado" (saldo 0) o
 *   "Vigente" (saldo mayor a 0). Nunca se escribe "ACTIVA".
 * - Los reembolsos (gestion REEMBOLSO_TOTAL / REEMBOLSO_PARCIAL) solo cuentan
 *   cuando la devolución está RESUELTA y no anulada.
 */
import { devolutionModel } from "../../devolutions/infrastructure/DevolutionModel.js";
import { paymentModel } from "../../payments/infrastructure/PaymentModel.js";

const CANCELLED_SALE_STATES = new Set(["ANULADA", "Anulado"]);
const NON_COUNTABLE_DEVOLUTION_STATES = ["Anulada", "RECHAZADA"];
const REFUND_GESTIONES = new Set(["REEMBOLSO_TOTAL", "REEMBOLSO_PARCIAL"]);

function toPlain(document) {
    return document?.toObject?.() ?? document;
}

function getProductId(value) {
    if (!value) return "";
    if (value._id) return String(value._id);
    return String(value);
}

/**
 * Pago base de la venta que no está registrado en la colección de pagos:
 * - Contado: se considera pagada en su totalidad al registrarse.
 * - Mixto: el pago inicial (montoContado).
 * - Crédito: 0.
 */
export function getSalePagoBase(sale) {
    const tipo = String(sale?.tipoVenta ?? "");
    if (tipo === "Contado") return Number(sale?.total ?? 0);
    if (tipo === "Mixto" || String(sale?.formaPago ?? "") === "Mixto") {
        return Number(sale?.montoContado ?? 0);
    }
    return 0;
}

export function isCountableDevolution(devolution) {
    return !devolution.anulada && !NON_COUNTABLE_DEVOLUTION_STATES.includes(devolution.estadoResolucion);
}

/**
 * Suma los pagos (abonos) no anulados de una venta.
 */
export async function getSalePaymentsTotal(saleId, { session } = {}) {
    const payments = await paymentModel
        .find({ ventaId: saleId, estado: { $ne: "ANULADO" } })
        .session(session);
    return payments.reduce((sum, p) => sum + Number(p.monto ?? 0), 0);
}

/**
 * Reembolsos aplicados por venta: suma de montoReembolso de devoluciones
 * RESUELTAS no anuladas con gestión de reembolso. Devuelve un Map clave = saleId.
 */
export async function getRefundsBySaleIds(saleIds, { session } = {}) {
    const result = new Map();
    if (!saleIds || saleIds.length === 0) return result;

    const devolutions = await devolutionModel
        .find({
            saleId: { $in: saleIds.map(String) },
            anulada: { $ne: true },
            estadoResolucion: "RESUELTO",
        })
        .session(session);

    for (const devolution of devolutions) {
        for (const item of devolution.productos ?? []) {
            const producto = toPlain(item);
            if (!REFUND_GESTIONES.has(String(producto.gestion ?? ""))) continue;
            const key = String(devolution.saleId);
            result.set(key, (result.get(key) ?? 0) + Number(producto.montoReembolso ?? 0));
        }
    }

    return result;
}

export async function getSaleRefunds(saleId, { session } = {}) {
    const refunds = await getRefundsBySaleIds([saleId], { session });
    return refunds.get(String(saleId)) ?? 0;
}

/**
 * Saldo pendiente real de la venta:
 *   max(0, total - pagoBase - pagos no anulados - reembolsos RESUELTOS).
 */
export async function getSaleSaldo(sale, { session } = {}) {
    const total = Number(sale?.total ?? 0);
    const pagoBase = getSalePagoBase(sale);
    const saleId = sale?._id ?? sale?.id;
    const payments = await getSalePaymentsTotal(saleId, { session });
    const refunds = await getSaleRefunds(saleId, { session });
    return Math.max(0, total - pagoBase - payments - refunds);
}

/**
 * Estado de la venta considerando la tanda de devoluciones contable:
 * - Con devoluciones contables: "Devuelto" o "Devolución Parcial".
 * - Sin devoluciones contables: "Finalizado" (saldo 0) o "Vigente" (saldo > 0).
 * - Ventas anuladas conservan su estado.
 */
export async function computeSaleEstado(sale, { session } = {}) {
    if (!sale) throw new Error("Venta no encontrada");
    if (CANCELLED_SALE_STATES.has(sale.estado)) return sale.estado;

    const saleId = sale._id ?? sale.id;
    const soldByProduct = new Map();
    for (const item of sale?.productos ?? []) {
        const producto = toPlain(item);
        const productoId = getProductId(producto.productoId);
        soldByProduct.set(productoId, (soldByProduct.get(productoId) ?? 0) + Number(producto.cantidad ?? 0));
    }

    const devolutions = await devolutionModel
        .find({
            saleId: String(saleId),
            anulada: { $ne: true },
            estadoResolucion: { $nin: NON_COUNTABLE_DEVOLUTION_STATES },
        })
        .session(session);

    if (devolutions.length > 0) {
        const returnedByProduct = new Map();
        for (const devolution of devolutions) {
            for (const item of devolution.productos ?? []) {
                const producto = toPlain(item);
                const productoId = getProductId(producto.productoId);
                returnedByProduct.set(
                    productoId,
                    (returnedByProduct.get(productoId) ?? 0) + Number(producto.cantidad ?? 0),
                );
            }
        }

        const totalSold = [...soldByProduct.values()].reduce((sum, q) => sum + q, 0);
        const totalReturned = [...returnedByProduct.values()].reduce((sum, q) => sum + q, 0);
        const fullyReturned =
            totalReturned > 0 &&
            [...soldByProduct.entries()].every(
                ([productoId, soldQuantity]) => (returnedByProduct.get(productoId) ?? 0) >= soldQuantity,
            ) &&
            totalReturned >= totalSold;

        return fullyReturned ? "Devuelto" : "Devolución Parcial";
    }

    const saldo = await getSaleSaldo(sale, { session });
    return saldo > 0 ? "Vigente" : "Finalizado";
}
