/**
 * Controlador de Medidas de Producto
 * 
 * Maneja las peticiones HTTP y conecta con los casos de uso.
 */

import mongoose from "mongoose";
import CreateProductMeasureUseCase from "../application/CreateProductMeasureUseCase.js";
import GetProductMeasuresUseCase from "../application/GetProductMeasuresUseCase.js";
import DeleteProductMeasureUseCase from "../application/DeleteProductMeasureUseCase.js";
import ProductMeasureRepositoryMongo from "./ProductMeasureRepositoryMongo.js";

const repository = new ProductMeasureRepositoryMongo();

export const createMeasure = async (req, res) => {
    try {
        const useCase = new CreateProductMeasureUseCase(repository);
        const result = await useCase.execute(req.body);
        res.status(201).json({ message: "Medida creada con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getMeasures = async (req, res) => {
    try {
        const useCase = new GetProductMeasuresUseCase(repository);
        const result = await useCase.execute();
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteMeasure = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new DeleteProductMeasureUseCase(repository);
        const result = await useCase.execute(id);
        res.json({ message: "Medida eliminada con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
