import mongoose from "mongoose";
import { AVATAR_COLORS, AVATAR_LETTERS, DEFAULT_AVATAR_COLOR, DEFAULT_AVATAR_LETTER } from "../domain/avatarOptions.js";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentType",
      required: true,
    },
    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // para la foto de perfil del usuario
    avatar: {
      type: String,
      default: "",
    },
    avatarLetter: {
      type: String,
      enum: AVATAR_LETTERS,
      default: DEFAULT_AVATAR_LETTER,
    },
    avatarColor: {
      type: String,
      enum: AVATAR_COLORS,
      default: DEFAULT_AVATAR_COLOR,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = mongoose.model("users", userSchema);