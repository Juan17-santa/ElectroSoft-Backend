export default class ToggleRoleStatusUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new Error("Rol no encontrado");

    // Proteger roles del sistema
    const PROTECTED_ROLES = ["Administrador", "Empleado"];
    if (PROTECTED_ROLES.includes(role.name)) {
      throw new Error("No se puede desactivar un rol del sistema");
    }

    const updatedRole = await this.roleRepository.update(id, {
      isActive: !role.isActive,
    });

    return {
      message: `Rol ${updatedRole.isActive ? "activado" : "desactivado"} correctamente`,
      isActive: updatedRole.isActive,
    };
  }
}