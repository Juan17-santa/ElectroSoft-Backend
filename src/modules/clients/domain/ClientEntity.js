export default class Client {
    constructor({ id, name, email, phone, address, documentType, documentNumber, createdAt }) {
        if (!name || name.trim().length < 3)
            throw new Error('El nombre es obligatorio y debe tener al menos 3 caracteres');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email))
            throw new Error('El correo electrónico es obligatorio y debe tener un formato válido');

        if (!phone || phone.trim().length < 7)
            throw new Error('El teléfono es obligatorio y debe tener al menos 7 caracteres');

        if (!address || address.trim().length < 5)
            throw new Error('La dirección es obligatoria y debe tener al menos 5 caracteres');

        if (!documentType || documentType.trim().length < 2)
            throw new Error('El tipo de documento es obligatorio');

        if (!documentNumber || documentNumber.trim().length < 4)
            throw new Error('El número de documento es obligatorio y debe tener al menos 4 caracteres');

        this.id = id;
        this.name = name.trim();
        this.email = email.trim().toLowerCase();
        this.phone = phone.trim();
        this.address = address.trim();
        this.documentType = documentType.trim();
        this.documentNumber = documentNumber.trim();
        this.createdAt = createdAt;
    }
}