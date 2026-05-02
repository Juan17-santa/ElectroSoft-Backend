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

        // Valida que el nuevo nombre no exista en otra categoria
        const existingCategory = await this.productCategoryRepository.findByName(name);
        if (existingCategory) {
            throw new Error("Esta categoría ya se encuentra registrada");
        }

        // Crear la entidad (aquí se validan reglas)
        const category = new ProductCategoryEntity({
            id,
            name,
            description,
            status,
        });

        // Guardar en base de datos
        return await this.productCategoryRepository.create(category);
    }
}