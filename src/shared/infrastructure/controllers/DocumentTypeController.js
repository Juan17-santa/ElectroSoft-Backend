/**
 * Controlador para tipos de documento.
 * 
 * Permite exponer endpoints para consulta.
 */

import mongoose from "mongoose";
import GetDocumentTypesUseCase from "../../application/GetDocumentTypeUseCase.js";
import GetDocumentTypeByIdUseCase from "../../application/GetDocumentTypeByIdUseCase.js";
import DocumentTypeRepositoryMongo from "../repositories/DocumentTypeRepositoryMongo.js";

const documentTypeRepository = new DocumentTypeRepositoryMongo();

export const getDocumentTypes = async (req, res) => {
    try {
        const useCase = new GetDocumentTypesUseCase(documentTypeRepository);
        const result = await useCase.execute();

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDocumentTypeById = async (req, res) => {
    try {
        // Validar que el ID sea un ObjectId válido
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetDocumentTypeByIdUseCase(documentTypeRepository);
        const result = await useCase.execute(req.params.id);
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}