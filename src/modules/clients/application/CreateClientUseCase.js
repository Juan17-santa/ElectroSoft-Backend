import Client from '../domain/ClientEntity.js';

export default class CreateClientUseCase {
    constructor(clientRepository, documentTypeRepository) {
        this.clientRepository = clientRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute(clientData) {
        const { documentType, documentNumber, firstName, lastName, email, phone } = clientData;

        const docTypeExists = await this.documentTypeRepository.findById(documentType);

        if (!docTypeExists) {
            throw new Error("El tipo de documento proporcionado no es válido");
        }

        // VALIDAR DOCUMENTO REPETIDO
        const existingClient = await this.clientRepository.findByDocumentNumber(documentNumber);

        if (existingClient) {
            throw new Error("El documento ya se encuentra registrado");
        }

        const existingEmail = await this.clientRepository.findByEmail(email);

        if (existingEmail) {
            throw new Error("El email ya se encuentra registrado");
        }

        const client = new Client({
            documentType,
            documentNumber,
            firstName,
            lastName,
            email,
            phone,
            createdAt: new Date()
        });

        return await this.clientRepository.create(client);
    }
}

