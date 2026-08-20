/**
 * Controlador de productos.
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
 * - Crear producto
 * - Obtener todos los productos
 * - Obtener producto por ID
 * - Actualizar producto
 * - Eliminar producto
 * - Cambiar estado de producto
 */

import mongoose from "mongoose";

import CreateProductUseCase from "../application/CreateProductUseCase.js";
import GetProductsUseCase from "../application/GetProductsUseCase.js";
import GetProductByIdUseCase from "../application/GetProductByIdUseCase.js";
import UpdateProductUseCase from "../application/UpdateProductUseCase.js";
import DeleteProductUseCase from "../application/DeleteProductUseCase.js";
import ChangeStatusProductUseCase from "../application/ChangeStatusProductUseCase.js";
import ProductRepositoryMongo from "./ProductRepositoryMongo.js";
import ProductCategoryRepositoryMongo from "../../productCategory/infrastructure/ProductCategoryRepositoryMongo.js";
import { sendControllerError } from "../../../infrastructure/middlewares/errorHandler.js";

const productRepository = new ProductRepositoryMongo();
const productCategoryRepository = new ProductCategoryRepositoryMongo();

export const createProduct = async (req, res) => {
    try {
        const useCase = new CreateProductUseCase(productRepository, productCategoryRepository);
        const result = await useCase.execute(req.body);
        res.status(201).json({ message: "Producto registrado con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const getProducts = async (req, res) => {
    try {
        if (req.query.categoryId && !mongoose.Types.ObjectId.isValid(req.query.categoryId)) {
            return res.status(400).json({ error: "ID de categoría inválido" });
        }

        if (
            req.query.status !== undefined &&
            req.query.status !== "true" &&
            req.query.status !== "false"
        ) {
            return res.status(400).json({ error: "El estado debe ser true o false" });
        }

        const useCase = new GetProductsUseCase(productRepository);
        const result = await useCase.execute(req.query);
        res.json({ data: result.items, ...result });
    } catch (error) {
        sendControllerError(res, error, 500);
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetProductByIdUseCase(productRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ data: result });
    } catch (error) {
        sendControllerError(res, error, 500);
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new UpdateProductUseCase(productRepository, productCategoryRepository);
        const result = await useCase.execute(req.params.id, req.body);
        res.json({ message: "Producto actualizado con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new DeleteProductUseCase(productRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ message: "Producto eliminado con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const changeStatusProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new ChangeStatusProductUseCase(productRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ message: "Estado del producto actualizado con éxito", data: result });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};