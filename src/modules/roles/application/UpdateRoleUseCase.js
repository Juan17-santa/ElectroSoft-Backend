import RoleEntity from "../domain/RoleEntity.js";

export default class UpdateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id, { name, description, permissions }) {
    const existing = await this.roleRepository.findById(id);
    if (!existing) throw new Error("Rol no encontrado");

    const updateData = {};

    if (name) {
      // Verificar nombre duplicado case-insensitive
      const duplicate = await this.roleRepository.findByName(name);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new Error("Ya existe un rol con ese nombre");
      }

      const roleEntity = new RoleEntity({
        name,
        description: description ?? existing.description,
        permissions: permissions ?? existing.permissions,
      });
      updateData.name = roleEntity.name;
      updateData.description = roleEntity.description;
      updateData.permissions = roleEntity.permissions;
    } else {
      if (description !== undefined) updateData.description = description.trim();
      if (permissions) {
        const roleEntity = new RoleEntity({
          name: existing.name,
          permissions,
        });
        updateData.permissions = roleEntity.permissions;
      }
    }

    return await this.roleRepository.update(id, updateData);
  }
}