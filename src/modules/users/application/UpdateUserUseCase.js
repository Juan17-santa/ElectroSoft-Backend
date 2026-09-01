import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";
import { DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_LETTER, isValidAvatar } from "../domain/avatarOptions.js";

export default class UpdateUserUseCase {
  constructor(userRepository, roleRepository, documentTypeRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.documentTypeRepository = documentTypeRepository;
  }

  async execute(id, { fullName, email, password, phone, documentType, documentNumber, role, avatarLetter, avatarColor, avatar }, authenticatedUser) {
    // 1. Verificar que el usuario existe
    const existing = await this.userRepository.findById(id);
    if (!existing) throw new Error("Usuario no encontrado");

    // 2. Validar permisos: administrador puede editar a cualquiera, y cualquier usuario puede editarse a sí mismo
    if (authenticatedUser && authenticatedUser.role !== "Administrador") {
      const currentUserId = authenticatedUser._id?.toString?.() || authenticatedUser.id?.toString?.();
      if (currentUserId !== id) {
        throw new Error("No tienes permiso para editar este usuario");
      }
    }

    const updateData = {};
    
    const toTitleCase = (str) =>
      str.split(" ")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

    // 2. Validar y asignar campos opcionales
    if (fullName) {
      const normalizedName = fullName.trim();
      if (normalizedName.length < 3)
        throw new Error("El nombre completo debe tener al menos 3 caracteres");
      if (normalizedName.length > 40)
        throw new Error("El nombre completo no puede superar 40 caracteres");
      if (!/^[\p{L}\s]+$/u.test(normalizedName))
        throw new Error("El nombre completo solo puede contener letras y espacios");
      if (/\s{2,}/.test(normalizedName))
        throw new Error("El nombre completo no puede contener espacios dobles");
      updateData.fullName = toTitleCase(normalizedName);
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
      if (!/^\d{8,14}$/.test(phone.trim()))
        throw new Error("El teléfono debe tener entre 8 y 14 dígitos");
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
      if (!/^\d{8,12}$/.test(documentNumber.trim()))
        throw new Error("El documento debe tener entre 8 y 12 dígitos");
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

    if (avatarLetter !== undefined || avatarColor !== undefined) {
      const nextLetter = avatarLetter || existing.avatarLetter || DEFAULT_AVATAR_LETTER;
      const nextColor = avatarColor || existing.avatarColor || DEFAULT_AVATAR_COLOR;
      if (!isValidAvatar(nextLetter, nextColor)) {
        throw new Error("El avatar seleccionado no es válido");
      }
      updateData.avatarLetter = nextLetter;
      updateData.avatarColor = nextColor;
      updateData.avatar = "";
    }

    return await this.userRepository.update(id, updateData);
  }
}