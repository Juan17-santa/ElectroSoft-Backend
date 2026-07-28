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

    async createProduct(productData, session = null) {
        const doc = {
            name: productData.name,
            categoryId: toObjectId(productData.categoryId),
            price: Number(productData.price) || 0,
            stock: Number(productData.stock) || 0,
            typeStock: productData.typeStock || "unidad",
            serial: productData.serial || "",
            warranty: productData.warranty || "",
            characteristics: (productData.characteristics || []).map((c) => ({
                name: c.name,
                unit: c.unit || "-",
                value: c.value || "",
                visible: c.visible !== false,
            })),
            status: true,
        };
        const result = await productModel.collection.insertOne(doc, { session });
        return { ...doc, _id: result.insertedId };
    }

    async revertPurchaseEntry(id, { quantity, salePrice, useSuggestedPrice, previousPrice = null, previousCostoPromedio = null }, session = null) {
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
            // Toda la existencia vino de esta compra: por defecto solo se descuenta el stock.
            // Si se nos proveyeron snapshots previos, los aplicamos para restaurar valores exactos.
            updateDoc = { $inc: { stock: -Number(quantity) } };

            if (previousPrice != null || previousCostoPromedio != null) {
                const prevCosto = previousCostoPromedio != null
                    ? Number(previousCostoPromedio)
                    : Number(previousPrice);
                const prevAppliedPrice = previousPrice != null ? Number(previousPrice) : prevCosto;

                updateDoc.$set = {
                    price: prevAppliedPrice,
                    precio: prevAppliedPrice,
                    costoPromedio: prevCosto,
                };
            }
        } else {
            // Despeja costoPromedioAnterior de la fórmula de costo promedio ponderado:
            // costoActual = (stockAnterior × costoAnterior + cantidad × salePrice) / stockActual
            // => costoAnterior = (costoActual × stockActual − cantidad × salePrice) / stockAnterior
            const exactPreviousCost =
                (currentCostoPromedio * currentStock - Number(quantity) * Number(salePrice))
                / previousStock;

            const previousAverageCost = Math.ceil(exactPreviousCost / 100) * 100;

            // Por defecto usamos el cálculo aritmético para recuperar el previo.
            let previousAppliedPrice = previousAverageCost;
            let previousCostoToSet = previousAverageCost;

            // Si se proporcionó un snapshot (guardado al crear la compra), lo usamos
            // para restaurar exactamente los valores previos y evitar errores por redondeo.
            if (previousPrice != null || previousCostoPromedio != null) {
                previousCostoToSet = previousCostoPromedio != null
                    ? Number(previousCostoPromedio)
                    : Number(previousPrice);
                previousAppliedPrice = previousPrice != null
                    ? Number(previousPrice)
                    : previousCostoToSet;
            }

            updateDoc = {
                $inc: { stock: -Number(quantity) },
                $set: {
                    price: previousAppliedPrice,
                    precio: previousAppliedPrice,
                    costoPromedio: previousCostoToSet,
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