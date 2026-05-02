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
        // Verificar que el proveedor existe
        const provider = await this.providerRepository.findById(id);

        if (!provider) {
            throw new Error("El proveedor no existe");
        }

        // Cambiar el estado (si estaba activo, se desactiva y viceversa)
        const newStatus = !provider.status;

        // Actualizar en base de datos
        return await this.providerRepository.update(id, {
            status: newStatus
        });
    }
}