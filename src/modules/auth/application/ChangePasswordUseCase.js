import { comparePassword, encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

export default class ChangePasswordUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ userId, currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new Error("La contraseña actual y la nueva son obligatorias");
    }

    if (newPassword.length < 6) {
      throw new Error("La nueva contraseña debe tener al menos 6 caracteres");
    }

    if (currentPassword === newPassword) {
      throw new Error("La nueva contraseña debe ser diferente a la actual");
    }

    // Busca el usuario con contraseña (findById no la devuelve por el select -password)
    const user = await this.userRepository.findByIdWithPassword(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) throw new Error("La contraseña actual es incorrecta");

    const hashedPassword = await encryptPassword(newPassword);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: "Contraseña cambiada correctamente" };
  }
}