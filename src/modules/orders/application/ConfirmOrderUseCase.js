/**
 * Caso de uso para confirmar un pedido y convertirlo en una venta.
 *
 * Responsabilidades:
 * - Validar que el pedido exista.
 * - Validar que el pedido esté en estado "Por procesar".
 * - Usar la lógica existente de CreateSaleUseCase para crear la venta.
 * - Eliminar el pedido de la colección orders solo si la venta se creó correctamente.
 */

const MINIMUM_CREDIT_AMOUNT = 10000;

export default class ConfirmOrderUseCase {
    constructor(orderRepository, createSaleUseCase, productRepository, saleRepository) {
        this.orderRepository = orderRepository;
        this.createSaleUseCase = createSaleUseCase;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    async execute(id, confirmationData = {}) {
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

        if (order.status !== "Por procesar") {
            throw new Error("Solo se pueden confirmar pedidos en estado Por procesar");
        }

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
            throw new Error(`Error al devolver stock antes de confirmar pedido: ${err.message}`);
        }

        let numeroFactura = "01";
        if (this.saleRepository?.getNextInvoiceNumber) {
            numeroFactura = await this.saleRepository.getNextInvoiceNumber();
        }

        let tipoVenta;
        switch (order.paymentMethod) {
            case "Contado":
                tipoVenta = "Contado";
                break;
            case "Credito":
                tipoVenta = "Crédito";
                break;
            case "Mixto":
                tipoVenta = "Mixto";
                break;
        }

        let diasPlazo = null;
        let montoCredito = 0;

        if (tipoVenta === "Crédito" || tipoVenta === "Mixto") {
            if (Number(order.total) < MINIMUM_CREDIT_AMOUNT) {
                throw new Error("El total del pedido debe ser mínimo de $10.000 para usar crédito.");
            }
            if (confirmationData.diasPlazo == null) {
                throw new Error("Debe indicar el plazo del crédito.");
            }

            diasPlazo = Number(confirmationData.diasPlazo);

            if (diasPlazo < 0 || diasPlazo > 60) {
                throw new Error("El plazo debe estar entre 0 y 60 días.");
            }
        }

        if (tipoVenta === "Mixto") {
            if (confirmationData.montoCredito == null) {
                throw new Error("Debe indicar cuánto crédito utilizará.");
            }

            montoCredito = Number(confirmationData.montoCredito);

            if (montoCredito <= 0) {
                throw new Error("El monto de crédito debe ser mayor a cero.");
            }

            if (montoCredito < MINIMUM_CREDIT_AMOUNT) {
                throw new Error("El monto a crédito debe ser mínimo de $10.000.");
            }

            if (montoCredito > order.total) {
                throw new Error("El monto de crédito no puede superar el total del pedido.");
            }

            if (Number(order.total) - montoCredito < MINIMUM_CREDIT_AMOUNT) {
                throw new Error("La parte de contado debe ser mínimo de $10.000.");
            }
        }

        const saleData = {
            numeroFactura,
            clienteId: order.client?._id || order.client,
            productos: order.products.map((item) => ({
                productoId: item.product,
                cantidad: item.quantity,
                precioUnitario: item.price,
            })),
            tipoVenta,
            fechaVenta: new Date().toISOString().split("T")[0],
            diasPlazo,
            montoCredito,
            creadoPor: confirmationData.creadoPor || null,
        };

        try {
            const createdSale = await this.createSaleUseCase.execute(saleData);

            await this.orderRepository.delete(id);

            return createdSale;
        } catch (createErr) {
            try {
                for (const p of revertedProducts) {
                    await this.productRepository.updateStock(p.product, -Number(p.quantity));
                }
            } catch (revertErr) {
                throw new Error(`${createErr.message} (Además, no se pudo re-reservar stock: ${revertErr.message})`);
            }

            throw createErr;
        }
    }
}
