/**
 * Caso de uso para crear una compra.
 *
 * Responsabilidades:
 * - Iniciar una transacción de MongoDB.
 * - Crear la entidad ShoppingEntity para aplicar validaciones de dominio.
 * - Validar que proveedor y productos existan en MongoDB.
 * - Calcular el total desde los productos recibidos.
 * - Guardar la compra.
 * - Incrementar stock y actualizar precio de inventario.
 * - Marcar impactApplied = true cuando el impacto real se aplico.
 * - Confirmar o revertir la transacción según el resultado.
 *
 * Importante:
 * - El impacto de inventario se ejecuta en la misma transaccion que crea la compra.
 */
import mongoose from "mongoose";
import ShoppingEntity from "../domain/ShoppingEntity.js";

function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;

    return new mongoose.Types.ObjectId(id).toString() === String(id);
}

function getUniqueProductIds(products) {
    return [...new Set(products.map((product) => String(product.productId)))];
}

function roundToNextHundred(value) {
    return Math.ceil(Number(value) / 100) * 100;
}

function getCurrentInventoryPrice(product) {
    const price = product.precio ?? product.price ?? product.costoPromedio ?? 0;
    return Number(price) || 0;
}

export default class CreateShoppingUseCase {
    constructor(shoppingRepository, transactionManager, externalCatalogGateway) {
        this.shoppingRepository = shoppingRepository;
        this.transactionManager = transactionManager;
        this.externalCatalogGateway = externalCatalogGateway;
    }

    async execute(shoppingData) {
        // Inicia sesión para ejecutar el flujo completo de forma transaccional.
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const existingShopping = await this.shoppingRepository.findActiveByInvoice(
                shoppingData.invoiceNumber,
                session,
            );

            if (existingShopping) {
                throw new Error("El numero de factura ya esta en uso en una compra activa");
            }

            // Crea la entidad y ejecuta validaciones de negocio.
            const shopping = new ShoppingEntity({
                ...shoppingData,
                estado: "ACTIVA",
                impactApplied: false,
                createdAt: new Date(),
            });

            const productsById = await this.validateReferences(shopping, session);

            shopping.calculateTotal();

            // Guarda la compra y aplica inventario real dentro de la misma transaccion.
            const createdShopping = await this.shoppingRepository.create(shopping, session);

            await this.applyInventoryImpact(shopping, productsById, session);

            // Marca que el impacto real de inventario fue aplicado.
            const updatedShopping = await this.shoppingRepository.update(
                createdShopping._id,
                { impactApplied: true },
                session,
            );

            await session.commitTransaction();

            return updatedShopping;
        } catch (error) {
            // Cualquier error revierte la creación y el impacto simulado.
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async validateReferences(shopping, session) {
        if (!this.externalCatalogGateway) {
            throw new Error("No se configuraron los repositorios necesarios para validar la compra");
        }

        if (!isValidObjectId(shopping.providerId)) {
            throw new Error("The providerId is not a valid ObjectId");
        }

        const productIds = getUniqueProductIds(shopping.products);
        const invalidProductIds = productIds.filter((productId) => !isValidObjectId(productId));

        if (invalidProductIds.length > 0) {
            throw new Error("One or more productId are not valid ObjectIds");
        }
        const provider = await this.externalCatalogGateway.findProviderById(shopping.providerId, session);

        if (!provider) {
            throw new Error("The provider associated with the purchase does not exist");
        }

        const products = await this.externalCatalogGateway.findProductsByIds(productIds, session);

        if (products.length !== productIds.length) {
            throw new Error("One or more products associated with the purchase do not exist");
        }

        return new Map(products.map((product) => [String(product._id), product]));
    }

    async applyInventoryImpact(shopping, productsById, session) {
        for (const purchasedProduct of shopping.products) {
            const currentProduct = productsById.get(String(purchasedProduct.productId));
            const previousStock = Number(currentProduct.stock) || 0;
            const previousPrice = getCurrentInventoryPrice(currentProduct);
            const entryQuantity = Number(purchasedProduct.quantity);
            const newStock = previousStock + entryQuantity;

            const exactAverageCost = previousStock > 0
                ? ((previousStock * previousPrice) + (entryQuantity * purchasedProduct.salePrice)) / newStock
                : purchasedProduct.salePrice;

            const averageCost = roundToNextHundred(exactAverageCost);
            const appliedPrice = purchasedProduct.useSuggestedPrice
                ? purchasedProduct.salePrice
                : averageCost;

            const updatedProduct = await this.externalCatalogGateway.applyPurchaseEntry(
                purchasedProduct.productId,
                {
                    quantity: entryQuantity,
                    appliedPrice,
                    averageCost,
                },
                session,
            );

            if (!updatedProduct) {
                throw new Error("Could not update inventory for one of the products");
            }

            productsById.set(String(updatedProduct._id), updatedProduct);
        }
    }
}
