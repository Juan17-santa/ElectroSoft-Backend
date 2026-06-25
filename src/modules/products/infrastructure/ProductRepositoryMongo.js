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
import { orderModel } from "../../orders/infrastructure/OrderModel.js";
import { saleModel } from "../../sales/infrastructure/SaleModel.js";

class ProductRepositoryMongo {

    async create(productData) {
        const product = new productModel(productData);
        return await product.save();
    }

    async findAll() {
        const products = await productModel.find()
            .populate("categoryId", "name description status")
            .sort({ createdAt: -1 });

        const productIds = products.map(product => product._id);
        const associatedIds = await this.buildAssociatedProductIds(productIds);

        return products.map(product => {
            const item = product.toObject();
            return {
                ...item,
                canDelete: !associatedIds.has(item._id.toString())
            };
        });
    }

    async findById(id) {
        const product = await productModel.findById(id).populate("categoryId", "name description status");
        if (!product) return null;

        const associatedIds = await this.buildAssociatedProductIds([product._id]);
        const item = product.toObject();

        return {
            ...item,
            canDelete: !associatedIds.has(item._id.toString())
        };
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

    async updateStock(id, quantity, session) {
        return await productModel.findByIdAndUpdate(
            id,
            { $inc: { stock: quantity } },
            { new: true, session }
        );
    }

    async buildAssociatedProductIds(productIds) {
        if (!productIds || productIds.length === 0) {
            return new Set();
        }

        const orderAssociations = await orderModel.aggregate([
            { $match: { "products.product": { $in: productIds } } },
            { $unwind: "$products" },
            { $match: { "products.product": { $in: productIds } } },
            { $group: { _id: "$products.product" } }
        ]);

        const saleAssociations = await saleModel.aggregate([
            { $match: { "productos.productoId": { $in: productIds } } },
            { $unwind: "$productos" },
            { $match: { "productos.productoId": { $in: productIds } } },
            { $group: { _id: "$productos.productoId" } }
        ]);

        const associatedIds = new Set();
        orderAssociations.forEach(item => associatedIds.add(item._id.toString()));
        saleAssociations.forEach(item => associatedIds.add(item._id.toString()));

        return associatedIds;
    }
}

export default ProductRepositoryMongo;
