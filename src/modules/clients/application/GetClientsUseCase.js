export default class GetClientsUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute() {
        return await this.clientRepository.findAll();
    }
}