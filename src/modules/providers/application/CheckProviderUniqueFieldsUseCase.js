export default class CheckProviderUniqueFieldsUseCase {
    constructor(providerRepository) {
        this.providerRepository = providerRepository;
    }

    async execute({ _id, document, providerEmail, contactEmail }) {

        if (document) {
            const provider = await this.providerRepository.findByDocument(document);

            if (provider && provider._id.toString() !== _id) {
                return {
                    exists: true,
                    field: "document",
                    message: "Este documento ya se encuentra registrado"
                };
            }

            return {
                exists: false
            };
        }

        if (providerEmail) {
            const provider = await this.providerRepository.findByEmail(providerEmail);

            if (provider && provider._id.toString() !== _id) {
                return {
                    exists: true,
                    field: "providerEmail",
                    message: "Este correo electrónico ya se encuentra registrado"
                };
            }

            return {
                exists: false
            };
        }

        if (contactEmail) {
            const provider = await this.providerRepository.findByContactEmail(contactEmail);

            if (provider && provider._id.toString() !== _id) {
                return {
                    exists: true,
                    field: "contactEmail",
                    message: "Este correo de contacto ya se encuentra registrado"
                };
            }

            return {
                exists: false
            };
        }

        return {
            exists: false
        };
    }
}