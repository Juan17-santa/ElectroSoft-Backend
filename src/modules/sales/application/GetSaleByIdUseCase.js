/**
 * Caso de uso para obtener una venta por ID.
 *
 * Responsabilidades:
 * - Consultar una venta específica desde el repositorio.
 * - Lanzar error de negocio si la venta no existe.
 */
export default class GetSaleByIdUseCase {
    constructor(saleRepository) {
        this.saleRepository = saleRepository;
    }

    async execute(id) {
        const sale = await this.saleRepository.findById(id);

        if (!sale) {
            throw new Error("Venta no encontrada");
        }

        return sale;
    }
}
