/**
 * Caso de uso para crear una venta.
 *
 * Responsabilidades:
 * - Iniciar una transacción de MongoDB.
 * - Crear la entidad SaleEntity para aplicar validaciones de dominio.
 * - Validar que el cliente y los productos existan en MongoDB.
 * - Validar que haya stock suficiente para cada producto.
 * - Calcular el total de la venta.
 * - Guardar la venta.
 * - Decrementar el stock de cada producto vendido.
 * - Marcar impactApplied = true cuando el impacto fue aplicado.
 * - Confirmar o revertir la transacción según el resultado.
 */
import mongoose from "mongoose";
import SaleEntity from "../domain/SaleEntity.js";

function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    return new mongoose.Types.ObjectId(id).toString() === String(id);
}

function getUniqueProductIds(productos) {
    return [...new Set(productos.map((p) => String(p.productoId)))];
}

export default class CreateSaleUseCase {
    constructor(saleRepository, transactionManager, externalCatalogGateway) {
        this.saleRepository = saleRepository;
        this.transactionManager = transactionManager;
        this.externalCatalogGateway = externalCatalogGateway;
    }

    async execute(saleData) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            // Verificar que el número de factura no esté en uso en una venta activa
            const existingSale = await this.saleRepository.findActiveByInvoice(
                saleData.numeroFactura,
                session,
            );

            if (existingSale) {
                throw new Error("El número de factura ya está en uso en una venta activa");
            }

            // Crear la entidad con validaciones de dominio
            const sale = new SaleEntity({
                ...saleData,
                estado: "ACTIVA",
                impactApplied: false,
                fechaCreacion: new Date(),
            });

            // Validar referencias (cliente y productos) y obtener datos de productos
            const productsById = await this.validateReferences(sale, session);

            // Calcular total
            sale.calculateTotal();

            // Guardar la venta
            const createdSale = await this.saleRepository.create(sale, session);

            // Decrementar stock
            await this.applyInventoryImpact(sale, productsById, session);

            // Incrementar compras del cliente
            await this.externalCatalogGateway.applySaleToClient(sale.clienteId, sale.total, session);

            // Marcar que el impacto fue aplicado correctamente
            const updatedSale = await this.saleRepository.update(
                createdSale._id,
                { impactApplied: true },
                session,
            );

            await session.commitTransaction();

            return updatedSale;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async validateReferences(sale, session) {
        if (!this.externalCatalogGateway) {
            throw new Error("No se configuraron los repositorios necesarios para validar la venta");
        }

        // Validar clienteId
        if (!isValidObjectId(sale.clienteId)) {
            throw new Error("El clienteId no es un ObjectId válido");
        }

        // Validar productoIds
        const productIds = getUniqueProductIds(sale.productos);
        const invalidProductIds = productIds.filter((id) => !isValidObjectId(id));

        if (invalidProductIds.length > 0) {
            throw new Error("Uno o más productoId no son ObjectId válidos");
        }

        // Verificar que el cliente existe
        const client = await this.externalCatalogGateway.findClientById(sale.clienteId, session);
        if (!client) {
            throw new Error("El cliente asociado a la venta no existe");
        }

        // Verificar que todos los productos existen
        const products = await this.externalCatalogGateway.findProductsByIds(productIds, session);
        if (products.length !== productIds.length) {
            throw new Error("Uno o más productos asociados a la venta no existen");
        }

        return new Map(products.map((product) => [String(product._id), product]));
    }

    async applyInventoryImpact(sale, productsById, session) {
        for (const productoVendido of sale.productos) {
            const productoActual = productsById.get(String(productoVendido.productoId));
            const stockActual = Number(productoActual.stock) || 0;

            // Validar stock suficiente
            if (stockActual < productoVendido.cantidad) {
                throw new Error(
                    `Stock insuficiente para el producto "${productoActual.name || productoActual.nombre}". ` +
                    `Disponible: ${stockActual}, solicitado: ${productoVendido.cantidad}`
                );
            }

            const updatedProduct = await this.externalCatalogGateway.applySaleEntry(
                productoVendido.productoId,
                productoVendido.cantidad,
                session,
            );

            if (!updatedProduct) {
                throw new Error("No se pudo actualizar el inventario de uno de los productos");
            }

            productsById.set(String(updatedProduct._id), updatedProduct);
        }
    }
}
