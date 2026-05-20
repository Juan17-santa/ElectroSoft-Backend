import { comparePassword, encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

export default class ResetPasswordUseCase {
  constructor(userRepository, verificationCodeRepository) {
    this.userRepository = userRepository;
    this.verificationCodeRepository = verificationCodeRepository;
  }

  async execute({ email, code, newPassword }) {
    if (!email || !code || !newPassword) {
      throw new Error("El email, el código y la nueva contraseña son obligatorios");
    }

    if (newPassword.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    // Verifica que el usuario exista
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("No existe una cuenta con ese email");

    // Verifica el código
    const record = await this.verificationCodeRepository.findValidByEmail(email);
    if (!record) throw new Error("El código es inválido o ha expirado");

    const isValid = await comparePassword(code, record.codeHash);
    if (!isValid) throw new Error("El código es incorrecto");

    // Marca el código como usado (no se puede reutilizar)
    await this.verificationCodeRepository.markAsUsed(record._id);

    // Hashea y guarda la nueva contraseña
    const hashedPassword = await encryptPassword(newPassword);
    await this.userRepository.update(user._id, { password: hashedPassword });

    return { message: "Contraseña actualizada correctamente" };
  }
}