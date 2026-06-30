/**
 * Repositorio MongoDB para compras.
 *
 * Responsabilidades:
 * - Encapsular el acceso a Mongoose.
 * - Exponer operaciones usadas por los casos de uso.
 * - Recibir session cuando el caso de uso trabaja con transacciones.
 *
 * Métodos:
 * - create: crea una compra dentro de una sesión.
 * - findById: busca una compra por ID.
 * - update: actualiza una compra y retorna el documento actualizado.
 * - findAll: lista compras ordenadas por fechaCreacion descendente.
 */
import { shoppingModel } from "./ShoppingModel.js";

export default class ShoppingRepositoryMongo {
    async create(data, session) {
        const [shopping] = await shoppingModel.create([data], { session });
        return shopping;
    }

    async findById(id, session = null) {
        return await shoppingModel
            .findById(id)
            .populate("providerId", "providerName")
            .populate("products.productId", "name price")
            .session(session);
    }


    async findActiveByInvoice(invoiceNumber, session = null) {
        return await shoppingModel
            .findOne({ invoiceNumber: String(invoiceNumber).trim(), estado: "ACTIVA" })
            .populate('providerId', 'providerName')
            .populate('products.productId', 'name')
            .session(session);
    }

    async findByProviderId(providerId) {
        return await shoppingModel.find({ providerId: providerId })
            .populate('providerId', 'providerName')
            .populate('products.productId', 'name');
    }

    async update(id, data, session) {
        return await shoppingModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            session,
            runValidators: true,
        });
    }

    async findAll() {
        return await shoppingModel.find()
            .populate('providerId', 'providerName')
            .populate('products.productId', 'name')
            .sort({ createdAt: -1 });
    }
}
