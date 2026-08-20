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

    async findAll({ page = 1, limit = 15, search = "" } = {}) {
        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) || 15));
        const term = String(search || "").trim();
        const filter = term
            ? { $or: [
                { name: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
                { description: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
            ] }
            : {};
        const total = await productCategoryModel.countDocuments(filter);
        const categories = await productCategoryModel
            .find(filter)
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);

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
        return {
            items: categoriesWithRelations,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
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
        return await productCategoryModel.findByIdAndUpdate(id, categoryData, {
            returnDocument: "after",
            runValidators: true,
        });
    }

    async delete(id) {
        return await productCategoryModel.findByIdAndDelete(id);
    }
}

export default ProductCategoryRepositoryMongo;