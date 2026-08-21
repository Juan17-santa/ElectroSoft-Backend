/**
 * Caso de uso para obtener todas las ventas.
 *
 * Responsabilidades:
 * - Consultar todas las ventas desde el repositorio.
 * - Retornar la lista ordenada por fechaCreacion descendente.
 */
export default class GetSalesUseCase {
    constructor(saleRepository) {
        this.saleRepository = saleRepository;
    }

    async execute(options = {}) {
        return await this.saleRepository.findAll(options);
    }
}