/**
 * Caso de uso para obtener todos los pedidos.
 *
 * Responsabilidades:
 * - Ejecutar la anulación automática de pedidos pendientes vencidos.
 * - Retornar la lista de pedidos actualizada.
 */

export default class GetOrdersUseCase {
    constructor(orderRepository) {
        this.orderRepository = orderRepository;
    }

    async execute(query = {}) {
        await this.orderRepository.expirePendingOrders();
        return await this.orderRepository.findAll(query);
    }
}