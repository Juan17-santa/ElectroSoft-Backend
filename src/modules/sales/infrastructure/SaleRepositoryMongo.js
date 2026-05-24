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
            .populate("productos.productoId", "name serial price")
            .session(session);
    }

    async findActiveByInvoice(numeroFactura, session = null) {
        return await saleModel
            .findOne({ numeroFactura: String(numeroFactura).trim(), estado: "ACTIVA" })
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
        return await saleModel
            .find()
            .populate("clienteId", "firstName lastName documentNumber email phone")
            .populate("productos.productoId", "name serial price")
            .sort({ fechaCreacion: -1 });
    }
}
