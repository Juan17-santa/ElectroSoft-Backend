/**
 * Caso de uso: Crear característica
 */

import ProductCharacteristicEntity from "../domain/ProductCharacteristicEntity.js";

export default class CreateProductCharacteristicUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(characteristicData) {
        const { name } = characteristicData;

        // Verificar que no exista una característica con el mismo nombre
        const existing = await this.repository.findByName(name);
        if (existing) {
            throw new Error("Esta característica ya existe");
        }

        // Crear la entidad (validaciones)
        const characteristic = new ProductCharacteristicEntity({ name });

        // Guardar en base de datos
        return await this.repository.create(characteristic);
    }
}
