/**
 * Caso de uso para crear un nuevo producto.
 * 
 * Responsabilidades:
 * - Validar que la categoría exista.
 * - Aplicar las reglas de la entidad (validaciones).
 * - Guardar el producto en la base de datos.
 */

import ProductEntity from "../domain/ProductEntity.js";

export default class CreateProductUseCase {
    constructor(productRepository, productCategoryRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(productData) {
        const { name, categoryId, price, stock, typeStock, serial, warranty, characteristics } = productData;

        // Verificar que la categoría exista
        const category = await this.productCategoryRepository.findById(categoryId);
        if (!category) {
            throw new Error("La categoría seleccionada no existe");
        }

        // Verificar que el serial sea único
        const existingProduct = await this.productRepository.findBySerial(serial);
        if (existingProduct) {
            throw new Error("El serial ya existe en otro producto");
        }

        // Crear la entidad (aquí se validan reglas de negocio)
        const product = new ProductEntity({
            name,
            categoryId,
            price: Number(price),
            stock: Number(stock),
            typeStock,
            serial,
            warranty,
            characteristics: characteristics || []
        });

        // Guardar en base de datos
        return await this.productRepository.create(product);
    }
}
