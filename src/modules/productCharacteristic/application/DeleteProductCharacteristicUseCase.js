/**
 * Caso de uso: Eliminar característica
 */

export default class DeleteProductCharacteristicUseCase {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(id) {
        return await this.repository.delete(id);
    }
}
