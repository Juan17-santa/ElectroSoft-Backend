import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";
import { verifyToken } from "../../../infrastructure/security/tokenGenerator.js";

export default class ResetPasswordUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ resetToken, newPassword }) {
    if (!resetToken || !newPassword) {
      throw new Error("El token y la nueva contraseña son obligatorios");
    }

    if (newPassword.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    // Verifica el token temporal
    let decoded;
    try {
      decoded = verifyToken(resetToken);
    } catch {
      throw new Error("El token es inválido o ha expirado");
    }

    // Verifica que el token sea para resetear contraseña
    if (decoded.purpose !== "reset-password") {
      throw new Error("Token inválido");
    }

    const user = await this.userRepository.findByEmail(decoded.email);
    if (!user) throw new Error("Usuario no encontrado");

    const hashedPassword = await encryptPassword(newPassword);
    await this.userRepository.update(user._id, { password: hashedPassword });

    return { message: "Contraseña actualizada correctamente" };
  }
}