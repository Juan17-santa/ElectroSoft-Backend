export default class DeleteClientUseCase {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute(id) {
        const existing = await this.clientRepository.findById(id);

        if (!existing) throw new Error('Cliente no encontrado');

        await this.clientRepository.delete(id);

        return { message: 'Cliente eliminado correctamente' };
    }
}
