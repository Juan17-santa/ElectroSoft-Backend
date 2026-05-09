export default class UpdateClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute(id, clientData) {
        const existing = await this.clientRepository.findById(id);

        if (!existing) throw new Error('Cliente no encontrado');

        const updated = await this.clientRepository.update(id, clientData);

        return updated;
    }
}
