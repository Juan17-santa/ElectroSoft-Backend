import OrderEntity from "../domain/OrderEntity.js";

const MINIMUM_CREDIT_AMOUNT = 10000;

export default class UpdateOrderUseCase {
    constructor(orderRepository, clientRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    async execute(id, orderData) {
        if (!orderData || !Array.isArray(orderData.products) || orderData.products.length === 0) {
            throw new Error("Debe agregar al menos un producto");
        }

        const currentOrder = await this.orderRepository.findById(id);
        if (!currentOrder) throw new Error("Pedido no encontrado");
        if (currentOrder.status !== "Por procesar") {
            throw new Error("Solo se puede editar un pedido en estado Por procesar.");
        }

        const client = await this.clientRepository.findById(orderData.client);
        if (!client) throw new Error("Cliente no encontrado");

        const orderDate = orderData.orderDate ? new Date(orderData.orderDate) : currentOrder.orderDate;
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() - 4);
        if (Number.isNaN(orderDate.getTime()) || orderDate > today) throw new Error("La fecha del pedido no puede ser futura.");
        if (orderDate < minDate) throw new Error("La fecha del pedido no puede tener más de 4 días de antigüedad.");

        const previousQuantities = new Map();
        for (const item of currentOrder.products || []) {
            const key = String(item.product?._id || item.product);
            previousQuantities.set(key, (previousQuantities.get(key) || 0) + Number(item.quantity));
        }

        let calculatedTotal = 0;
        const products = [];
        const requestedQuantities = new Map();
        for (const item of orderData.products) {
            if (!item.product) throw new Error("Debe incluir el identificador del producto.");
            const product = await this.productRepository.findById(item.product);
            if (!product) throw new Error(`El producto con ID ${item.product} no existe.`);
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`Cantidad inválida para "${product.name}".`);

            const key = String(product._id);
            const alreadyRequested = requestedQuantities.get(key) || 0;
            const availableWithReturn = Number(product.stock || 0) + (previousQuantities.get(key) || 0);
            if (alreadyRequested + quantity > availableWithReturn) {
                throw new Error(`Stock insuficiente para "${product.name}". Disponible: ${availableWithReturn}, Solicitado: ${alreadyRequested + quantity}`);
            }
            requestedQuantities.set(key, alreadyRequested + quantity);
            const lineTotal = product.price * quantity;
            products.push({ product: product._id, name: product.name, price: product.price, quantity, lineTotal });
            calculatedTotal += lineTotal;
        }

        const iva = Math.round(calculatedTotal * 0.19);
        const subtotal = calculatedTotal - iva;
        const requestedCredit = Number(orderData.requestedCredit || 0);
        if (!Number.isFinite(requestedCredit) || requestedCredit < 0 || requestedCredit > calculatedTotal) {
            throw new Error("El crédito solicitado es inválido o supera el total del pedido.");
        }
        if (orderData.paymentMethod === "Contado" && requestedCredit > 0) {
            throw new Error("Un pedido de contado no puede tener crédito solicitado.");
        }
        if (!["Contado", "Credito", "Mixto"].includes(orderData.paymentMethod)) {
            throw new Error("Forma de pago inválida");
        }
        if (orderData.paymentMethod === "Credito") {
            if (calculatedTotal < MINIMUM_CREDIT_AMOUNT) {
                throw new Error("El total del pedido debe ser mínimo de $10.000 para usar crédito.");
            }
            if (!client.cupoActivo || !client.cupoTotal) throw new Error("El cliente no tiene cupo de crédito habilitado.");
            const { calculateClientDebt } = await import("../../clients/infrastructure/ClientDebtHelper.js");
            const availableCredit = client.cupoTotal - await calculateClientDebt(client._id);
            if (calculatedTotal > availableCredit) throw new Error("El pedido supera el cupo de crédito disponible del cliente.");
        }
        if (orderData.paymentMethod === "Mixto") {
            if (requestedCredit <= 0) throw new Error("Debe indicar cuánto crédito desea utilizar.");
            if (calculatedTotal < MINIMUM_CREDIT_AMOUNT) throw new Error("El total del pedido debe ser mínimo de $10.000 para usar crédito.");
            if (requestedCredit < MINIMUM_CREDIT_AMOUNT) throw new Error("El monto a crédito debe ser mínimo de $10.000.");
            if (!client.cupoActivo || !client.cupoTotal) throw new Error("El cliente no tiene cupo de crédito habilitado.");
            const { calculateClientDebt } = await import("../../clients/infrastructure/ClientDebtHelper.js");
            const availableCredit = client.cupoTotal - await calculateClientDebt(client._id);
            if (requestedCredit > availableCredit) throw new Error("El crédito solicitado supera el cupo disponible.");
            if (calculatedTotal - requestedCredit < MINIMUM_CREDIT_AMOUNT) throw new Error("La parte de contado debe ser mínimo de $10.000.");
        }

        const finalCredit = orderData.paymentMethod === "Credito" ? calculatedTotal : requestedCredit;
        const updatedEntity = new OrderEntity({
            id,
            documentNumber: orderData.documentNumber,
            client: client._id,
            orderDate,
            dueDate: new Date(orderDate.getTime() + 2 * 86400000),
            products,
            paymentMethod: orderData.paymentMethod,
            requestedCredit: finalCredit,
            subtotal,
            iva,
            total: calculatedTotal,
            status: "Por procesar"
        });

        const allProductIds = new Set([...previousQuantities.keys(), ...requestedQuantities.keys()]);
        const changed = [];
        try {
            for (const productId of allProductIds) {
                const difference = (requestedQuantities.get(productId) || 0) - (previousQuantities.get(productId) || 0);
                if (difference) {
                    const updated = await this.productRepository.updateStock(productId, -difference);
                    if (!updated) throw new Error(`No se pudo actualizar el stock del producto ${productId}`);
                    changed.push({ productId, difference });
                }
            }
            const saved = await this.orderRepository.update(id, updatedEntity);
            if (!saved) throw new Error("No se pudo actualizar el pedido.");
            return saved;
        } catch (error) {
            for (const { productId, difference } of changed.reverse()) {
                await this.productRepository.updateStock(productId, difference);
            }
            throw error;
        }
    }
}
