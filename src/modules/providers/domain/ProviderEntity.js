/**
 * Entidad de proveedor.
 * 
 * Representa la lógica de negocio de un proveedor.
 * Aquí se aplican las validaciones principales antes de crear o actualizar.
 * 
 * Validaciones:
 * - El tipo de proveedor es obligatorio y debe ser "NATURAL" o "JURIDICA".
 * - El tipo de documento es obligatorio.
 * - El documento es obligatorio, debe ser un string y solo puede contener números.
 * - El nombre del proveedor es obligatorio, debe ser un string y solo puede contener letras, números y algunos símbolos básicos.
 * - El nombre del contacto es obligatorio, debe ser un string y solo puede contener letras.
 * - El teléfono es obligatorio, debe ser un string, solo puede contener números y debe tener entre 8 y 14 dígitos.
 * - El correo es obligatorio, debe ser un string y debe tener un formato válido.
 * - Si el proveedor es JURIDICA, el correo de la empresa es obligatorio y debe tener un formato válido.
 * - Si el proveedor es JURIDICA, el teléfono de la empresa es obligatorio, solo puede contener números y debe tener entre 8 y 14 dígitos.
 * - La dirección es obligatoria y debe ser un string.
 * - Las categorías asociadas deben ser un arreglo.
 */

export default class ProviderEntity {
    constructor({
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
    }) {

        // VALIDACION: TIPO DE PROVEEDOR
        if (!providerType) {
            throw new Error("El tipo de proveedor es obligatorio");
        }

        if (!["NATURAL", "JURIDICA"].includes(providerType)) {
            throw new Error("El tipo de proveedor es inválido");
        }

        // VALIDACIÓN: TIPO DE DOCUMENTO
        if (!documentType) {
            throw new Error("El tipo de documento es obligatorio");
        }

        // VALIDACIÓN: DOCUMENTO
        if (!document) {
            throw new Error("El documento es obligatorio");
        }

        if (typeof document !== "string") {
            throw new Error("El documento debe ser un texto");
        }

        const onlyNumbers = /^[0-9]+$/;
        if (!onlyNumbers.test(document)) {
            throw new Error("El documento solo puede contener números");
        }

        if (document.length < 8 || document.length > 12) {
            throw new Error("El documento debe tener entre 8 y 12 dígitos");
        }

        // VALIDACIÓN: NOMBRE PROVEEDOR
        if (!providerName) {
            throw new Error("El nombre del proveedor es obligatorio");
        }

        if (typeof providerName !== "string") {
            throw new Error("El nombre del proveedor debe ser un texto");
        }

        // Permite letras, números y algunos símbolos básicos
        const nameRegex = /^[a-zA-Z0-9\s.,&-]+$/;
        if (!nameRegex.test(providerName)) {
            throw new Error("El nombre del proveedor contiene caracteres inválidos");
        }

        // VALIDACIÓN: NOMBRE CONTACTO
        if (providerType === "NATURAL") {
            contactName = providerName;
        }

        if (!contactName) {
            throw new Error("El nombre del contacto es obligatorio");
        }

        if (typeof contactName !== "string") {
            throw new Error("El nombre del contacto debe ser un texto");
        }

        const onlyLetters = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        if (!onlyLetters.test(contactName)) {
            throw new Error("El nombre del contacto solo puede contener letras");
        }

        // VALIDACIÓN: TELÉFONO
        if (!providerPhone) {
            throw new Error("El teléfono es obligatorio");
        }

        if (typeof providerPhone !== "string") {
            throw new Error("El teléfono debe ser un texto");
        }

        if (!onlyNumbers.test(providerPhone)) {
            throw new Error("El teléfono solo puede contener números");
        }

        if (providerPhone.length < 8 || providerPhone.length > 14) {
            throw new Error("El teléfono debe tener entre 8 y 14 dígitos");
        }

        // VALIDACION: EMAIL
        if (!providerEmail) {
            throw new Error("El correo es obligatorio");
        }

        if (typeof providerEmail !== "string") {
            throw new Error("El correo debe ser un texto");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(providerEmail)) {
            throw new Error("El correo no es válido");
        }

        // VALIDACIÓN: CORREO EMPRESA
        if (providerType === "JURIDICA") {
            if (!contactEmail) {
                throw new Error("El correo de la empresa es obligatorio");
            }

            if (typeof contactEmail !== "string") {
                throw new Error("El correo de la empresa debe ser un texto");
            }

            if (!emailRegex.test(contactEmail)) {
                throw new Error("El correo de la empresa no es válido");
            }
        }

        // VALIDACIÓN: TELÉFONO EMPRESA
        if (providerType === "JURIDICA") {
            if (!contactPhone) {
                throw new Error("El teléfono de la empresa es obligatorio");
            }

            if (typeof contactPhone !== "string") {
                throw new Error("El teléfono de la empresa debe ser un texto");
            }

            if (!onlyNumbers.test(contactPhone)) {
                throw new Error("El teléfono de la empresa solo puede contener números");
            }

            if (contactPhone.length < 8 || contactPhone.length > 14) {
                throw new Error("El teléfono de la empresa debe tener entre 8 y 14 dígitos");
            }
        }

        // VALIDACION: DIRECCIÓN
        if (!address) {
            throw new Error("La dirección es obligatoria");
        }

        if (typeof address !== "string") {
            throw new Error("La dirección debe ser un texto");
        }

        // VALIDACIÓN: CATEGORÍAS
        if (!Array.isArray(categoriesAssociated)) {
            throw new Error("Las categorías deben ser un arreglo");
        }

        this.id = id;
        this.providerType = providerType;
        this.documentType = documentType;
        this.document = document.trim();
        this.providerName = providerName.trim();
        this.contactName = contactName.trim();
        this.providerPhone = providerPhone.trim();
        this.providerEmail = providerEmail.trim().toLowerCase();
        this.contactEmail = contactEmail ? contactEmail.trim().toLowerCase() : null;
        this.contactPhone = contactPhone ? contactPhone.trim() : null;
        this.address = address.trim();
        this.categoriesAssociated = categoriesAssociated;
        this.status = status;
    }
}