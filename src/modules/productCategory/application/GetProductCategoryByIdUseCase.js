/**
 * Caso de uso para obtener una categoría por su ID.
 * 
 * Responsabilidades:
 * - Buscar una categoría específica en la base de datos.
 * - Retornar la categoría si existe.
 */

export default class GetProductCategoryByIdUseCase {
    constructor(productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute (id) {
        const productCategory = await this.productCategoryRepository.findById(id);
        
        if (!productCategory) {
            throw new Error("La categoría no existe");
        }

        return productCategory;
    }
}