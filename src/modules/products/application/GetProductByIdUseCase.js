/**
 * Caso de uso para obtener un producto por su ID.
 * 
 * Responsabilidades:
 * - Buscar un producto específico en la base de datos.
 * - Retornar el producto si existe.
 */

export default class GetProductByIdUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(id) {
        const product = await this.productRepository.findById(id);

        if (!product) {
            throw new Error("El producto no existe");
        }

        return product;
    }
}
