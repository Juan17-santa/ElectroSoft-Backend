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
import { productModel } from "../../products/infrastructure/ProductModel.js";
import { providerModel } from "../../providers/infrastructure/ProviderModel.js";

class ProductCategoryRepositoryMongo {

    async create(categoryData) {
        const category = new productCategoryModel(categoryData);
        return await category.save();
    }

    async findAll() {
        const categories = await productCategoryModel
            .find()
            .sort({ createdAt: -1 });

        const categoriesWithRelations = await Promise.all(
            categories.map(async (category) => {

                const productsCount = await productModel.countDocuments({
                    categoryId: category._id
                });

                const providersCount = await providerModel.countDocuments({
                    categoriesAssociated: category._id
                });

                return {
                    ...category.toObject(),
                    productsCount,
                    providersCount,
                    canDelete: productsCount === 0 && providersCount === 0,
                    deleteReason:
                        productsCount > 0 && providersCount > 0
                            ? `Tiene ${productsCount} productos y ${providersCount} proveedores asociados`
                            : productsCount > 0
                                ? `Tiene ${productsCount} productos asociados`
                                : providersCount > 0
                                    ? `Tiene ${providersCount} proveedores asociados`
                                    : null
                };
            })
        );
        return categoriesWithRelations;
    }

    async findById(id) {
        const category = await productCategoryModel.findById(id);

        if (!category) return null;

        const productsCount = await productModel.countDocuments({
            categoryId: category._id
        });

        const providersCount = await providerModel.countDocuments({
            categoriesAssociated: category._id
        });

        return {
            ...category.toObject(),
            productsCount,
            providersCount,
            canDelete: productsCount === 0 && providersCount === 0
        };
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
        return await productCategoryModel.findByIdAndUpdate(id, categoryData, { returnDocument: "after" });
    }

    async delete(id) {
        return await productCategoryModel.findByIdAndDelete(id);
    }
}

export default ProductCategoryRepositoryMongo;