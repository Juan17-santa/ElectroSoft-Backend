import OrderEntity from "../domain/OrderEntity.js";

export default class CreateOrderUseCase {
    constructor(orderRepository, clientRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    async execute(orderData) {
        if (!orderData) {
            throw new Error("No se recibieron datos para procesar el pedido.");
        }
        if (!orderData.products || !Array.isArray(orderData.products)) {
            throw new Error("Debe agregar al menos un producto");
        }

        const clientExists = await this.clientRepository.findById(orderData.client);
        if (!clientExists) {
            throw new Error("Cliente no encontrado");
        }

        const orderDate = orderData.orderDate ? new Date(orderData.orderDate) : new Date();
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() - 4);

        if (orderDate > today) throw new Error("La fecha del pedido no puede ser futura.");
        if (orderDate < minDate) throw new Error("La fecha del pedido no puede ser mayor a 4 días de antigüedad.");

        const dueDate = new Date(orderDate);
        dueDate.setDate(dueDate.getDate() + 15);

        let calculatedTotal = 0;
        const validatedProducts = [];

        for (const item of orderData.products) {
            if (!item.product) {
                throw new Error("Debe incluir el identificador del producto.");
            }

            const dbProduct = await this.productRepository.findById(item.product);
            if (!dbProduct) {
                throw new Error(`El producto con ID ${item.product} no existe.`);
            }

            if (dbProduct.stock < item.quantity) {
                throw new Error(`Stock insuficiente para "${dbProduct.name}". Disponible: ${dbProduct.stock}, Solicitado: ${item.quantity}`);
            }

            const price = dbProduct.price;
            const quantity = item.quantity;
            const lineTotal = price * quantity;

            validatedProducts.push({
                product: dbProduct._id,
                name: dbProduct.name,
                price: price,
                quantity: quantity,
                lineTotal: lineTotal
            });

            calculatedTotal += lineTotal;
        }

        const IVA_PERCENTAGE = 0.19;
        const calculatedIva = Math.round(calculatedTotal * IVA_PERCENTAGE);
        const calculatedSubtotal = calculatedTotal - calculatedIva;

        if (orderData.paymentMethod === "Credito") {
            if (!clientExists.cupoActivo) {
                throw new Error(
                    "El cliente no tiene un cupo de crédito habilitado."
                );
            }

            if (!clientExists.cupoTotal || clientExists.cupoTotal <= 0) {
                throw new Error(
                    "El cliente no tiene cupo disponible."
                );
            }

            if (calculatedTotal > clientExists.cupoTotal) {
                throw new Error(
                    `Cupo insuficiente. El pedido ($${calculatedTotal}) supera el cupo disponible ($${clientExists.cupoTotal}).`
                );
            }
        }

        const newOrderEntity = new OrderEntity({
            documentNumber: orderData.documentNumber,
            client: clientExists._id,
            orderDate: orderDate,
            dueDate: dueDate,
            products: validatedProducts,
            paymentMethod: orderData.paymentMethod,
            subtotal: calculatedSubtotal,
            iva: calculatedIva,
            total: calculatedTotal,
            status: "Pendiente"
        });

        for (const item of validatedProducts) {
            await this.productRepository.updateStock(item.product, -item.quantity);
        }

        const savedOrder = await this.orderRepository.create(newOrderEntity);
        return savedOrder;
    }
}