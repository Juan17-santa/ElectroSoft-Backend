/**
 * Caso de uso: Crear medida
 */

import ProductMeasureEntity from "../domain/ProductMeasureEntity.js";

export default class CreateProductMeasureUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(measureData) {
        const { name } = measureData;

        // Verificar que no exista una medida con el mismo nombre
        const existing = await this.repository.findByName(name);
        if (existing) {
            throw new Error("Esta medida ya existe");
        }

        // Crear la entidad (validaciones)
        const measure = new ProductMeasureEntity({ name });

        // Guardar en base de datos
        return await this.repository.create(measure);
    }
}
