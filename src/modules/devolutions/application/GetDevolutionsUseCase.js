/**
 * Caso de uso para obtener todas las devoluciones.
 *
 * Responsabilidades:
 * - Solicitar al repositorio todas las devoluciones registradas.
 * - Mantener la lógica de consulta fuera del controlador.
 *
 * Nota:
 * - No aplica reglas de negocio adicionales.
 * - Los filtros o paginación pueden agregarse luego sin afectar infraestructura HTTP.
 */
export default class GetDevolutionsUseCase {
    constructor(devolutionRepository) {
        this.devolutionRepository = devolutionRepository;
    }

    async execute() {
        return await this.devolutionRepository.findAll();
    }
}
