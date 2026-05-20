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

function getUniqueProductIds(productos) {
    return [...new Set(productos.map((producto) => String(producto.productoId)))];
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
                shoppingData.numeroFactura,
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
                fechaCreacion: new Date(),
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

        if (!isValidObjectId(shopping.proveedorId)) {
            throw new Error("El proveedorId no es un ObjectId valido");
        }

        const productIds = getUniqueProductIds(shopping.productos);
        const invalidProductIds = productIds.filter((productoId) => !isValidObjectId(productoId));

        if (invalidProductIds.length > 0) {
            throw new Error("Uno o mas productoId no son ObjectId validos");
        }
        const provider = await this.externalCatalogGateway.findProviderById(shopping.proveedorId, session);

        if (!provider) {
            throw new Error("El proveedor asociado a la compra no existe");
        }

        const products = await this.externalCatalogGateway.findProductsByIds(productIds, session);

        if (products.length !== productIds.length) {
            throw new Error("Uno o mas productos asociados a la compra no existen");
        }

        return new Map(products.map((product) => [String(product._id), product]));
    }

    async applyInventoryImpact(shopping, productsById, session) {
        for (const productoComprado of shopping.productos) {
            const productoActual = productsById.get(String(productoComprado.productoId));
            const stockAnterior = Number(productoActual.stock) || 0;
            const precioAnterior = getCurrentInventoryPrice(productoActual);
            const cantidadEntrada = Number(productoComprado.cantidad);
            const stockNuevo = stockAnterior + cantidadEntrada;

            const costoPromedioExacto = stockAnterior > 0
                ? ((stockAnterior * precioAnterior) + (cantidadEntrada * productoComprado.precioVenta)) / stockNuevo
                : productoComprado.precioVenta;

            const costoPromedio = roundToNextHundred(costoPromedioExacto);
            const precioAplicado = productoComprado.usarPrecioSugerido
                ? productoComprado.precioVenta
                : costoPromedio;

            const updatedProduct = await this.externalCatalogGateway.applyPurchaseEntry(
                productoComprado.productoId,
                {
                    cantidad: cantidadEntrada,
                    precioAplicado,
                    costoPromedio,
                },
                session,
            );

            if (!updatedProduct) {
                throw new Error("No se pudo actualizar el inventario de uno de los productos");
            }

            productsById.set(String(updatedProduct._id), updatedProduct);
        }
    }
}
