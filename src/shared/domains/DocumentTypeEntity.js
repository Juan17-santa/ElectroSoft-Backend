/**
 * Entidad de tipo de documento.
 * 
 * Contiene las validaciones básicas para los tipos de documento.
 * Se usa para mantener consistencia en los datos del sistema.
 */

export default class DocumentTypeEntity {
    constructor({ id, name, abbreviation }) {

        if (!name) {
            throw new Error("El nombre del tipo de documento es obligatorio");
        }

        if (typeof name !== "string") {
            throw new Error("El nombre debe ser un texto");
        }

        if (!abbreviation) {
            throw new Error("La abreviatura es obligatoria");
        }

        if (typeof abbreviation !== "string") {
            throw new Error("La abreviatura debe ser un texto");
        }

        this.id = id;
        this.name = name.trim();
        this.abbreviation = abbreviation.trim().toUpperCase();
    }
}