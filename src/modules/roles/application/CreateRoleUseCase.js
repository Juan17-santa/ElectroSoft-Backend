import RoleEntity from "../domain/RoleEntity.js";

export default class CreateRoleUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute({ name, description, permissions }) {
    const roleEntity = new RoleEntity({ name, description, permissions });

    const existing = await this.roleRepository.findByName(roleEntity.name);
    if (existing) throw new Error("Ya existe un rol con ese nombre");

    return await this.roleRepository.create({
      name: roleEntity.name,
      description: roleEntity.description,
      permissions: roleEntity.permissions,
    });
  }
}