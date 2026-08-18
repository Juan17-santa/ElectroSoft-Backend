/**
 * Caso de uso para obtener las devoluciones paginadas por grupo (venta).
 *
 * Responsabilidades:
 * - Solicitar al repositorio las devoluciones según página, límite, búsqueda
 *   y filtro de anuladas.
 * - Mantener la lógica de consulta fuera del controlador.
 *
 * Nota:
 * - La paginación vive en el repositorio (agregación por saleId).
 * - No aplica reglas de negocio adicionales.
 */
export default class GetDevolutionsUseCase {
    constructor(devolutionRepository) {
        this.devolutionRepository = devolutionRepository;
    }

    async execute({ page, limit, search, includeAnuladas } = {}) {
        return await this.devolutionRepository.findAll({ page, limit, search, includeAnuladas });
    }
}
