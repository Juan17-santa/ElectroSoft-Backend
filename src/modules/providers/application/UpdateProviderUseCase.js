/**
 * Caso de uso para actualizar un proveedor.
 * 
 * Responsabilidades:
 * - Verificar que el proveedor exista.
 * - Validar tipo de documento.
 * - Validar documento único (si cambia).
 * - Validar categorías.
 * - Aplicar reglas de la entidad.
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
        const { documentType, document, providerName, contactName, contactPhone, categoriesAssociated, status } = providerData;

        const existingProvider = await this.providerRepository.findById(id);
        if (!existingProvider) {
            throw new Error("El proveedor no existe")
        }


        // PRIMERO: validar entidad
        const updatedProvider = new ProviderEntity({
            id,
            documentType,
            document,
            providerName,
            contactName,
            contactPhone,
            categoriesAssociated,
            status: existingProvider.status
        })

        // DESPUÉS: validar contra base de datos

        // Verificar si el proveedor existe

        // Validar que el tipo de documento exista
        const docTypeExists = await this.documentTypeRepository.findById(documentType);
        if (!docTypeExists) {
            throw new Error("El tipo de documento no es válido");
        }

        // Validar documento unico (solo si cambia)
        if (document && document !== existingProvider.document) {
            const exists = await this.providerRepository.findByDocument(document);
            if (exists) {
                throw new Error("Este documento ya se encuentra registrado");
            }
        }

        // Validar que las categorias existen
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