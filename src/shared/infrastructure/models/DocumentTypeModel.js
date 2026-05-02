/**
 * Modelo de tipo de documento.
 * 
 * Representa los tipos de identificación usados en todo el sistema
 * (cedula de ciudadania, cedula de extranjeria, pasaporte, etc.).
 * 
 * Es un catálogo fijo, no se modifica desde el frontend.
 */

import mongoose from "mongoose";

const documentTypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    abbreviation: { type: String, required: true, unique: true, uppercase: true, trim: true }
});

export const DocumentTypeModel = mongoose.model("DocumentType", documentTypeSchema);