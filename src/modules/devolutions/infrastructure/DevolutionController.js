import AnularDevolutionUseCase from "../application/AnularDevolutionUseCase.js";
import ConfirmDevolutionUseCase from "../application/ConfirmDevolutionUseCase.js";
import CreateBatchDevolutionUseCase from "../application/CreateBatchDevolutionUseCase.js";
import CreateDevolutionUseCase from "../application/CreateDevolutionUseCase.js";
import GetDevolutionByIdUseCase from "../application/GetDevolutionByIdUseCase.js";
import GetDevolutionsUseCase from "../application/GetDevolutionsUseCase.js";
import UpdateDevolutionUseCase from "../application/UpdateDevolutionUseCase.js";
import DevolutionRepositoryMongo from "./DevolutionRepositoryMongo.js";
import DevolutionTransactionManagerMongo from "./DevolutionTransactionManagerMongo.js";
import ProductRepositoryMongo from "../../products/infrastructure/ProductRepositoryMongo.js";
import SaleRepositoryMongo from "../../sales/infrastructure/SaleRepositoryMongo.js";
import {
    sendControllerError,
    sendUnexpectedError,
} from "../../../shared/infrastructure/controllers/errorHandler.js";
import mongoose from "mongoose";
import NotificationService from "../../notifications/application/NotificationService.js";

const devolutionRepository = new DevolutionRepositoryMongo();
const transactionManager = new DevolutionTransactionManagerMongo();
const productRepository = new ProductRepositoryMongo();
const saleRepository = new SaleRepositoryMongo();

function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    return new mongoose.Types.ObjectId(id).toString() === String(id);
}

export const createDevolution = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "El cuerpo de la solicitud es requerido" });
        }

        const useCase = new CreateDevolutionUseCase(
            devolutionRepository,
            transactionManager,
            productRepository,
            saleRepository,
        );
        const result = await useCase.execute(req.body);

        await NotificationService.createNotification(
            "Devolución Registrada",
            `Se ha registrado una devolución para la venta ${req.body.saleId}.`,
            "SALE",
            `/devolutions/${result._id}`
        );

        res.status(201).json({
            message: "Devolucion registrada con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const createBatchDevolutions = async (req, res) => {
    try {
        const { saleId, devoluciones } = req.body;
        if (!saleId || !Array.isArray(devoluciones) || devoluciones.length === 0) {
            return res.status(400).json({ error: "saleId y un arreglo devoluciones son requeridos" });
        }

        const useCase = new CreateBatchDevolutionUseCase(
            devolutionRepository,
            transactionManager,
            productRepository,
            saleRepository,
        );
        const result = await useCase.execute(saleId, devoluciones);

        await NotificationService.createNotification(
            "Devolución Registrada",
            `Se han registrado devoluciones para la venta ${saleId}.`,
            "SALE",
            `/sales/${saleId}`
        );

        res.status(201).json({
            message: "Devoluciones registradas con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const updateDevolution = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "El cuerpo de la solicitud es requerido" });
        }

        const useCase = new UpdateDevolutionUseCase(
            devolutionRepository,
            transactionManager,
            productRepository,
            saleRepository,
        );
        const result = await useCase.execute(req.params.id, req.body);

        res.json({
            message: "Devolucion actualizada con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const anularDevolution = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        const useCase = new AnularDevolutionUseCase(
            devolutionRepository,
            transactionManager,
            productRepository,
            saleRepository,
        );
        const result = await useCase.execute(req.params.id);

        res.json({
            message: "Devolucion anulada con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const confirmDevolution = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        const useCase = new ConfirmDevolutionUseCase(
            devolutionRepository,
            transactionManager,
            productRepository,
            saleRepository,
        );
        const result = await useCase.execute(req.params.id);

        res.json({
            message: "Devolucion confirmada con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const getDevolutions = async (req, res) => {
    try {
        const useCase = new GetDevolutionsUseCase(devolutionRepository);
        const { page, limit, search } = req.query;
        const includeAnuladas = req.query.includeAnuladas !== "false";
        const result = await useCase.execute({ page, limit, search, includeAnuladas });

        res.json({
            // Una fila por venta: cada grupo es un arreglo con sus devoluciones.
            data: result.items.map((group) => group.devoluciones),
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        sendUnexpectedError(res, error);
    }
};

export const getDevolutionsBySaleId = async (req, res) => {
    try {
        const includeAnuladas = req.query.includeAnuladas !== "false";
        const result = await devolutionRepository.findBySaleId(req.params.saleId, {
            includeAnuladas,
        });

        res.json({ data: result });
    } catch (error) {
        sendUnexpectedError(res, error);
    }
};

export const exportDevolutions = async (req, res) => {
    try {
        const { from, to, page, limit } = req.query;
        const includeAnuladas = req.query.includeAnuladas !== "false";
        const result = await devolutionRepository.exportAll({ from, to, includeAnuladas, page, limit });

        res.json({
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

export const getDevolutionById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        const useCase = new GetDevolutionByIdUseCase(devolutionRepository);
        const result = await useCase.execute(req.params.id);

        res.json({ data: result });
    } catch (error) {
        sendControllerError(res, error, 404);
    }
};
