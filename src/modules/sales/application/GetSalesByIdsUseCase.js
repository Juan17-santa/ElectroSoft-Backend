/**
 * Caso de uso para obtener ventas específicas por sus IDs.
 *
 * Responsabilidades:
 * - Consultar solo las ventas indicadas (acota el tráfico frente a findAll).
 * - Retornar la lista en el orden original cuando sea posible.
 */
export default class GetSalesByIdsUseCase {
    constructor(saleRepository) {
        this.saleRepository = saleRepository;
    }

    async execute(ids) {
        return await this.saleRepository.findByIds(ids);
    }
}
