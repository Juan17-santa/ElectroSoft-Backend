/**
 * Caso de uso para obtener una devolución por ID.
 *
 * Responsabilidades:
 * - Consultar una devolución específica desde el repositorio.
 * - Lanzar error de negocio si la devolución no existe.
 *
 * Nota:
 * - El controlador solo transforma este resultado en respuesta HTTP.
 */
export default class GetDevolutionByIdUseCase {
    constructor(devolutionRepository) {
        this.devolutionRepository = devolutionRepository;
    }

    async execute(id) {
        const devolution = await this.devolutionRepository.findById(id);

        if (!devolution) {
            throw new Error("Devolucion no encontrada");
        }

        return devolution;
    }
}
