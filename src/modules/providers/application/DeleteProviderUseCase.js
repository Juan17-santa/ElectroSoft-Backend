/**
 * Caso de uso para eliminar un proveedor.
 * 
 * Responsabilidades:
 * - Verificar que el proveedor exista.
 * - Validar que no tenga compras asociadas.
 * - Eliminar el proveedor.
 */

export default class DeleteProviderUseCase {
    constructor(providerRepository, shoppingRepository) {
        this.providerRepository = providerRepository;
        this.shoppingRepository = shoppingRepository;
    }

    async execute(id) {

        // Validar que el proveedor existe
        const provider = await this.providerRepository.findById(id);
        if (!provider) {
            throw new Error("El proveedor no existe");
        }

        // Validar si tiene compras asociadas
        const comprasAsociadas = await this.shoppingRepository.findByProviderId(id);

        if (comprasAsociadas.length > 0) {
            throw new Error(
                `No se puede eliminar: Este proveedor tiene ${comprasAsociadas.length} compra(s) asociada(s).`
            );
        }

        // Eliminar proveedor
        return await this.providerRepository.delete(id);
    }
}