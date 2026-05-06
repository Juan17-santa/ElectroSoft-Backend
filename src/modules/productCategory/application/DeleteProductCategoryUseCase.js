/**
 * Caso de uso para eliminar una categoría de productos.
 * 
 * Responsabilidades:
 * - Verificar que la categoría exista.
 * - Validar que no tenga productos o proveedores asociados (si aplica).
 * - Eliminar la categoría de la base de datos.
 */

export default class DeleteProductCategoryUseCase {
    constructor(productCategoryRepository, productRepository, providerRepository) {
        this.productCategoryRepository = productCategoryRepository;
        this.productRepository = productRepository;
        this.providerRepository = providerRepository;
    }

    async execute(id) {
        // Verificar que la categoría existe
        const category = await this.productCategoryRepository.findById(id);
        if (!category) {
            throw new Error("La categoría no existe");
        }

        // Verificar que no tenga productos o proveedores asociados
        const products = await this.productRepository.findByCategoryId(id);
        const providers = await this.providerRepository.findByCategoryId(id);

        if (products.length > 0 || providers.length > 0) {
            let mensaje = "No se puede eliminar: esta categoría tiene ";

            if (products.length > 0) mensaje += `${products.length} producto(s)`;
            if (products.length > 0 && providers.length > 0) mensaje += " y ";
            if (providers.length > 0) mensaje += `${providers.length} proveedor(es)`;

            mensaje += " asociados.";

            throw new Error(mensaje);
        }

        // Eliminar la categoría
        return await this.productCategoryRepository.delete(id);
    }
}