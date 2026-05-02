/**
 * Caso de uso para obtener todos los proveedores.
 * 
 * Responsabilidades:
 * - Consultar todos los proveedores registrados.
 * - Retornar la lista completa.
 */

export default class GetProvidersUseCase {
    constructor (providerRepository) {
        this.providerRepository = providerRepository
    }
    async execute () {
        return await this.providerRepository.findAll()
    }
}