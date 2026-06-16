import OrderEntity from "../domain/OrderEntity.js";

export default class CreateOrderUseCase {
    constructor(orderRepository, clientRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.clientRepository = clientRepository;
        this.productRepository = productRepository;
    }

    async execute(orderData) {
        // 🛡️ 1. CONTROL DE NULOS PREVENTIVO (Para que no colapse al leer propiedades)
        if (!orderData) {
            throw new Error("No se recibieron datos para procesar el pedido.");
        }
        if (!orderData.products || !Array.isArray(orderData.products)) {
            throw new Error("Debe agregar al menos un producto");
        }

        // 2. Verificar si el cliente existe antes de avanzar
        const clientExists = await this.clientRepository.findById(orderData.client);
        if (!clientExists) {
            throw new Error("Cliente no encontrado"); // Mismo mensaje de tu entidad para mantener coherencia
        }

        // 3. Calcular automáticamente las fechas (Max 4 días atrás)
        const orderDate = orderData.orderDate ? new Date(orderData.orderDate) : new Date();
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() - 4);

        if (orderDate > today) throw new Error("La fecha del pedido no puede ser futura.");
        if (orderDate < minDate) throw new Error("La fecha del pedido no puede ser mayor a 4 días de antigüedad.");

        const dueDate = new Date(orderDate);
        dueDate.setDate(dueDate.getDate() + 15);

        // 4. Recalcular, verificar Precios y validar STOCK
        let calculatedTotal = 0;
        const validatedProducts = [];

        for (const item of orderData.products) {
            // Validación preventiva rápida por si mandan [{}] vacío dentro del array
            if (!item.product) {
                throw new Error("Debe incluir el identificador del producto.");
            }

            const dbProduct = await this.productRepository.findById(item.product);
            if (!dbProduct) {
                throw new Error(`El producto con ID ${item.product} no existe.`);
            }

            // 🔥 VALIDACIÓN DE STOCK
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

        // Calcular IVA y Subtotal
        const IVA_PERCENTAGE = 0.19;
        const calculatedIva = Math.round(calculatedTotal * IVA_PERCENTAGE);
        const calculatedSubtotal = calculatedTotal - calculatedIva;

        // 5. Validar Regla de Negocio: Crédito
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

        // 6. Instanciar la Entidad de Dominio
        // Aquí es donde actúan TODAS las validaciones de formato de tu OrderEntity (documento, tipos de datos, etc.)
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

        // 7. 🔥 DESCONTAR EL STOCK EN LA BASE DE DATOS (Solo si la entidad se creó sin errores)
        for (const item of validatedProducts) {
            await this.productRepository.updateStock(item.product, -item.quantity);
        }

        // 8. Guardar el Pedido
        const savedOrder = await this.orderRepository.create(newOrderEntity);
        return savedOrder;
    }
}