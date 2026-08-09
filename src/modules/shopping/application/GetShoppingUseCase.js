/**
 * Caso de uso para obtener compras paginadas.
 *
 * Responsabilidades:
 * - Solicitar al repositorio las compras según página, límite y búsqueda.
 * - Mantener la lógica de consulta fuera del controlador.
 *
 * Nota:
 * - La paginación vive en el repositorio para no mezclar infraestructura HTTP
 *   con la capa de aplicación.
 */
export default class GetShoppingUseCase {
    constructor(shoppingRepository) {
        this.shoppingRepository = shoppingRepository;
    }

    async execute({ page, limit, search } = {}) {
        return await this.shoppingRepository.findAll({ page, limit, search });
    }
}
