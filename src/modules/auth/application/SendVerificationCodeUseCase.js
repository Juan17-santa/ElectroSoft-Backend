import VerificationCodeEntity from "../domain/VerificationCodeEntity.js";
import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

export default class SendVerificationCodeUseCase {
  constructor(userRepository, verificationCodeRepository) {
    this.userRepository = userRepository;
    this.verificationCodeRepository = verificationCodeRepository;
  }

  async execute({ email }) {
    if (!email) throw new Error("El email es obligatorio");

    // Verifica que el email esté registrado
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error("No existe una cuenta con ese email");

    // Genera el código
    const rawCode = VerificationCodeEntity.generate();
    const entity = new VerificationCodeEntity({ email, code: rawCode });

    // Hashea el código antes de guardarlo (seguridad)
    const codeHash = await encryptPassword(rawCode);

    // Elimina códigos anteriores del mismo email
    await this.verificationCodeRepository.deleteByEmail(entity.email);

    // Guarda el código hasheado
    await this.verificationCodeRepository.create({
      email: entity.email,
      codeHash,
      expiresAt: entity.expiresAt,
    });

    // Devuelve el código en texto plano para que el frontend lo envíe al correo
    return {
      code: rawCode,
      expiresAt: entity.expiresAt,
    };
  }
}