function capitalizeWords(str) {
    if (!str) return "";
    return str.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

export default class Client {
    constructor({ id, documentType, documentNumber, firstName, lastName, email, phone, createdAt }) {

        // VALIDACIÓN: TIPO DE DOCUMENTO
        if (!documentType) {
            throw new Error("El tipo de documento es obligatorio");
        }

        // VALIDACIÓN: NÚMERO DE DOCUMENTO
        if (!documentNumber) {
            throw new Error("El número de documento es obligatorio");
        }

        if (typeof documentNumber !== "string") {
            throw new Error("El número de documento debe ser un texto");
        }

        const onlyNumbers = /^[0-9]+$/;
        if (!onlyNumbers.test(documentNumber)) {
            throw new Error("El número de documento solo puede contener números");
        }

        if (documentNumber.length < 8 || documentNumber.length > 12) {
            throw new Error("El número de documento debe tener entre 8 y 12 dígitos");
        }

        // VALIDACIÓN: NOMBRE
        if (!firstName) {
            throw new Error("El nombre es obligatorio");
        }

        if (typeof firstName !== "string") {
            throw new Error("El nombre debe ser un texto");
        }

        if (firstName.trim().length < 3) {
            throw new Error("El nombre debe tener al menos 3 caracteres");
        }

        const onlyLetters = /^[a-zA-Z\s]+$/;
        if (!onlyLetters.test(firstName)) {
            throw new Error("El nombre solo puede contener letras");
        }

        // VALIDACIÓN: APELLIDO
        if (!lastName) {
            throw new Error("El apellido es obligatorio");
        }

        if (typeof lastName !== "string") {
            throw new Error("El apellido debe ser un texto");
        }

        if (lastName.trim().length < 3) {
            throw new Error("El apellido debe tener al menos 3 caracteres");
        }

        if (!onlyLetters.test(lastName)) {
            throw new Error("El apellido solo puede contener letras");
        }

        // VALIDACIÓN: EMAIL
        if (!email) {
            throw new Error("El correo electrónico es obligatorio");
        }

        if (typeof email !== "string") {
            throw new Error("El correo electrónico debe ser un texto");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("El correo electrónico no tiene un formato válido");
        }

        // VALIDACIÓN: TELÉFONO
        if (!phone) {
            throw new Error("El teléfono es obligatorio");
        }

        if (typeof phone !== "string") {
            throw new Error("El teléfono debe ser un texto");
        }        

        if (!onlyNumbers.test(phone)) {
            throw new Error("El teléfono solo puede contener números");
        }

        if (phone.length < 8 || phone.length > 14) {
            throw new Error("El teléfono debe tener entre 8 y 14 dígitos");
        }

        // ASIGNACIÓN DE VALORES
        this.id = id;
        this.firstName = capitalizeWords(firstName);
        this.lastName = capitalizeWords(lastName);
        this.email = email.trim().toLowerCase();
        this.phone = phone.trim();
        this.documentType = documentType;
        this.documentNumber = documentNumber.trim();
        this.createdAt = createdAt;
    }
}