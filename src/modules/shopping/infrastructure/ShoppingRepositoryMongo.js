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
        // create con array permite asociar correctamente la session de Mongoose.
        const [shopping] = await shoppingModel.create([data], { session });
        return shopping;
    }

    async findById(id, session = null) {
        return await shoppingModel.findById(id).session(session);
    }

    async findActiveByInvoice(numeroFactura, session = null) {
        return await shoppingModel
            .findOne({ numeroFactura: String(numeroFactura).trim(), estado: "ACTIVA" })
            .session(session);
    }

    async findByProviderId(providerId) {
        return await shoppingModel.find({
            proveedorId: providerId
        });
    }
    
    async update(id, data, session) {
        return await shoppingModel.findByIdAndUpdate(id, data, {
            returnDocument: "after",
            session,
            // Ejecuta validaciones declaradas en el schema al actualizar.
            runValidators: true,
        });
    }

    async findAll() {
        return await shoppingModel.find().sort({ fechaCreacion: -1 });
    }
}
