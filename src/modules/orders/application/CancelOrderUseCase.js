/**
 * Caso de uso para cancelar un pedido manualmente.
 *
 * Responsabilidades:
 * - Validar la razón de cancelación (Mínimo 20 caracteres).
 * - Validar que el pedido exista.
 * - Validar que el pedido esté en estado "Pendiente".
 * - Devolver las cantidades de los productos al stock.
 * - Cambiar el estado del pedido a "Anulado".
 */

const MIN_CANCEL_REASON_LENGTH = 20;

export default class CancelOrderUseCase {
    // ➕ Agregamos el productRepository al constructor
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async execute(id, reason) {
        // 1. Ejecutar la expiración pasiva antes de evaluar
        await this.orderRepository.expirePendingOrders();

        // 2. Validar la razón de cancelación (Mínimo de caracteres)
        if (!reason || typeof reason !== "string" || reason.trim().length < MIN_CANCEL_REASON_LENGTH) {
            throw new Error(
                `La razón de cancelación es obligatoria y debe tener al menos ${MIN_CANCEL_REASON_LENGTH} caracteres.`
            );
        }

        // 3. Buscar que el pedido exista
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        // 🛡️ 4. Validar estado (Evita doble anulación)
        if (order.status !== "Pendiente") {
            throw new Error("Solo se puede cancelar un pedido que esté en estado Pendiente.");
        }

        // ⚡ 5. DEVOLVER EL STOCK AL INVENTARIO
        // Recorremos los productos que tenía el pedido y sumamos sus cantidades de vuelta
        for (const item of order.products) {
            // Mandamos la cantidad en positivo para que el repositorio incremente el stock
            await this.productRepository.updateStock(item.product, item.quantity);
        }

        // 6. Actualizar el pedido con el motivo y el nuevo estado
        return await this.orderRepository.update(id, {
            status: "Anulado",
            cancelReason: reason.trim(),
            canceledAt: new Date(),
        });
    }
}