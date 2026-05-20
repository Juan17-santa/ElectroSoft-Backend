export default class DeleteRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) throw new Error("Rol no encontrado");

    // Proteger roles del sistema (seed)
    const PROTECTED_ROLES = ["Administrador", "Empleado"];
    if (PROTECTED_ROLES.includes(existing.name)) {
      throw new Error("No se pueden eliminar los roles del sistema");
    }

    return await this.roleRepository.delete(id);
  }
}