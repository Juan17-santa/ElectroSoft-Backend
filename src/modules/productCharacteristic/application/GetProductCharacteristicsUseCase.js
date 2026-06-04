/**
 * Caso de uso: Obtener todas las características
 */

export default class GetProductCharacteristicsUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async execute() {
        return await this.repository.findAll();
    }
}
