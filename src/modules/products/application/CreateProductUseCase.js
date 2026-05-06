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
        const { nombre, categoriaId, precio, stock, tipoStock, serial, garantia, caracteristicas } = productData;

        // Verificar que la categoría exista
        const category = await this.productCategoryRepository.findById(categoriaId);
        if (!category) {
            throw new Error("La categoría seleccionada no existe");
        }

        // Crear la entidad (aquí se validan reglas de negocio)
        const product = new ProductEntity({
            nombre,
            categoriaId,
            precio: Number(precio),
            stock: Number(stock),
            tipoStock,
            serial,
            garantia,
            caracteristicas: caracteristicas || []
        });

        // Guardar en base de datos
        return await this.productRepository.create(product);
    }
}
