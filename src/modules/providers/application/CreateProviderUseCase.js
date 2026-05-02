/**
 * Caso de uso para crear un nuevo proveedor.
 * 
 * Responsabilidades:
 * - Validar que el tipo de documento exista.
 * - Validar que el documento no esté duplicado.
 * - Aplicar las reglas de la entidad (validaciones).
 * - Guardar el proveedor en la base de datos.
 */

import mongoose from "mongoose";
import ProviderEntity from "../domain/ProviderEntity.js";

export default class CreateProviderUseCase {
    constructor(providerRepository, documentTypeRepository, productCategoryRepository) {
        this.providerRepository = providerRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.productCategoryRepository = productCategoryRepository;
    }

    async execute(providerData) {
        const { id, documentType, document, providerName, contactName, contactPhone, categoriesAssociated = [], status } = providerData;

        // PRIMERO: validar entidad (campos obligatorios, formatos, etc)
        const provider = new ProviderEntity({
            id,
            documentType,
            document,
            providerName,
            contactName,
            contactPhone,
            categoriesAssociated,
            status
        })

        // DESPUÉS: validar contra base de datos
        // Validar que el tipo de documento exista
        const docTypeExists = await this.documentTypeRepository.findById(documentType);
        if (!docTypeExists) {
            throw new Error("El tipo de documento no es válido");
        }

        // Validar que el documento no exista
        const docExists = await this.providerRepository.findByDocument(document);
        if (docExists) {
            throw new Error("Este documento ya se encuentra registrado")
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