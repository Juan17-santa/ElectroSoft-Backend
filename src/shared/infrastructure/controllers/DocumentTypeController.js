/**
 * Controlador para tipos de documento.
 * 
 * Permite exponer endpoints para consulta.
 */

import GetDocumentTypesUseCase from "../../application/GetDocumentTypeUseCase.js";
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