/**
 * Repositorio de categorías de productos (MongoDB).
 * 
 * Se encarga de interactuar directamente con la base de datos.
 * Implementa las operaciones CRUD para las categorías.
 * 
 * Métodos:
 * - create: crea una nueva categoría.
 * - findAll: obtiene todas las categorías.
 * - findById: busca una categoría por ID.
 * - findByName: busca una categoría por nombre (para evitar duplicados).
 * - update: actualiza una categoría existente.
 * - delete: elimina una categoría.
 */

import { productCategoryModel } from "./ProductCategoryModel.js";

class ProductCategoryRepositoryMongo {

    async create(categoryData) {
        const category = new productCategoryModel(categoryData);
        return await category.save();
    }

    async findAll() {
        return await productCategoryModel.find();
    }

    async findById(id) {
        return await productCategoryModel.findById(id);
    }

    async findByIds(ids) {
        return await productCategoryModel.find({
            _id: { $in: ids }
        });
    }

    async findByName(name) {
        return await productCategoryModel.findOne({ name });
    }

    async update(id, categoryData) {
        return await productCategoryModel.findByIdAndUpdate(id, categoryData, { new: true });
    }

    async delete(id) {
        return await productCategoryModel.findByIdAndDelete(id);
    }
}

export default ProductCategoryRepositoryMongo;