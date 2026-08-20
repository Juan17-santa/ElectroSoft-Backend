/**
 * Caso de uso para obtener todas las categorías de productos.
 * 
 * Responsabilidades:
 * - Consultar todas las categorías registradas.
 * - Retornar la lista completa.
 */

export default class GetProductCategoryUseCase {
    constructor (productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository
    }
    async execute (query = {}) {
        return await this.productCategoryRepository.findAll(query)
    }
}