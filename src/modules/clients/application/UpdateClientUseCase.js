import Client from "../domain/ClientEntity.js"

export default class UpdateClientUseCase {
    constructor(clientRepository, documentTypeRepository) {
        this.clientRepository = clientRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute(id, clientData) {
        const { documentType, documentNumber, firstName, lastName, email, phone } = clientData;

        // Validar que el cliente exista
        const existing = await this.clientRepository.findById(id);
        if (!existing) throw new Error('Cliente no encontrado');

        const updatedClient = new Client({
            documentType,
            documentNumber,
            firstName,
            lastName,
            email,
            phone,
            createdAt: new Date()
        });

        if (clientData.documentType) {
            const docTypeExists = await this.documentTypeRepository.findById(clientData.documentType);
            if (!docTypeExists) {
                throw new Error('El tipo de documento proporcionado no es válido');
            }
        }

        return await this.clientRepository.update(id, updatedClient);
    }
}

