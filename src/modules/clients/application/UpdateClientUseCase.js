export default class UpdateClientUseCase {
    constructor(clientRepository, documentTypeRepository) {
        this.clientRepository = clientRepository;
        this.documentTypeRepository = documentTypeRepository;
    }

    async execute(id, clientData) {
        const existing = await this.clientRepository.findById(id);
        if (!existing) throw new Error('Cliente no encontrado');

        if (clientData.documentType) {
            const docTypeExists = await this.documentTypeRepository.findById(clientData.documentType);
            if (!docTypeExists) {
                throw new Error('El tipo de documento proporcionado no es válido');
            }
        }

        const updated = await this.clientRepository.update(id, clientData);
        return updated;
    }
}

