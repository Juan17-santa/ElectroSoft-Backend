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

class ProviderRepositoryMongo {

    async create(providerData) {
        const provider = new providerModel(providerData);
        return await provider.save();
    }

    async findAll() {
        return await providerModel.find();
    }

    async findById(id) {
        return await providerModel.findById(id);
    }

    async findByDocument(document) {
        return await providerModel.findOne({ document });
    }

    async update(id, providerData) {
        return await providerModel.findByIdAndUpdate(id, providerData, { new: true });
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