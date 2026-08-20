/**
 * Caso de uso para crear una nueva categoría de productos.
 * 
 * Responsabilidades:
 * - Validar que el nombre no esté duplicado.
 * - Aplicar las reglas de la entidad (validaciones).
 * - Guardar la categoría en la base de datos.
 */

import ProductCategoryEntity from "../domain/ProductCategoryEntity.js";

export default class CreateProductCategoryUseCase {
    constructor(productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(categoryData) {
        const { id, name, description, status } = categoryData;

        const existingCategory = await this.productCategoryRepository.findByName(name);
        if (existingCategory) {
            throw new Error("Esta categoría ya se encuentra registrada");
        }

        const category = new ProductCategoryEntity({
            id,
            name,
            description,
            status,
        });

        return await this.productCategoryRepository.create(category);
    }
}