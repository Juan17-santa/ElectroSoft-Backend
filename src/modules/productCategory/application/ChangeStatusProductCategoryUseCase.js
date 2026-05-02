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
        // Verificar que la categoría existe
        const category = await this.productCategoryRepository.findById(id);

        if (!category) {
            throw new Error("La categoría no existe");
        }

        // Cambiar el estado (si estaba activo, se desactiva y viceversa)
        const newStatus = !category.status;

        // Actualizar en base de datos
        return await this.productCategoryRepository.update(id, {
            status: newStatus
        });
    }
}