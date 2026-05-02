/**
 * Caso de uso para obtener un proveedor por su ID.
 * 
 * Responsabilidades:
 * - Buscar un proveedor específico en la base de datos.
 * - Retornar el proveedor si existe.
 */

export default class GetProviderByIdUseCase {
    constructor(providerRepository) {
        this.providerRepository = providerRepository;
    }

    async execute(id) {
        const provider = await this.providerRepository.findById(id);

        if (!provider) {
            throw new Error("El proveedor no existe");
        }

        return provider;
    }
}