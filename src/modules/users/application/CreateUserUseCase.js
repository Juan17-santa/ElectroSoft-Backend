import UserEntity from "../domain/UserEntity.js";
import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

const DEFAULT_PASSWORD = "123456";

export default class CreateUserUseCase {
  constructor(userRepository, roleRepository, documentTypeRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.documentTypeRepository = documentTypeRepository;
  }

  async execute({ fullName, email, phone, documentType, documentNumber, role }) {
    // 1. Validar que el rol existe
    const roleExists = await this.roleRepository.findById(role);
    if (!roleExists) throw new Error("El rol seleccionado no existe");

    // 2. Validar que el tipo de documento existe
    const documentTypeExists = await this.documentTypeRepository.findById(documentType);
    if (!documentTypeExists) throw new Error("El tipo de documento seleccionado no existe");

    // 3. Validar reglas de negocio (password por defecto para pasar la entidad)
    const userEntity = new UserEntity({
      fullName,
      email,
      password: DEFAULT_PASSWORD,
      phone,
      documentType,
      documentNumber,
      role,
    });

    // 4. Verificar email único
    const existingEmail = await this.userRepository.findByEmail(userEntity.email);
    if (existingEmail) throw new Error("El email ya está registrado");

    // 5. Verificar documento único
    const existingDocument = await this.userRepository.findByDocument(userEntity.documentNumber);
    if (existingDocument) throw new Error("El número de documento ya está registrado");

    // 6. Hashea la contraseña por defecto y guarda
    const hashedPassword = await encryptPassword(DEFAULT_PASSWORD);

    return await this.userRepository.create({
      fullName: userEntity.fullName,
      email: userEntity.email,
      password: hashedPassword,
      phone: userEntity.phone,
      documentType: userEntity.documentType,
      documentNumber: userEntity.documentNumber,
      role: userEntity.role,
    });
  }
}