/**
 * Caso de uso para confirmar un pedido y convertirlo en una venta.
 *
 * Responsabilidades:
 * - Validar que el pedido exista.
 * - Validar que el pedido esté en estado "Pendiente".
 * - Usar la lógica existente de CreateSaleUseCase para crear la venta.
 * - Eliminar el pedido de la colección orders solo si la venta se creó correctamente.
 */

export default class ConfirmOrderUseCase {
    constructor(orderRepository, createSaleUseCase, productRepository, saleRepository) {
        this.orderRepository = orderRepository;
        this.createSaleUseCase = createSaleUseCase;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    async execute(id) {
        if (!this.createSaleUseCase) {
            throw new Error("No se configuró el caso de uso de creación de ventas");
        }

        if (!this.productRepository) {
            throw new Error("No se configuró el repositorio de productos necesario para devolver stock");
        }

        await this.orderRepository.expirePendingOrders();

        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        if (order.status !== "Pendiente") {
            throw new Error("Solo se pueden confirmar pedidos en estado Pendiente");
        }

        // 1) Devolver el stock reservado por el pedido
        const revertedProducts = [];
        try {
            for (const item of order.products) {
                const updated = await this.productRepository.updateStock(item.product, Number(item.quantity));
                revertedProducts.push({ product: item.product, quantity: Number(item.quantity) });
                if (!updated) {
                    throw new Error(`No se pudo devolver el stock del producto ${item.product}`);
                }
            }
        } catch (err) {
            // Si falla devolver stock, abortamos la confirmación
            throw new Error(`Error al devolver stock antes de confirmar pedido: ${err.message}`);
        }

        let numeroFactura = "01";
        if (this.saleRepository) {
            const allSales = await this.saleRepository.findAll(); // O el método que use tu repo para traer todo
            const count = Array.isArray(allSales) ? allSales.length + 1 : 1;
            numeroFactura = String(count).padStart(2, '0');
        }

        // 2) Preparar datos para crear la venta (CreateSaleUseCase se encargará de descontar stock)
        const saleData = {
            numeroFactura,
            clienteId: order.client?._id || order.client,
            productos: order.products.map((item) => ({
                productoId: item.product,
                cantidad: item.quantity,
                precioUnitario: item.price,
            })),
            tipoVenta: order.paymentMethod === "Credito" ? "Crédito" : "Contado",
            fechaVenta: order.orderDate ? new Date(order.orderDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        };

        // 3) Crear la venta usando la lógica existente de sales
        try {
            const createdSale = await this.createSaleUseCase.execute(saleData);

            // 4) Si la venta se creó correctamente, eliminar el pedido
            await this.orderRepository.delete(id);

            return createdSale;
        } catch (createErr) {
            // Si la creación de la venta falla, intentar re-reservar el stock para mantener el pedido coherente
            try {
                for (const p of revertedProducts) {
                    await this.productRepository.updateStock(p.product, -Number(p.quantity));
                }
            } catch (revertErr) {
                // No enmascarar el error original, pero informar sobre el problema al re-reservar
                throw new Error(`${createErr.message} (Además, no se pudo re-reservar stock: ${revertErr.message})`);
            }

            throw createErr;
        }
    }
}
