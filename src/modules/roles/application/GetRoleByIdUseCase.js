export default class GetRoleByIdUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(id) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new Error("Rol no encontrado");
    return role;
  }
}