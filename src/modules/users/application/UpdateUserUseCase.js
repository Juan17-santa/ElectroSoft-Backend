import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

export default class UpdateUserUseCase {
  constructor(userRepository, roleRepository, documentTypeRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.documentTypeRepository = documentTypeRepository;
  }

  async execute(id, { fullName, email, password, phone, documentType, documentNumber, role, avatar }) {
    // 1. Verificar que el usuario existe
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new Error("Usuario no encontrado");

    const updateData = {};
    
    const toTitleCase = (str) =>
      str.split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

    // 2. Validar y asignar campos opcionales
    if (fullName) {
      if (fullName.trim().length < 3)
        throw new Error("El nombre completo debe tener al menos 3 caracteres");
      updateData.fullName = toTitleCase(fullName.trim()); // ← agregar
    }

    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("El email no tiene un formato válido");
      const emailTaken = await this.userRepository.findByEmail(email.toLowerCase());
      if (emailTaken && emailTaken._id.toString() !== id)
        throw new Error("El email ya está registrado por otro usuario");
      updateData.email = email.toLowerCase().trim();
    }

    if (phone) {
      if (!/^\d{7,15}$/.test(phone.trim()))
        throw new Error("El teléfono debe tener entre 7 y 15 dígitos");
      updateData.phone = phone.trim();
    }

    if (role) {
      const roleExists = await this.roleRepository.findById(role);
      if (!roleExists) throw new Error("El rol seleccionado no existe");
      updateData.role = role;
    }

    if (documentType) {
      const documentTypeExists = await this.documentTypeRepository.findById(documentType);
      if (!documentTypeExists) throw new Error("El tipo de documento seleccionado no existe");
      updateData.documentType = documentType;
    }

    if (documentNumber) {
      if (documentNumber.trim().length < 4)
        throw new Error("El número de documento debe tener al menos 4 caracteres");
      const docTaken = await this.userRepository.findByDocument(documentNumber.trim());
      if (docTaken && docTaken._id.toString() !== id)
        throw new Error("El número de documento ya está registrado por otro usuario");
      updateData.documentNumber = documentNumber.trim();
    }

    if (password) {
      if (password.length < 6)
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      updateData.password = await encryptPassword(password);
    }

    if (avatar !== undefined) updateData.avatar = avatar;

    return await this.userRepository.update(id, updateData);
  }
}