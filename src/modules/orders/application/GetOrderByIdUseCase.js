/**
 * Caso de uso para obtener un pedido por su ID.
 *
 * Responsabilidades:
 * - Aplicar la anulación automática antes de consultar.
 * - Buscar el pedido por ID.
 * - Validar existencia.
 */

export default class GetOrderByIdUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(id) {
        let order = await this.orderRepository.findById(id);

        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        const isExpired = order.status === "Por procesar" && new Date(order.dueDate) < new Date();

        if (isExpired) {
            order = await this.orderRepository.expireSingleOrder(order);
        }

        return order;
    }
}