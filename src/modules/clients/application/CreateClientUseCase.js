import Client from '../domain/ClientEntity.js';

export default class CreateClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute(clientData) {
        const { name, email, phone, address, documentType, documentNumber } = clientData;

        const client = new Client({
            name,
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
