/**
 * Controlador de proveedores.
 * 
 * Maneja las peticiones HTTP y conecta con los casos de uso.
 * 
 * Responsabilidades:
 * - Recibir las solicitudes del cliente (req).
 * - Validar datos básicos (como el ID).
 * - Ejecutar los casos de uso correspondientes.
 * - Enviar respuestas al cliente (res).
 * 
 * Endpoints:
 * - Crear proveedor
 * - Obtener todos los proveedores
 * - Obtener proveedor por ID
 * - Actualizar proveedor
 * - Eliminar proveedor
 * - Cambiar estado de proveedor
 */

import mongoose from "mongoose";

import ChangeStatusProviderUseCase from "../application/ChangeStatusProviderUseCase.js";
import DeleteProviderUseCase from "../application/DeleteProviderUseCase.js";
import UpdateProviderUseCase from "../application/UpdateProviderUseCase.js";
import GetProviderByIdUseCase from "../application/GetProviderByIdUseCase.js";
import GetProvidersUseCase from "../application/GetProvidersUseCase.js";
import CreateProviderUseCase from "../application/CreateProviderUseCase.js";
import ProviderRepositoryMongo from "./ProviderRepositoryMongo.js";
import DocumentTypeRepositoryMongo from "../../../shared/infrastructure/repositories/DocumentTypeRepositoryMongo.js"
import ProductCategoryRepositoryMongo from "../../productCategory/infrastructure/ProductCategoryRepositoryMongo.js"
// import ShoppingRepositoryMongo from "../../products/infrastructure/ShoppingRepositoryMongo";

// const shoppingRepository = new ShoppingRepositoryMongo();
const providerRepository = new ProviderRepositoryMongo();
const documentTypeRepository = new DocumentTypeRepositoryMongo();
const productCategoryRepository = new ProductCategoryRepositoryMongo();


export const createProvider = async (req, res) => {
    try {
        const useCase = new CreateProviderUseCase(providerRepository, documentTypeRepository, productCategoryRepository);
        const result = await useCase.execute(req.body);
        res.status(201).json({ message: "Proveedor registrado con éxito.", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getProviders = async (req, res) => {
    try {
        const useCase = new GetProvidersUseCase(providerRepository)
        const result = await useCase.execute();
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getProviderById = async (req, res) => {
    try {
        // Validar que el ID sea un ObjectId válido
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetProviderByIdUseCase(providerRepository)
        const result = await useCase.execute(req.params.id);
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateProvider = async (req, res) => {
    try {
        // Validar que el ID sea un ObjectId válido
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new UpdateProviderUseCase(providerRepository, documentTypeRepository, productCategoryRepository);
        const result = await useCase.execute(req.params.id, req.body);
        res.json({ message: "Proveedor actualizado con éxito.", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProvider = async (req, res) => {
    try {
        // Validar que el ID sea un ObjectId válido
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new DeleteProviderUseCase(providerRepository);
        // const useCase = new DeleteProviderUseCase(providerRepository, shoppingRepository);

        // NOTA:
        // Este caso de uso debería validar que el proveedor no tenga
        // compras asociadas antes de eliminar.
        // 
        // Actualmente no se realiza esta validación porque el
        // repositorio de compras aún no esta implementado.
        // 
        // Cuando estén disponibles, se utilizaran en este controlador para realizar 
        // la validación necesaria y evitar eliminar proveedores con relaciones activas.

        const result = await useCase.execute(req.params.id);
        res.json({ message: "El proveedor ha sido eliminado con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const changeStatusProvider = async (req, res) => {
    try {
        // Validar que el ID sea un ObjectId válido
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new ChangeStatusProviderUseCase(providerRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ message: "Estado del proveedor actualizado con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};