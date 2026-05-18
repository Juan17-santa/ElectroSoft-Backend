import mongoose from "mongoose";
import { productModel } from "../../products/infrastructure/ProductModel.js";
import { providerModel } from "../../providers/infrastructure/ProviderModel.js";

function toObjectId(id) {
    return new mongoose.Types.ObjectId(id);
}

function getUpdatedDocument(result) {
    return result?.value ?? result;
}

export default class ShoppingExternalCatalogGatewayMongo {
    async findProviderById(id, session = null) {
        return await providerModel.collection.findOne(
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

    async applyPurchaseEntry(id, { cantidad, precioAplicado, costoPromedio }, session = null) {
        const result = await productModel.collection.findOneAndUpdate(
            { _id: toObjectId(id) },
            {
                $inc: { stock: Number(cantidad) },
                $set: {
                    price: Number(precioAplicado),
                    precio: Number(precioAplicado),
                    costoPromedio: Number(costoPromedio),
                },
            },
            {
                returnDocument: "after",
                session,
            },
        );

        return getUpdatedDocument(result);
    }

    async revertPurchaseEntry(id, cantidad, session = null) {
        const result = await productModel.collection.findOneAndUpdate(
            {
                _id: toObjectId(id),
                stock: { $gte: Number(cantidad) },
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
}
