import { VerificationCodeModel } from "../infrastructure/VerificationCodeModel.js";

export const verificationCodeRepository = {
  // Elimina cualquier código previo del mismo email antes de crear uno nuevo
  deleteByEmail: async (email) => {
    return await VerificationCodeModel.deleteMany({ email: email.toLowerCase() });
  },

  create: async ({ email, codeHash, expiresAt }) => {
    return await VerificationCodeModel.create({ email, codeHash, expiresAt });
  },

  // Busca el código más reciente no usado y no expirado
  findValidByEmail: async (email) => {
    return await VerificationCodeModel.findOne({
      email: email.toLowerCase(),
      used: false,
      expiresAt: { $gt: new Date() },
    }).sort({ expiresAt: -1 });
  },

  markAsUsed: async (id) => {
    return await VerificationCodeModel.findByIdAndUpdate(id, { used: true });
  },
};