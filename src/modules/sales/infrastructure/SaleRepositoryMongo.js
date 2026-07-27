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

export default class SaleRepositoryMongo {
    async create(data, session) {
        const [sale] = await saleModel.create([data], { session });
        return sale;
    }

    async findById(id, session = null) {
        return await saleModel
            .findById(id)
            .populate("clienteId", "firstName lastName documentNumber email phone")
            .populate("productos.productoId", "name serial price garantia")
            .session(session);
    }

    async findActiveByInvoice(numeroFactura, session = null) {
        return await saleModel
            .findOne({ numeroFactura: String(numeroFactura).trim(), estado: { $in: ["ACTIVA", "Vigente"] }, })
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
            .populate("clienteId", "firstName lastName documentNumber email phone")
            .populate("productos.productoId", "name serial price garantia")
            .sort({ fechaCreacion: -1 })
            .lean();

        // Obtener todos los pagos activos
        const paymentModel = mongoose.model("Payment");
        const allPayments = await paymentModel.find({
            estado: { $ne: "ANULADO" },
            ventaId: { $in: sales.map(s => s._id) }
        });

        // Agrupar pagos por venta
        const paymentsBySale = allPayments.reduce((acc, p) => {
            const saleIdStr = p.ventaId.toString();
            acc[saleIdStr] = (acc[saleIdStr] || 0) + p.monto;
            return acc;
        }, {});

        // Enriquecer ventas con montoPagado y montoPorPagar
        return sales.map(sale => {
            const total = sale.total || 0;
            const abonos = paymentsBySale[sale._id.toString()] || 0;
            let pagadoCalc = 0;
            if (sale.tipoVenta === 'Contado') {
                pagadoCalc = total;
            } else {
                const pagoInicial = (sale.tipoVenta === 'Mixto') ? ((sale.montoContado != null) ? sale.montoContado : ((sale.montoCredito != null && sale.montoCredito > 0) ? Math.max(0, total - sale.montoCredito) : 0)) : 0;
                pagadoCalc = abonos < pagoInicial ? pagoInicial + abonos : abonos;
            }
            const porPagarCalc = sale.tipoVenta === 'Contado' ? 0 : Math.max(0, total - pagadoCalc);

            return {
                ...sale,
                montoPagado: pagadoCalc,
                montoPorPagar: porPagarCalc
            };
        });
    }
}
