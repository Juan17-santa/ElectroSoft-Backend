import { comparePassword } from "../../../infrastructure/security/passwordEncrypter.js";

export default class VerifyCodeUseCase {
  constructor(verificationCodeRepository) {
    this.verificationCodeRepository = verificationCodeRepository;
  }

  async execute({ email, code }) {
    if (!email || !code) {
      throw new Error("El email y el código son obligatorios");
    }

    const record = await this.verificationCodeRepository.findValidByEmail(email);
    if (!record) throw new Error("El código es inválido o ha expirado");

    const isValid = await comparePassword(code, record.codeHash);
    if (!isValid) throw new Error("El código es incorrecto");

    return { valid: true };
  }
}