export default class GetClientByDocumentUseCase {

    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute(documentNumber) {

        const client = await this.clientRepository.findByDocumentNumber(documentNumber);

        if (!client) {
            throw new Error("Cliente no encontrado");
        }

        return client;
    }
}