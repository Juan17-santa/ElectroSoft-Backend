import { UserModel } from "./UserModel.js";

export const userRepository = {
  findAll: async () => {
    return await UserModel.find()
      .select("-password")
      .populate("documentType", "name abbreviation")
      .populate("role", "name permissions isActive");
  },

  findById: async (id) => {
    return await UserModel.findById(id)
      .select("-password")
      .populate("documentType", "name abbreviation")
      .populate("role", "name permissions isActive");
  },

  findByIdWithPassword: async (id) => {
    return await UserModel.findById(id)
      .populate("documentType", "name abbreviation")
      .populate("role", "name permissions isActive");
  },

  findByEmail: async (email) => {
    return await UserModel.findOne({ email })
      .populate("role", "name permissions isActive");
  },

  findByDocument: async (documentNumber) => {
    return await UserModel.findOne({ documentNumber }).select("-password");
  },

  create: async (userData) => {
    const user = await UserModel.create(userData);
    return await UserModel.findById(user._id)
      .select("-password")
      .populate("documentType", "name abbreviation")
      .populate("role", "name permissions isActive");
  },

  update: async (id, userData) => {
    return await UserModel.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("documentType", "name abbreviation")
      .populate("role", "name permissions isActive");
  },

  delete: async (id) => {
    return await UserModel.findByIdAndDelete(id);
  },
};