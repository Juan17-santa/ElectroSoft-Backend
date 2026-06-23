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
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    async execute(id, reason) {
        await this.orderRepository.expirePendingOrders();

        if (!reason || typeof reason !== "string" || reason.trim().length < MIN_CANCEL_REASON_LENGTH) {
            throw new Error(
                `La razón de cancelación es obligatoria y debe tener al menos ${MIN_CANCEL_REASON_LENGTH} caracteres.`
            );
        }

        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        if (order.status !== "Pendiente") {
            throw new Error("Solo se puede cancelar un pedido que esté en estado Pendiente.");
        }

        for (const item of order.products) {
            await this.productRepository.updateStock(item.product, item.quantity);
        }

        return await this.orderRepository.update(id, {
            status: "Anulado",
            cancelReason: reason.trim(),
            canceledAt: new Date(),
        });
    }
}