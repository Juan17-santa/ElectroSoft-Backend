/**
 * Caso de uso para crear un nuevo proveedor.
 * 
 * Responsabilidades:
 * - Aplicar las reglas de la entidad (validaciones).
 * - Validar que el tipo de documento exista.
 * - Validar que el tipo de documento sea compatible con el tipo de proveedor.
 * - Validar que el documento no esté duplicado.
 * - Validar que las categorías asociadas existan.
 * - Guardar el proveedor en la base de datos.
 */

import ProviderEntity from "../domain/ProviderEntity.js";

export default class CreateProviderUseCase {
    constructor(providerRepository, documentTypeRepository, productCategoryRepository) {
        this.providerRepository = providerRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(providerData) {
        const {
            id,
            providerType,
            documentType,
            document,
            providerName,
            contactName,
            providerPhone,
            providerEmail,
            address,
            contactEmail,
            contactPhone,
            categoriesAssociated = [],
            status
        } = providerData;

        // Variable para determinar el nombre de contacto final, dependiendo del tipo de proveedor
        let finalContactName = contactName;

        if (providerType === "NATURAL") {
            finalContactName = providerName;
        }

        const provider = new ProviderEntity({
            id,
            providerType,
            documentType,
            document,
            providerName,
            contactName: finalContactName,
            providerPhone,
            providerEmail,
            address,
            contactEmail,
            contactPhone,
            categoriesAssociated,
            status
        });

        // Validar que el tipo de documento exista
        const docTypeExists = await this.documentTypeRepository.findById(documentType);
        if (!docTypeExists) {
            throw new Error("El tipo de documento no es válido");
        }

        if (
            providerType === "JURIDICA" &&
            docTypeExists.abbreviation !== "NIT"
        ) {
            throw new Error("Las personas jurídicas solo pueden registrarse con NIT");
        }

        // Validar que el documento no exista
        const docExists = await this.providerRepository.findByDocument(document);
        if (docExists) {
            throw new Error("Este documento ya se encuentra registrado")
        }

        const emailExists = await this.providerRepository.findByEmail(providerEmail);
        if (emailExists) {
            throw new Error("Este correo ya se encuentra registrado");
        }

        if (providerType === "JURIDICA") {
            const ContactEmailExists = await this.providerRepository.findByContactEmail(contactEmail);

            if (ContactEmailExists) {
                throw new Error("Este correo de empresa ya se encuentra registrado");
            }
        }

        // Validar que las categorias existen
        if (categoriesAssociated && categoriesAssociated.length > 0) {
            const categories = await this.productCategoryRepository.findByIds(categoriesAssociated);

            // Validacion, ej: si se mandan 5 categorias y solo existen 4, muestra error por la que falta
            if (categories.length !== categoriesAssociated.length) {
                throw new Error("Una o más categorías no son válidas");
            }
        }

        return await this.providerRepository.create(provider);
    }
}