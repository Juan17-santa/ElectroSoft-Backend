/**
 * Caso de uso para registrar un pago o abono a una venta.
 *
 * Responsabilidades:
 * - Validar que la venta exista y no esté anulada. Se permiten ventas con
 *   devoluciones activas (Vigente, Devolución Parcial, Devuelto, Finalizado).
 * - Calcular el saldo pendiente con el calculador canónico de ventas
 *   (incluye pagos y reembolsos de devoluciones RESUELTAS).
 * - Validar que el monto no supere el saldo pendiente.
 * - Calcular el saldoPendiente y determinar el estado del pago y de la venta.
 * - Crear la entidad PaymentEntity con validaciones de dominio.
 * - Guardar el pago y recalcular saldo/estado de la venta.
 *
 * Flujo de cálculo:
 *   saldoActual          = max(0, total - pagoBase - pagos - reembolsos)
 *   nuevoTotalPagado     = pagoBase + pagos previos + monto
 *   nuevoSaldo           = max(0, total - nuevoTotalPagado)
 *   estadoPago           = nuevoSaldo === 0 ? 'PAGADA'     : 'PENDIENTE'   (enum de Payment)
 *   estadoVenta          = nuevoSaldo === 0 ? 'Finalizado' : 'Vigente'     (enum de Sale)
 *
 * IMPORTANTE: Payment y Sale tienen enums de estado distintos. No deben
 * compartir la misma variable de "nuevo estado" — de ahí la separación
 * explícita entre nuevoEstadoPago y nuevoEstadoVenta.
 */
import mongoose from "mongoose";
import PaymentEntity from "../domain/PaymentEntity.js";
import {
    computeSaleEstado,
    getSalePagoBase,
    getSaleSaldo,
} from "../../sales/infrastructure/SaleFinancialStateService.js";

function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    return new mongoose.Types.ObjectId(id).toString() === String(id);
}

export default class CreatePaymentUseCase {
    constructor(paymentRepository, saleGateway, transactionManager) {
        this.paymentRepository = paymentRepository;
        this.saleGateway = saleGateway;
        this.transactionManager = transactionManager;
    }

    async execute(paymentData) {
        const { ventaId, monto, metodoPago, notas } = paymentData;

        // Validar que el ventaId sea un ObjectId válido
        if (!isValidObjectId(ventaId)) {
            throw new Error("El ventaId no es un ObjectId válido");
        }

        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            // Buscar la venta en el módulo de Sales (dentro de transacción)
            const venta = await this.saleGateway.findSaleById(ventaId, session);
            if (!venta) {
                throw new Error("La venta asociada al pago no existe");
            }

            if (venta.estado === "ANULADA" || venta.estado === "Anulado") {
                throw new Error("No se pueden registrar pagos en una venta anulada");
            }

            // Calcular el total ya pagado (pago base + abonos anteriores válidos)
            const pagosAnteriores = await this.paymentRepository.findByVentaId(ventaId, session);

            const pagoInicial = getSalePagoBase(venta);
            const totalPagadoAnterior = pagoInicial + pagosAnteriores.reduce(
                (acc, p) => acc + (String(p.estado).toUpperCase().includes('ANULAD') ? 0 : Number(p.monto)),
                0
            );

            // Saldo real: considera pagos y reembolsos de devoluciones RESUELTAS
            const totalVenta = Number(venta.total);
            const saldoActual = await getSaleSaldo(venta);

            // Validar que ya no esté pagada
            if (saldoActual <= 0) {
                throw new Error("Esta venta ya ha sido pagada en su totalidad");
            }

            const montoNum = Number(monto);

            // Validar que el monto no supere el saldo (Tolerancia de 49 pesos por redondeo)
            if (montoNum > saldoActual + 49) {
                throw new Error(
                    `El monto (${montoNum}) supera el saldo pendiente de la venta (${saldoActual})`
                );
            }

            // Calcular nuevos valores
            const nuevoTotalPagado = totalPagadoAnterior + montoNum;
            // Evitamos saldos negativos por efecto del redondeo
            const nuevoSaldoPendiente = Math.max(0, totalVenta - nuevoTotalPagado);

            // Estado del Payment (enum propio: PAGADA / PENDIENTE)
            const nuevoEstadoPago = nuevoSaldoPendiente === 0 ? "PAGADA" : "PENDIENTE";
            // Estado de la Sale (enum propio: Finalizado / Vigente)
            const nuevoEstadoVenta = nuevoSaldoPendiente === 0 ? "Finalizado" : "Vigente";

            // Crear entidad con validaciones de dominio
            const payment = new PaymentEntity({
                ventaId,
                monto: montoNum,
                metodoPago,
                totalPagado: nuevoTotalPagado,
                saldoPendiente: nuevoSaldoPendiente,
                estado: nuevoEstadoPago,
                fechaPago: new Date(),
                notas: notas || "",
            });

            const createdPayment = await this.paymentRepository.create(payment, session);

            // Recalcular saldo y estado de la venta
            const saleUpdate = { montoPorPagar: nuevoSaldoPendiente };
            if (nuevoEstadoVenta !== venta.estado) {
                saleUpdate.estado = nuevoEstadoVenta;
            }
            await this.saleGateway.updateSale(ventaId, saleUpdate, session);

            await session.commitTransaction();

            return createdPayment;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}