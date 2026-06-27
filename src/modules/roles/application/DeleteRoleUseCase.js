export default class DeleteRoleUseCase {
  constructor(roleRepository, userRepository) {
    this.roleRepository = roleRepository;
    this.userRepository = userRepository; // ← agregar
  }

  async execute(id) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) throw new Error("Rol no encontrado");

    const PROTECTED_ROLES = ["Administrador", "Empleado"];
    if (PROTECTED_ROLES.includes(existing.name)) {
      throw new Error("No se pueden eliminar los roles del sistema");
    }

    // ← nuevo: verificar usuarios asignados
    const usersWithRole = await this.userRepository.findByRole(id);
    if (usersWithRole.length > 0) {
      throw new Error(
        `No se puede eliminar el rol porque tiene ${usersWithRole.length} usuario(s) asignado(s)`
      );
    }

    return await this.roleRepository.delete(id);
  }
}