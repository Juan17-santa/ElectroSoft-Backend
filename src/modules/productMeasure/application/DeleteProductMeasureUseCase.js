/**
 * Caso de uso: Eliminar medida
 */

export default class DeleteProductMeasureUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(id) {
        return await this.repository.delete(id);
    }
}
