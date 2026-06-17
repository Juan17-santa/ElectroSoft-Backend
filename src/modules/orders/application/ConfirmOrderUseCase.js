/**
 * Caso de uso para confirmar un pedido.
 *
 * Responsabilidades:
 * - Validar que el pedido exista.
 * - Validar que el pedido esté en estado "Pendiente".
 * - Eliminar el pedido del módulo orders.
 * - Preparar la información para su conversión futura a venta oficial.
 *
 * IMPORTANTE:
 * - El módulo sales aún no existe.
 * - Aquí NO se crea la venta oficial, solo se elimina el pedido de orders.
 * - Se retorna información estructurada para facilitar la integración futura con sales.
 */

const PAYMENT_METHOD_TO_SALE_STATUS = {
    Contado: "Finalizada",
    Credito: "Vigente",
};

export default class ConfirmOrderUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(id) {
        await this.orderRepository.expirePendingOrders();

        const order = await this.orderRepository.findById(id);

        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        if (order.status !== "Pendiente") {
            throw new Error("Solo se pueden confirmar pedidos en estado Pendiente");
        }

        const deletedOrder = await this.orderRepository.delete(id);

        return {
            order: deletedOrder,
            saleIntent: {
                paymentMethod: deletedOrder.paymentMethod,
                saleStatus: PAYMENT_METHOD_TO_SALE_STATUS[deletedOrder.paymentMethod] || "Finalizada",
                note: "Esta estructura está lista para integrarse con el módulo sales cuando esté disponible.",
            },
        };
    }
}
