/**
 * Repositorio de productos (MongoDB).
 * 
 * Se encarga de interactuar directamente con la base de datos.
 * Implementa las operaciones CRUD para los productos.
 * 
 * Métodos:
 * - create: crea un nuevo producto.
 * - findAll: obtiene todos los productos (con populate de categoría).
 * - findById: busca un producto por ID (con populate de categoría).
 * - findByName: busca un producto por nombre (para evitar duplicados).
 * - findByCategoryId: busca productos por categoría (para validaciones).
 * - update: actualiza un producto existente.
 * - delete: elimina un producto.
 */

import { productModel } from "./ProductModel.js";

class ProductRepositoryMongo {

    async create(productData) {
        const product = new productModel(productData);
        return await product.save();
    }

    async findAll() {
        return await productModel.find().populate("categoriaId", "name description status");
    }

    async findById(id) {
        return await productModel.findById(id).populate("categoriaId", "name description status");
    }

    async findByName(nombre) {
        return await productModel.findOne({ nombre });
    }

    async findByCategoryId(categoryId) {
        return await productModel.find({ categoriaId: categoryId });
    }
    async findByCategoryId(categoryId) {
        return await ProductModel.find({ categoriaId: categoryId });
    }

    async update(id, productData) {
        return await productModel.findByIdAndUpdate(id, productData, { new: true }).populate("categoriaId", "name description status");
    }

    async delete(id) {
        return await productModel.findByIdAndDelete(id);
    }

}

export default ProductRepositoryMongo;
