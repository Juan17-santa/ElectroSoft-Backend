/**
 * Caso de uso para cambiar el estado de un proveedor.
 * 
 * Responsabilidades:
 * - Verificar que el proveedor exista.
 * - Cambiar su estado (activo/inactivo).
 * - Guardar el cambio en la base de datos.
 */

export default class ChangeStatusProviderUseCase {
    constructor(providerRepository) {
        this.providerRepository = providerRepository;
    }

    async execute(id) {
        const provider = await this.providerRepository.findById(id);

        if (!provider) {
            throw new Error("El proveedor no existe");
        }

        const newStatus = !provider.status;

        return await this.providerRepository.update(id, {
            status: newStatus
        });
    }
}