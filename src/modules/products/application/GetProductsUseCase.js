/**
 * Caso de uso para obtener todos los productos.
 * 
 * Responsabilidades:
 * - Consultar todos los productos registrados.
 * - Retornar la lista completa.
 */

export default class GetProductsUseCase {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute() {
        return await this.productRepository.findAll();
    }
}