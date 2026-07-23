/**
 * Repositorio de proveedores (MongoDB).
 * 
 * Se encarga de interactuar directamente con la base de datos.
 * Implementa las operaciones CRUD para los proveedores.
 * 
 * Métodos:
 * - create: crea un nuevo proveedor.
 * - findAll: obtiene todos los proveedores.
 * - findById: busca un proveedor por ID.
 * - findByDocument: busca un proveedor por documento (para evitar duplicados).
 * - update: actualiza un proveedor existente.
 * - delete: elimina un proveedor.
 */

import { providerModel } from "./ProviderModel.js"
import { shoppingModel } from "../../shopping/infrastructure/ShoppingModel.js";

class ProviderRepositoryMongo {

    async create(providerData) {
        const provider = new providerModel(providerData);
        return await provider.save();
    }

    async findAll() {
        const providers = await providerModel.find()
            .populate("documentType")
            .populate("categoriesAssociated")
            .sort({ createdAt: -1 });

        const providersWithRelations = await Promise.all(
            providers.map(async (provider) => {

                const shoppingCount = await shoppingModel.countDocuments({
                    providerId: provider._id
                });

                return {
                    ...provider.toObject(),
                    shoppingCount,
                    canDelete: shoppingCount === 0,
                    deleteReason:
                        shoppingCount > 0
                            ? `Tiene ${shoppingCount} compra(s) asociada(s)`
                            : null
                };
            })
        );
        return providersWithRelations;
    }

    async findById(id) {
        const provider = await providerModel.findById(id)
            .populate("documentType")
            .populate("categoriesAssociated");

        if (!provider) return null;

        const shoppingCount = await shoppingModel.countDocuments({
            providerId: provider._id
        });

        return {
            ...provider.toObject(),
            shoppingCount,
            canDelete: shoppingCount === 0,
            deleteReason:
                shoppingCount > 0
                    ? `Tiene ${shoppingCount} compra(s) asociada(s)`
                    : null
        };
    }

    async findByDocument(document) {
        return await providerModel.findOne({ document });
    }

    async findByEmail(email) {
        return await providerModel.findOne({ email });
    }

    async update(id, providerData) {
        return await providerModel.findByIdAndUpdate(id, providerData, { new: true, runValidators: true });
    }

    async delete(id) {
        return await providerModel.findByIdAndDelete(id);
    }

    async findByCategoryId(categoryId) {
        return await providerModel.find({
            categoriesAssociated: categoryId
        });
    }
}

export default ProviderRepositoryMongo;