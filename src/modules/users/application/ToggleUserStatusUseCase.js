export default class ToggleUserStatusUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id) {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("Usuario no encontrado");

    const updatedUser = await this.userRepository.update(id, {
      isActive: !user.isActive,
    });

    return {
      message: `Usuario ${updatedUser.isActive ? "activado" : "desactivado"} correctamente`,
      isActive: updatedUser.isActive,
    };
  }
}