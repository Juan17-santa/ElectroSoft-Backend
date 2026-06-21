import AnularDevolutionUseCase from "../application/AnularDevolutionUseCase.js";
import ConfirmDevolutionUseCase from "../application/ConfirmDevolutionUseCase.js";
import CreateDevolutionUseCase from "../application/CreateDevolutionUseCase.js";
import GetDevolutionByIdUseCase from "../application/GetDevolutionByIdUseCase.js";
import GetDevolutionsUseCase from "../application/GetDevolutionsUseCase.js";
import UpdateDevolutionUseCase from "../application/UpdateDevolutionUseCase.js";
import DevolutionRepositoryMongo from "./DevolutionRepositoryMongo.js";
import DevolutionTransactionManagerMongo from "./DevolutionTransactionManagerMongo.js";
import ProductRepositoryMongo from "../../products/infrastructure/ProductRepositoryMongo.js";

const devolutionRepository = new DevolutionRepositoryMongo();
const transactionManager = new DevolutionTransactionManagerMongo();
const productRepository = new ProductRepositoryMongo();

export const createDevolution = async (req, res) => {
    try {
        const useCase = new CreateDevolutionUseCase(devolutionRepository, transactionManager);
        const result = await useCase.execute(req.body);

        res.status(201).json({
            message: "Devolucion registrada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateDevolution = async (req, res) => {
    try {
        const useCase = new UpdateDevolutionUseCase(devolutionRepository, transactionManager, productRepository);
        const result = await useCase.execute(req.params.id, req.body);

        res.json({
            message: "Devolucion actualizada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const anularDevolution = async (req, res) => {
    try {
        const useCase = new AnularDevolutionUseCase(devolutionRepository, transactionManager, productRepository);
        const result = await useCase.execute(req.params.id);

        res.json({
            message: "Devolucion anulada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const confirmDevolution = async (req, res) => {
    try {
        const useCase = new ConfirmDevolutionUseCase(devolutionRepository, transactionManager);
        const result = await useCase.execute(req.params.id);

        res.json({
            message: "Devolucion confirmada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getDevolutions = async (req, res) => {
    try {
        const useCase = new GetDevolutionsUseCase(devolutionRepository);
        const includeAnuladas = req.query.includeAnuladas !== "false";
        const result = await useCase.execute({ includeAnuladas });

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        res.status(500).json({ error: error.message });
    }
};

export const getDevolutionById = async (req, res) => {
    try {
        const useCase = new GetDevolutionByIdUseCase(devolutionRepository);
        const result = await useCase.execute(req.params.id);

        res.json({ data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
