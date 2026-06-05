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
        return await productModel.find()
            .populate("categoryId", "name description status")
            .sort({ createdAt: -1 });
    }

    async findById(id) {
        return await productModel.findById(id).populate("categoryId", "name description status");
    }

    async findByName(name) {
        return await productModel.findOne({ name });
    }

    async findBySerial(serial) {
        return await productModel.findOne({ serial });
    }

    async findByCategoryId(categoryId) {
        return await productModel.find({ categoryId: categoryId });
    }

    async update(id, productData) {
        return await productModel.findByIdAndUpdate(id, productData, { new: true }).populate("categoryId", "name description status");
    }

    async delete(id) {
        return await productModel.findByIdAndDelete(id);
    }

    async updateStock(id, quantity) {
        return await productModel.findByIdAndUpdate(
            id,
            { $inc: { stock: quantity } },
            { new: true }
        );
    }
}

export default ProductRepositoryMongo;
