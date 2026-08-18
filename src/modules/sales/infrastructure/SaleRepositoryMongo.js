/**
 * Repositorio MongoDB para ventas.
 *
 * Responsabilidades:
 * - Encapsular el acceso a Mongoose.
 * - Exponer operaciones usadas por los casos de uso.
 * - Recibir session cuando el caso de uso trabaja con transacciones.
 *
 * Métodos:
 * - create: crea una venta dentro de una sesión.
 * - findById: busca una venta por ID (con populate de cliente y productos).
 * - findActiveByInvoice: busca una venta activa por número de factura.
 * - update: actualiza una venta y retorna el documento actualizado.
 * - findAll: lista todas las ventas ordenadas por fechaCreacion descendente.
 */
import mongoose from "mongoose";
import { saleModel } from "./SaleModel.js";
import { getRefundsBySaleIds } from "./SaleFinancialStateService.js";

export default class SaleRepositoryMongo {
    async create(data, session) {
        const [sale] = await saleModel.create([data], { session });
        return sale;
    }

    async findById(id, session = null) {
        return await saleModel
            .findById(id)
            .populate({
                path: "clienteId",
                select: "firstName lastName documentType documentNumber email phone",
                populate: { path: "documentType", select: "name abbreviation" }
            })
            .populate("productos.productoId", "name serial price warranty")
            .session(session);
    }

    async findActiveByInvoice(numeroFactura, session = null) {
        return await saleModel
            .findOne({
                numeroFactura: String(numeroFactura).trim(),
                estado: { $nin: ["ANULADA", "Anulado"] },
            })
            .session(session);
    }

    async update(id, data, session) {
        return await saleModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            session,
            runValidators: true,
        });
    }

    async findAll() {
        const sales = await saleModel
            .find()
            .populate({
                path: "clienteId",
                select: "firstName lastName documentType documentNumber email phone",
                populate: { path: "documentType", select: "name abbreviation" }
            })
            .populate("productos.productoId", "name serial price warranty")
            .sort({ fechaCreacion: -1 })
            .lean();

        // Obtener todos los pagos activos
        const paymentModel = mongoose.model("Payment");
        const [allPayments, refundsBySale] = await Promise.all([
            paymentModel.find({
                estado: { $ne: "ANULADO" },
                ventaId: { $in: sales.map(s => s._id) }
            }),
            getRefundsBySaleIds(sales.map(s => s._id)),
        ]);

        // Agrupar pagos por venta
        const paymentsBySale = allPayments.reduce((acc, p) => {
            const saleIdStr = p.ventaId.toString();
            acc[saleIdStr] = (acc[saleIdStr] || 0) + p.monto;
            return acc;
        }, {});

        // Enriquecer ventas con montoPagado y montoPorPagar (incluye reembolsos RESUELTOS)
        return sales.map(sale => {
            const total = sale.total || 0;
            const abonos = paymentsBySale[sale._id.toString()] || 0;
            const reembolsos = refundsBySale.get(String(sale._id)) || 0;
            let pagadoCalc = 0;
            if (sale.tipoVenta === 'Contado') {
                pagadoCalc = total;
            } else {
                const pagoInicial = (sale.tipoVenta === 'Mixto') ? ((sale.montoContado != null) ? sale.montoContado : ((sale.montoCredito != null && sale.montoCredito > 0) ? Math.max(0, total - sale.montoCredito) : 0)) : 0;
                pagadoCalc = pagoInicial + abonos;
            }
            const porPagarCalc = Math.max(0, total - pagadoCalc - reembolsos);

            return {
                ...sale,
                montoPagado: pagadoCalc,
                montoPorPagar: porPagarCalc
            };
        });
    }

    async hasSalesByClient(clientId) {
        const count = await saleModel.countDocuments({ clienteId: clientId });
        return count > 0;
    }
}
