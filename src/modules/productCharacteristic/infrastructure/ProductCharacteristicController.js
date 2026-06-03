/**
 * Controlador de Características de Producto
 * 
 * Maneja las peticiones HTTP y conecta con los casos de uso.
 */

import mongoose from "mongoose";
import CreateProductCharacteristicUseCase from "../application/CreateProductCharacteristicUseCase.js";
import GetProductCharacteristicsUseCase from "../application/GetProductCharacteristicsUseCase.js";
import DeleteProductCharacteristicUseCase from "../application/DeleteProductCharacteristicUseCase.js";
import ProductCharacteristicRepositoryMongo from "./ProductCharacteristicRepositoryMongo.js";

const repository = new ProductCharacteristicRepositoryMongo();

export const createCharacteristic = async (req, res) => {
    try {
        const useCase = new CreateProductCharacteristicUseCase(repository);
        const result = await useCase.execute(req.body);
        res.status(201).json({ message: "Característica creada con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getCharacteristics = async (req, res) => {
    try {
        const useCase = new GetProductCharacteristicsUseCase(repository);
        const result = await useCase.execute();
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCharacteristic = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new DeleteProductCharacteristicUseCase(repository);
        const result = await useCase.execute(id);
        res.json({ message: "Característica eliminada con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
