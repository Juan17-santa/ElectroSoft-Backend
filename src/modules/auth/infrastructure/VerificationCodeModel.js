import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  codeHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL: elimina el documento cuando expiresAt llegue
  },
  used: {
    type: Boolean,
    default: false,
  },
});

export const VerificationCodeModel = mongoose.model(
  "VerificationCode",
  verificationCodeSchema
);