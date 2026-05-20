import GetRolesUseCase from "../application/GetRolesUseCase.js";
import GetRoleByIdUseCase from "../application/GetRoleByIdUseCase.js";
import CreateRoleUseCase from "../application/CreateRoleUseCase.js";
import UpdateRoleUseCase from "../application/UpdateRoleUseCase.js";
import DeleteRoleUseCase from "../application/DeleteRoleUseCase.js";
import GetValidPermissionsUseCase from "../application/GetValidPermissionsUseCase.js";
import { roleRepository } from "./RoleRepositoryMongo.js";
import ToggleRoleStatusUseCase from "../../roles/application/ToggleRoleStatusUseCase.js";


const toggleRoleStatus = new ToggleRoleStatusUseCase(roleRepository);
const getRoles = new GetRolesUseCase(roleRepository);
const getRoleById = new GetRoleByIdUseCase(roleRepository);
const createRole = new CreateRoleUseCase(roleRepository);
const updateRole = new UpdateRoleUseCase(roleRepository);
const deleteRole = new DeleteRoleUseCase(roleRepository);
const getValidPermissions = new GetValidPermissionsUseCase();

export const RoleController = {
  getAll: async (req, res) => {
    try {
      const roles = await getRoles.execute();
      res.json({ success: true, data: roles });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const role = await getRoleById.execute(req.params.id);
      res.json({ success: true, data: role });
    } catch (error) {
      const status = error.message === "Rol no encontrado" ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const role = await createRole.execute(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      const status = error.message.includes("Ya existe") ? 409 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const role = await updateRole.execute(req.params.id, req.body);
      res.json({ success: true, data: role });
    } catch (error) {
      const status = error.message === "Rol no encontrado" ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      await deleteRole.execute(req.params.id);
      res.json({ success: true, message: "Rol eliminado correctamente" });
    } catch (error) {
      const status =
        error.message === "Rol no encontrado"
          ? 404
          : error.message.includes("No se pueden eliminar")
          ? 403
          : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  getPermissions: (req, res) => {
    try {
      const permissions = getValidPermissions.execute();
      res.json({ success: true, data: permissions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  toggleStatus: async (req, res) => {
    try {
        const result = await toggleRoleStatus.execute(req.params.id);
        res.json({ success: true, data: result });
    } catch (error) {
        const status =
            error.message === "Rol no encontrado" ? 404 :error.message.includes("No se puede") ? 403 : 400;
        res.status(status).json({ success: false, message: error.message });
    }
},
};