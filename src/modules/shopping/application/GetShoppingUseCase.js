/**
 * Caso de uso para obtener todas las compras.
 *
 * Responsabilidades:
 * - Solicitar al repositorio todas las compras registradas.
 * - Mantener la lógica de consulta fuera del controlador.
 *
 * Nota:
 * - No aplica reglas de negocio adicionales.
 * - Los filtros o paginación pueden agregarse luego sin afectar infraestructura HTTP.
 */
export default class GetShoppingUseCase {
    constructor(shoppingRepository) {
        this.shoppingRepository = shoppingRepository;
    }

    async execute() {
        return await this.shoppingRepository.findAll();
    }
}
