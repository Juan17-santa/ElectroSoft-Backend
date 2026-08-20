/**
 * Caso de uso para cambiar el estado de una categoría de productos.
 * 
 * Responsabilidades:
 * - Verificar que la categoría exista.
 * - Cambiar su estado (activo/inactivo).
 * - Guardar el cambio en la base de datos.
 */

export default class ChangeStatusProductCategoryUseCase {
    constructor(productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(id) {
        const category = await this.productCategoryRepository.findById(id);

        if (!category) {
            throw new Error("La categoría no existe");
        }

        const newStatus = !category.status;

        return await this.productCategoryRepository.update(id, {
            status: newStatus
        });
    }
}