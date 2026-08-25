import { comparePassword } from "../../../infrastructure/security/passwordEncrypter.js";
import { generateToken } from "../../../infrastructure/security/tokenGenerator.js";
import { DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_LETTER } from "../../users/domain/avatarOptions.js";

export default class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new Error("El email y la contraseña son obligatorios");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("Credenciales incorrectas");

    // Bloquear si el usuario está inactivo
    if (!user.isActive) {
      throw new Error("Tu cuenta está desactivada, contacta al administrador");
    }

    // Bloquear si el rol está inactivo
    if (!user.role.isActive) {
      throw new Error("Tu rol está desactivado, contacta al administrador");
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) throw new Error("Credenciales incorrectas");

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    });

    return {
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        permissions: user.role.permissions,
        isActive: user.isActive,
        documentType: {
          _id: user.documentType._id,
          abbreviation: user.documentType.abbreviation,
          name: user.documentType.name,
        },
        documentNumber: user.documentNumber,
        avatar: user.avatar || "",
        avatarLetter: user.avatarLetter || DEFAULT_AVATAR_LETTER,
        avatarColor: user.avatarColor || DEFAULT_AVATAR_COLOR,
      },
    };
  }
}