/**
 * Caso de uso para obtener una compra por ID.
 *
 * Responsabilidades:
 * - Consultar una compra específica desde el repositorio.
 * - Lanzar error de negocio si la compra no existe.
 *
 * Nota:
 * - El controlador solo transforma este resultado en respuesta HTTP.
 */
export default class GetShoppingByIdUseCase {
    constructor(shoppingRepository) {
        this.shoppingRepository = shoppingRepository;
    }

    async execute(id) {
        const shopping = await this.shoppingRepository.findById(id);

        if (!shopping) {
            throw new Error("Compra no encontrada");
        }

        return shopping;
    }
}
