/**
 * Caso de uso para eliminar un producto.
 * 
 * Responsabilidades:
 * - Verificar que el producto exista.
 * - Eliminar el producto de la base de datos.
 */

export default class DeleteProductUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(id) {
        // Verificar que el producto existe
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error("El producto no existe");
        }

        // Eliminar el producto
        return await this.productRepository.delete(id);
    }
}
