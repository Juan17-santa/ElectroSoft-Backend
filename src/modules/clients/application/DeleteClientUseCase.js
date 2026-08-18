export default class DeleteClientUseCase {
    constructor(clientRepository, saleRepository) {
        this.clientRepository = clientRepository;
        this.saleRepository = saleRepository;
    }

    async execute(id) {
        const existing = await this.clientRepository.findById(id);

        if (!existing) throw new Error('Cliente no encontrado');

        if (this.saleRepository) {
            const hasSales = await this.saleRepository.hasSalesByClient(id);
            if (hasSales) {
                throw new Error('No se puede eliminar el cliente porque tiene ventas asociadas');
            }
        }

        return await this.clientRepository.delete(id);
    }
}
