export default class GetClientsUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute(options = {}) {
        return await this.clientRepository.findAll(options);
    }
}