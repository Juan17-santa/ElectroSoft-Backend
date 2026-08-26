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
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new Error("El producto no existe");
        }

        if (product.canDelete === false) {
            throw new Error("No se puede eliminar el producto porque tiene compras, ventas o pedidos asociados. Solo puede desactivarse.");
        }

        return await this.productRepository.delete(id);
    }
}
