/**
 * Caso de uso para actualizar una categoría de productos.
 * 
 * Responsabilidades:
 * - Verificar que la categoría exista.
 * - Validar que el nuevo nombre no esté duplicado.
 * - Aplicar las reglas de la entidad (validaciones).
 * - Actualizar nombre y descripción.
 */

import ProductCategoryEntity from "../domain/ProductCategoryEntity.js";

export default class UpdateProductCategoryUseCase {
    constructor(productCategoryRepository) {
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(id, productCategoryData) {
        const { name, description } = productCategoryData;

        // Verifica si la categoria existe
        const existingCategory = await this.productCategoryRepository.findById(id);
        if (!existingCategory) {
            throw new Error("La categoría no existe");
        }

        // Valida que el nuevo nombre no exista en otra categoria
        if (name && name !== existingCategory.name) {
            const exists = await this.productCategoryRepository.findByName(name);
            if (exists) {
                throw new Error("Esta categoría ya se encuentra registrada");
            }
        }

        // Crear la entidad con los datos actualizados (aquí se validan reglas)
        const updatedCategory = new ProductCategoryEntity({
            id,
            name,
            description,
            status: existingCategory.status
        });

        // Actualizar en base de datos
        return await this.productCategoryRepository.update(id, updatedCategory);
    }
}