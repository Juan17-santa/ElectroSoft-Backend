/**
 * Controlador de categorías de productos.
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
 * - Crear categoría
 * - Obtener todas las categorías
 * - Obtener categoría por ID
 * - Actualizar categoría
 * - Eliminar categoría
 * - Cambiar estado de categoría
 */

import mongoose from "mongoose";

import ChangeStatusProductCategoryUseCase from "../application/ChangeStatusProductCategoryUseCase.js";
import DeleteProductCategoryUseCase from "../application/DeleteProductCategoryUseCase.js";
import UpdateProductCategoryUseCase from "../application/UpdateProductCategoryUseCase.js";
import GetProductCategoryByIdUseCase from "../application/GetProductCategoryByIdUseCase.js";
import GetProductCategoryUseCase from "../application/GetProductCategoryUseCase.js";
import CreateProductCategoryUseCase from "../application/CreateProductCategoryUseCase.js";
import ProductCategoryRepositoryMongo from "./ProductCategoryRepositoryMongo.js";
import ProviderRepositoryMongo from "../../providers/infrastructure/ProviderRepositoryMongo.js";
import ProductRepositoryMongo from "../../products/infrastructure/ProductRepositoryMongo.js";
import { sendControllerError } from "../../../infrastructure/middlewares/errorHandler.js";

const productRepository = new ProductRepositoryMongo();
const providerRepository = new ProviderRepositoryMongo();
const productCategoryRepository = new ProductCategoryRepositoryMongo();

export const createProductCategory = async (req, res) => {
    try {
        const useCase = new CreateProductCategoryUseCase(productCategoryRepository);
        const result = await useCase.execute(req.body);
        res.status(201).json({ message: "Categoría registrada con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
}

export const getProductCategory = async (req, res) => {
    try {
        const useCase = new GetProductCategoryUseCase(productCategoryRepository)
        const result = await useCase.execute(req.query);
        res.json({ data: result.items, ...result });
    } catch (error) {
        sendControllerError(res, error, 500);
    }
}

export const getProductCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetProductCategoryByIdUseCase(productCategoryRepository)
        const result = await useCase.execute(req.params.id);
        res.json({ data: result });
    } catch (error) {
        sendControllerError(res, error, 500);
    }
}

export const updateProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new UpdateProductCategoryUseCase(productCategoryRepository);
        const result = await useCase.execute(req.params.id, req.body);
        res.json({ message: "Categoría actualizada con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const deleteProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new DeleteProductCategoryUseCase(productCategoryRepository, productRepository, providerRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ message: "Categoría eliminada con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const changeStatusProductCategory = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new ChangeStatusProductCategoryUseCase(productCategoryRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ message: "Estado de la categoría actualizada con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};