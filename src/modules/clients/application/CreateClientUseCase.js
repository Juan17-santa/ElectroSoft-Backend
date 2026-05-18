import Client from '../domain/ClientEntity.js';

export default class CreateClientUseCase {
    constructor(clientRepository, documentTypeRepository) {
        this.clientRepository = clientRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute(clientData) {
        const { documentType, documentNumber, firstName, lastName, email, phone } = clientData;

        const client = new Client({
            documentType,
            documentNumber,
            firstName,
            lastName,
            email,
            phone,
            createdAt: new Date()
        });

        // Validar que el tipo de documento existe
        const docTypeExists = await this.documentTypeRepository.findById(documentType);
        if (!docTypeExists) {
            throw new Error('El tipo de documento proporcionado no es válido');
        }

        return await this.clientRepository.create(client);
    }
}

