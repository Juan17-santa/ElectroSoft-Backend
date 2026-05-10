export default class GetClientByIdUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute(id) {
        const client = await this.clientRepository.findById(id);

        if (!client) throw new Error('Cliente no encontrado');

        return client;
    }
}
