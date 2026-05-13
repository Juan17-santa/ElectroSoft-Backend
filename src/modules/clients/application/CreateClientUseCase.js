import Client from '../domain/ClientEntity.js';

export default class CreateClientUseCase {
    constructor(clientRepository, documentTypeRepository) {
        this.clientRepository = clientRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute(clientData) {
        const { firstName, lastName, email, phone, address, documentType, documentNumber } = clientData;

        // Validar que el tipo de documento existe
        const docTypeExists = await this.documentTypeRepository.findById(documentType);
        if (!docTypeExists) {
            throw new Error('El tipo de documento proporcionado no es válido');
        }

        const client = new Client({
            firstName,
            lastName,
            email,
            phone,
            address,
            documentType,
            documentNumber,
            createdAt: new Date()
        });

        return await this.clientRepository.create(client);
    }
}

