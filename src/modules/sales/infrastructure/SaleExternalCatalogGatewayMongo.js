/**
 * Gateway externo del módulo Sales hacia otros módulos (Products y Clients).
 *
 * Responsabilidades:
 * - Buscar clientes por ID (acceso directo a colección MongoDB).
 * - Buscar productos por IDs.
 * - Decrementar stock al confirmar una venta (applySaleEntry).
 * - Incrementar stock al anular una venta (revertSaleEntry).
 *
 * Accede directamente a las colecciones usando `.collection` de Mongoose
 * para soportar sesiones de transacción correctamente.
 */
import mongoose from "mongoose";
import { productModel } from "../../products/infrastructure/ProductModel.js";
import { ClientModel } from "../../clients/infrastructure/ClientModel.js";

function toObjectId(id) {
    return new mongoose.Types.ObjectId(id);
}

function getUpdatedDocument(result) {
    return result?.value ?? result;
}

export default class SaleExternalCatalogGatewayMongo {
    async findClientById(id, session = null) {
        return await ClientModel.collection.findOne(
            { _id: toObjectId(id) },
            { session },
        );
    }

    async findProductsByIds(ids, session = null) {
        const objectIds = ids.map(toObjectId);

        return await productModel.collection
            .find({ _id: { $in: objectIds } }, { session })
            .toArray();
    }

    // Decrementa el stock del producto al vender
    async applySaleEntry(id, cantidad, session = null) {
        const result = await productModel.collection.findOneAndUpdate(
            {
                _id: toObjectId(id),
                stock: { $gte: Number(cantidad) }, // Garantía extra de stock suficiente
            },
            {
                $inc: { stock: -Number(cantidad) },
            },
            {
                returnDocument: "after",
                session,
            },
        );

        return getUpdatedDocument(result);
    }

    // Incrementa el stock del producto al anular la venta
    async revertSaleEntry(id, cantidad, session = null) {
        const result = await productModel.collection.findOneAndUpdate(
            { _id: toObjectId(id) },
            {
                $inc: { stock: Number(cantidad) },
            },
            {
                returnDocument: "after",
                session,
            },
        );

        return getUpdatedDocument(result);
    }

    // Incrementa las compras totales del cliente al confirmar la venta
    async applySaleToClient(clientId, montoVenta, session = null) {
        const client = await ClientModel.findById(clientId).session(session);
        if (!client) return null;

        const baseTotal = Math.max(0, client.totalCompras || 0);
        const nuevoTotal = baseTotal + Number(montoVenta);

        return await ClientModel.findByIdAndUpdate(
            clientId,
            { totalCompras: nuevoTotal },
            { returnDocument: "after", session }
        );
    }

    // Decrementa las compras totales del cliente al anular la venta
    async revertSaleFromClient(clientId, montoVenta, session = null) {
        const client = await ClientModel.findById(clientId).session(session);
        if (!client) return null;

        const baseTotal = Math.max(0, client.totalCompras || 0);
        const nuevoTotal = Math.max(0, baseTotal - Number(montoVenta));

        return await ClientModel.findByIdAndUpdate(
            clientId,
            { totalCompras: nuevoTotal },
            { returnDocument: "after", session }
        );
    }
}
