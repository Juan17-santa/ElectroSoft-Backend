import GetUsersUseCase from "../application/GetUsersUseCase.js";
import GetUserByIdUseCase from "../application/GetUserByIdUseCase.js";
import CreateUserUseCase from "../application/CreateUserUseCase.js";
import UpdateUserUseCase from "../application/UpdateUserUseCase.js";
import DeleteUserUseCase from "../application/DeleteUserUseCase.js";
import { userRepository } from "./UserRepositoryMongo.js";
import { roleRepository } from "../../roles/infrastructure/RoleRepositoryMongo.js";
import DocumentTypeRepositoryMongo from "../../../shared/infrastructure/repositories/DocumentTypeRepositoryMongo.js";
import ToggleUserStatusUseCase from "../application/ToggleUserStatusUseCase.js";

const documentTypeRepository = new DocumentTypeRepositoryMongo();
const toggleUserStatus = new ToggleUserStatusUseCase(userRepository);

const getUsers       = new GetUsersUseCase(userRepository);
const getUserById    = new GetUserByIdUseCase(userRepository);
const createUser     = new CreateUserUseCase(userRepository, roleRepository, documentTypeRepository);
const updateUser     = new UpdateUserUseCase(userRepository, roleRepository, documentTypeRepository);
const deleteUser     = new DeleteUserUseCase(userRepository);

export const UserController = {
  getAll: async (req, res) => {
    try {
      const users = await getUsers.execute();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await getUserById.execute(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      const status = error.message === "Usuario no encontrado" ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const user = await createUser.execute(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      const status =
        error.message.includes("ya está registrado") ? 409 :
        error.message.includes("no existe") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const user = await updateUser.execute(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      const status =
        error.message === "Usuario no encontrado" ? 404 :
        error.message.includes("ya está registrado") ? 409 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await deleteUser.execute(req.params.id);
      res.json({ success: true, message: "Usuario eliminado correctamente" });
    } catch (error) {
      const status = error.message === "Usuario no encontrado" ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },
  
  toggleStatus: async (req, res) => {
    try {
      const result = await toggleUserStatus.execute(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      const status = error.message === "Usuario no encontrado" ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },
};