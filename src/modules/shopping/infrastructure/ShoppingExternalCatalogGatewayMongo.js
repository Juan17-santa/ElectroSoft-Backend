import mongoose from "mongoose";
import { productModel } from "../../products/infrastructure/ProductModel.js";
import { providerModel } from "../../providers/infrastructure/ProviderModel.js";

function toObjectId(id) {
    if (id instanceof mongoose.Types.ObjectId) return id;

    if (typeof id === "object" && id !== null) {
        const nested = id._id ?? id.id;
        if (nested instanceof mongoose.Types.ObjectId) return nested;
        return new mongoose.Types.ObjectId(nested);
    }

    return new mongoose.Types.ObjectId(id);
}

function getUpdatedDocument(result) {
    return result?.value ?? result;
}

function buildRevertUpdateDoc(currentProduct, quantity, salePrice, previousPrice = null, previousCostoPromedio = null) {
    const currentStock = Number(currentProduct.stock) || 0;
    const previousStock = currentStock - Number(quantity);

    // costoPromedio es el campo canónico del costo promedio ponderado.
    // Si no existe (producto sin compras previas) se cae al price del schema.
    const currentCostoPromedio = currentProduct.costoPromedio != null
        ? Number(currentProduct.costoPromedio)
        : Number(currentProduct.price ?? 0);

    if (previousStock === 0) {
        // Toda la existencia vino de esta compra: por defecto solo se descuenta el stock.
        // Si se nos proveyeron snapshots previos, los aplicamos para restaurar valores exactos.
        const updateDoc = { $inc: { stock: -Number(quantity) } };

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

        return updateDoc;
    }

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

    return {
        $inc: { stock: -Number(quantity) },
        $set: {
            price: previousAppliedPrice,
            precio: previousAppliedPrice,
            costoPromedio: previousCostoToSet,
        },
    };
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

        const updateDoc = buildRevertUpdateDoc(
            currentProduct,
            quantity,
            salePrice,
            previousPrice,
            previousCostoPromedio,
        );

        const result = await productModel.collection.findOneAndUpdate(
            { _id: objectId, stock: { $gte: Number(quantity) } },
            updateDoc,
            { returnDocument: "after", session },
        );

        return getUpdatedDocument(result);
    }

    async bulkApplyPurchaseEntries(entries, session = null) {
        const operations = entries.map(({ productId, quantity, appliedPrice, averageCost }) => ({
            updateOne: {
                filter: { _id: toObjectId(productId) },
                update: {
                    $inc: { stock: Number(quantity) },
                    $set: {
                        price: Number(appliedPrice),
                        precio: Number(appliedPrice),
                        costoPromedio: Number(averageCost),
                    },
                },
            },
        }));

        const result = await productModel.collection.bulkWrite(operations, { session });

        if (result.matchedCount !== entries.length) {
            throw new Error("Could not update inventory for one or more products");
        }

        return result;
    }

    async bulkRevertPurchaseEntries(entries, session = null) {
        const objectIds = entries.map(({ productId }) => toObjectId(productId));

        const currentProducts = await productModel.collection
            .find({ _id: { $in: objectIds } }, { session })
            .toArray();

        const productsById = new Map(
            currentProducts.map((product) => [String(product._id), product]),
        );

        const operations = [];
        const validEntries = [];

        for (const entry of entries) {
            const currentProduct = productsById.get(String(entry.productId));

            // Producto inexistente o stock insuficiente: la transacción se aborta.
            if (!currentProduct) {
                throw new Error("No se puede anular la compra porque un producto ya no existe");
            }

            const currentStock = Number(currentProduct.stock) || 0;
            if (currentStock - Number(entry.quantity) < 0) {
                throw new Error(
                    "No se puede anular la compra porque el stock actual de un producto es menor a la cantidad comprada",
                );
            }

            operations.push({
                updateOne: {
                    filter: { _id: toObjectId(entry.productId), stock: { $gte: Number(entry.quantity) } },
                    update: buildRevertUpdateDoc(
                        currentProduct,
                        entry.quantity,
                        entry.salePrice,
                        entry.previousPrice ?? null,
                        entry.previousCostoPromedio ?? null,
                    ),
                },
            });
            validEntries.push(entry);
        }

        if (operations.length === 0) return;

        const result = await productModel.collection.bulkWrite(operations, { session });

        if (result.matchedCount !== validEntries.length) {
            throw new Error(
                "No se puede anular la compra porque el stock actual de un producto es menor a la cantidad comprada",
            );
        }

        return result;
    }
}