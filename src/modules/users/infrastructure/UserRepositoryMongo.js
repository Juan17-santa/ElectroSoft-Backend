// modules/users/infrastructure/userRepository.js
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
    const result = await UserModel.findByIdAndUpdate(
      id,
      { $set: userData },
      { returnDocument: "after", runValidators: true }
    )
      .select("-password")
      .populate("documentType", "name abbreviation")
      .populate("role", "name permissions isActive");
    return result;
  },

  delete: async (id) => {
    return await UserModel.findByIdAndDelete(id);
  },

  findByRole: async (roleId) => {
    return await UserModel.find({ role: roleId }).select("fullName email");
  },

  findByEmailExcluding: async (email, excludeId) => {
    const query = { email: email.toLowerCase() };
    if (excludeId) query._id = { $ne: excludeId };
    return await UserModel.findOne(query).select("_id");
  },

  findByDocumentExcluding: async (documentNumber, excludeId) => {
    const query = { documentNumber };
    if (excludeId) query._id = { $ne: excludeId };
    return await UserModel.findOne(query).select("_id");
  },

};

