/**
 * Caso de uso para obtener un tipo de documento por su ID.
 * 
 * Responsabilidades:
 * - Buscar un tipo de documento específico en la base de datos.
 * - Retornar el tipo de documento si existe.
 */

export default class GetDocumentTypeByIdUseCase {
    constructor(documentTypeRepository) {
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute(id) {
        const documentType = await this.documentTypeRepository.findById(id);

        if (!documentType) {
            throw new Error("El tipo de documento no existe");
        }

        return documentType;
    }
}