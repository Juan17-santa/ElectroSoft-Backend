/**
 * Entidad de usuario.
 * Valida las reglas de negocio del usuario con todos sus campos.
 */
export default class UserEntity {
  constructor({ id, fullName, email, password, phone, documentType, documentNumber, role }) {
    if (!fullName || fullName.trim().length < 3) {
      throw new Error("El nombre completo es obligatorio y debe tener al menos 3 caracteres");
    }

    if (!email || !UserEntity.isValidEmail(email)) {
      throw new Error("El email es obligatorio y debe tener un formato válido");
    }

    if (!password || password.length < 6) {
      throw new Error("La contraseña es obligatoria y debe tener al menos 6 caracteres");
    }

    if (!phone || !UserEntity.isValidPhone(phone)) {
      throw new Error("El teléfono es obligatorio y debe tener entre 7 y 15 dígitos");
    }

    if (!documentType) {
      throw new Error("El tipo de documento es obligatorio");
    }

    if (!documentNumber || documentNumber.trim().length < 4) {
      throw new Error("El número de documento es obligatorio y debe tener al menos 4 caracteres");
    }

    if (!role) {
      throw new Error("El rol es obligatorio");
    }

    this.id = id;
    this.fullName = fullName.trim();
    this.email = email.toLowerCase().trim();
    this.password = password;
    this.phone = phone.trim();
    this.documentType = documentType;   // ObjectId ref a DocumentType
    this.documentNumber = documentNumber.trim();
    this.role = role;                   // ObjectId ref a Role
  }

  static isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isValidPhone(phone) {
    return /^\d{7,15}$/.test(phone.trim());
  }
}