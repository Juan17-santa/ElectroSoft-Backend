/**
 * Caso de uso para cambiar el estado de un producto.
 * 
 * Responsabilidades:
 * - Verificar que el producto exista.
 * - Cambiar su estado (activo/inactivo).
 * - Guardar el cambio en la base de datos.
 */

export default class ChangeStatusProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(id) {
        // Verificar que el producto existe
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new Error("El producto no existe");
        }

        // Cambiar el estado (si estaba activo, se desactiva y viceversa)
        const newStatus = !product.estado;

        // Actualizar en base de datos
        return await this.productRepository.update(id, {
            estado: newStatus
        });
    }
}
