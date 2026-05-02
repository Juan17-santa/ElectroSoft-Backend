/**
 * Repositorio de tipos de documento (MongoDB).
 * 
 * Permite consultar los tipos de documento desde la base de datos.
 */

import { DocumentTypeModel } from "../models/DocumentTypeModel.js";

class DocumentTypeRepositoryMongo {

    async findAll() {
        return await DocumentTypeModel.find();
    }

    async findById(id) {
        return await DocumentTypeModel.findById(id);
    }
}

export default DocumentTypeRepositoryMongo;