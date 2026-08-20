/**
 * Caso de uso para actualizar un proveedor.
 * 
 * Responsabilidades:
 * - Verificar que el proveedor exista.
 * - Aplicar reglas de la entidad.
 * - Validar tipo de documento.
 * - Validar documento único (si cambia).
 * - Validar categorías.
 * - Actualizar en base de datos.
 */

import mongoose from "mongoose";
import ProviderEntity from "../domain/ProviderEntity.js";

export default class UpdateProviderUseCase {
    constructor(providerRepository, documentTypeRepository, productCategoryRepository) {
        this.providerRepository = providerRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(id, providerData) {
        const {
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
            categoriesAssociated,
        } = providerData;

        const existingProvider = await this.providerRepository.findById(id);
        if (!existingProvider) {
            throw new Error("El proveedor no existe")
        }

        let finalContactName = contactName;

        if (providerType === "NATURAL") {
            finalContactName = providerName;
        }

        const updatedProvider = new ProviderEntity({
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
            status: existingProvider.status
        });

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

        if (document && document !== existingProvider.document) {
            const exists = await this.providerRepository.findByDocument(document);
            if (exists) {
                throw new Error("Este documento ya se encuentra registrado");
            }
        }

        if (providerEmail && providerEmail !== existingProvider.providerEmail) {
            const exists = await this.providerRepository.findByEmail(providerEmail);
            if (exists) {
                throw new Error("Este correo ya se encuentra registrado");
            }
        }

        if (
            providerType === "JURIDICA" &&
            contactEmail &&
            contactEmail !== existingProvider.contactEmail
        ) {
            const exists = await this.providerRepository.findByContactEmail(contactEmail);

            if (exists) {
                throw new Error("Este correo de empresa ya se encuentra registrado");
            }
        }

        if (categoriesAssociated && categoriesAssociated.length > 0) {

            const invalidIds = categoriesAssociated.filter(
                id => !mongoose.Types.ObjectId.isValid(id)
            );

            if (invalidIds.length > 0) {
                throw new Error("Una o más categorías tienen un ID inválido");
            }

            const categories = await this.productCategoryRepository.findByIds(categoriesAssociated);

            if (categories.length !== categoriesAssociated.length) {
                throw new Error("Una o más categorías no son válidas");
            }
        }

        return await this.providerRepository.update(id, updatedProvider);
    }
}