/**
 * Caso de uso para crear un nuevo producto.
 * 
 * Responsabilidades:
 * - Validar que la categoría exista.
 * - Validar que el serial sea único.
 * - Aplicar las reglas de la entidad (validaciones).
 * - Guardar el producto en la base de datos.
 */

import ProductEntity from "../domain/ProductEntity.js";
import mongoose from "mongoose";

export default class CreateProductUseCase {
    constructor(productRepository, productCategoryRepository) {
        this.productRepository = productRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(productData) {
        const { name, categoryId, price, stock, typeStock, serial, warranty, characteristics } = productData;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error("La categoría seleccionada no es válida");
        }

        const category = await this.productCategoryRepository.findById(categoryId);
        if (!category) {
            throw new Error("La categoría seleccionada no existe");
        }

        const existingProduct = await this.productRepository.findBySerial(serial);
        if (existingProduct) {
            throw new Error("El serial ya existe en otro producto");
        }

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

        return await this.productRepository.create(product);
    }
}
