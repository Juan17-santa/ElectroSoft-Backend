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
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new Error("El producto no existe");
        }

        const newStatus = !product.status;

        return await this.productRepository.update(id, {
            status: newStatus
        });
    }
}
