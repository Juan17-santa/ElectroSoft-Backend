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

    async findAll({ page = 1, limit = 15, search = "" } = {}) {
        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) || 15));
        const term = String(search || "").trim();
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = term
            ? { $or: [
                { providerName: { $regex: escapedTerm, $options: "i" } },
                { document: { $regex: escapedTerm, $options: "i" } },
                { providerEmail: { $regex: escapedTerm, $options: "i" } },
                { providerType: { $regex: escapedTerm, $options: "i" } },
            ] }
            : {};
        const total = await providerModel.countDocuments(filter);
        const providers = await providerModel.find(filter)
            .populate("documentType")
            .populate("categoriesAssociated")
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);

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
        return {
            items: providersWithRelations,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
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

    async findByEmail(providerEmail) {
        return await providerModel.findOne({ providerEmail });
    }

    async findByContactEmail(contactEmail) {
        return await providerModel.findOne({ contactEmail });
    }

    async update(id, providerData) {
        return await providerModel.findByIdAndUpdate(id, providerData, { returnDocument: "after", runValidators: true });
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