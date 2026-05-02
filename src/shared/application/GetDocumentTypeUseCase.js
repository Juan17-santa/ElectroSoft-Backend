// GetDocumentTypesUseCase.js

/**
 * Caso de uso para obtener todos los tipos de documento.
 * 
 * Responsabilidades:
 * - Consultar todos los tipos de documento en la base de datos.
 * - Retornar la lista.
 */

export default class GetDocumentTypesUseCase {
    constructor(documentTypeRepository) {
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute() {
        return await this.documentTypeRepository.findAll();
    }
}