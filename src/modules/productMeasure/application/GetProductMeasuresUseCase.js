/**
 * Caso de uso: Obtener todas las medidas
 */

export default class GetProductMeasuresUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async execute() {
        return await this.repository.findAll();
    }
}
