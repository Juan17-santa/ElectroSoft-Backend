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

    async applyPurchaseEntry(id, { quantity, appliedPrice, averageCost }, session = null) {
        const result = await productModel.collection.findOneAndUpdate(
            { _id: toObjectId(id) },
            {
                $inc: { stock: Number(quantity) },
                $set: {
                    price: Number(appliedPrice),
                    precio: Number(appliedPrice),
                    costoPromedio: Number(averageCost),
                },
            },
            {
                returnDocument: "after",
                session,
            },
        );

        return getUpdatedDocument(result);
    }

    async revertPurchaseEntry(id, { quantity, salePrice, useSuggestedPrice }, session = null) {
        const objectId = toObjectId(id);

        // Leer el producto actual para calcular el precio anterior a la compra.
        const currentProduct = await productModel.collection.findOne(
            { _id: objectId },
            { session },
        );

        if (!currentProduct) return null;

        const currentStock = Number(currentProduct.stock) || 0;
        const previousStock = currentStock - Number(quantity);

        // Stock insuficiente: no se puede revertir.
        if (previousStock < 0) return null;

        // costoPromedio es el campo canónico del costo promedio ponderado.
        // Si no existe (producto sin compras previas) se cae al price del schema.
        const currentCostoPromedio = currentProduct.costoPromedio != null
            ? Number(currentProduct.costoPromedio)
            : Number(currentProduct.price ?? 0);

        let updateDoc;

        if (previousStock === 0) {
            // Toda la existencia vino de esta compra: no hay precio anterior que recuperar.
            // Solo se descuenta el stock.
            updateDoc = { $inc: { stock: -Number(quantity) } };
        } else {
            // Despeja costoPromedioAnterior de la fórmula de costo promedio ponderado:
            // costoActual = (stockAnterior × costoAnterior + cantidad × salePrice) / stockActual
            // => costoAnterior = (costoActual × stockActual − cantidad × salePrice) / stockAnterior
            const exactPreviousCost =
                (currentCostoPromedio * currentStock - Number(quantity) * Number(salePrice))
                / previousStock;

            const previousAverageCost = Math.ceil(exactPreviousCost / 100) * 100;

            // Si la compra usó useSuggestedPrice, el price/precio fue el salePrice de esa compra.
            // En ese caso no podemos saber el price/precio previo con exactitud, así que
            // restauramos el costoPromedio anterior como mejor aproximación.
            const previousAppliedPrice = previousAverageCost;

            updateDoc = {
                $inc: { stock: -Number(quantity) },
                $set: {
                    price: previousAppliedPrice,
                    precio: previousAppliedPrice,
                    costoPromedio: previousAverageCost,
                },
            };
        }

        const result = await productModel.collection.findOneAndUpdate(
            { _id: objectId, stock: { $gte: Number(quantity) } },
            updateDoc,
            { returnDocument: "after", session },
        );

        return getUpdatedDocument(result);
    }
}