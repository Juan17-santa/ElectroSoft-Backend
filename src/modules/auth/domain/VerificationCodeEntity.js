/**
 * Entidad de código de verificación.
 * Valida las reglas de negocio para los códigos de recuperación de contraseña.
 */
export default class VerificationCodeEntity {
  constructor({ email, code, expiresAt }) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("El email no tiene un formato válido");
    }

    if (!code || !/^\d{6}$/.test(code)) {
      throw new Error("El código debe ser de 6 dígitos numéricos");
    }

    this.email = email.toLowerCase().trim();
    this.code = code;
    this.expiresAt = expiresAt || new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  }

  static generate() {
    return String(Math.floor(100000 + Math.random() * 900000)); // siempre 6 dígitos
  }

  isExpired() {
    return new Date() > this.expiresAt;
  }
}