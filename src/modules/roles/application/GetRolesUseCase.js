export default class GetRolesUseCase {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute() {
    return await this.roleRepository.findAll();
  }
}