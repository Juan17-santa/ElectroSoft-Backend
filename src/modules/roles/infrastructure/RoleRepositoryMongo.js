import { RoleModel } from "../infrastructure/RoleModel.js";

export const roleRepository = {
  findAll: async () => {
    return await RoleModel.find().sort({ name: 1 });
  },

  findById: async (id) => {
    return await RoleModel.findById(id);
  },

  findByName: async (name) => {
    return await RoleModel.findOne({ name: name.trim() });
  },

  create: async (roleData) => {
    return await RoleModel.create(roleData);
  },

  update: async (id, roleData) => {
    return await RoleModel.findByIdAndUpdate(id, roleData, {
      returnDocument: "after",
      runValidators: true,
    });
  },

  delete: async (id) => {
    return await RoleModel.findByIdAndDelete(id);
  },
};