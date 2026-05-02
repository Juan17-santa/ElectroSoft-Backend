/**
 * Inserta los tipos de documento iniciales si no existen.
 */

import { DocumentTypeModel } from "../models/DocumentTypeModel.js";

export const seedDocumentTypes = async () => {
    const count = await DocumentTypeModel.countDocuments();

    if (count === 0) {
        await DocumentTypeModel.insertMany([
            { name: "Cédula de Ciudadanía", abbreviation: "CC" },
            { name: "Cédula de Extranjería", abbreviation: "CE" },
            { name: "Número de Identificación Tributaria", abbreviation: "NIT" },
            { name: "Pasaporte", abbreviation: "PAS" }
        ]);
    }
};