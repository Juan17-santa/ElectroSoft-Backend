// src/modules/users/infrastructure/UserSeed.js
import { UserModel } from "./UserModel.js";
import { RoleModel } from "../../roles/infrastructure/RoleModel.js";
import { DocumentTypeModel } from "../../../shared/infrastructure/models/DocumentTypeModel.js";
import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

export const seedAdminUser = async () => {
  const existing = await UserModel.findOne({ email: "administrador@gmail.com" });
  if (existing) return;

  const adminRole = await RoleModel.findOne({ name: "Administrador" });
  if (!adminRole) throw new Error("Rol Administrador no encontrado");

  const docType = await DocumentTypeModel.findOne();
  if (!docType) throw new Error("No hay tipos de documento");

  const hashedPassword = await encryptPassword("123456");

  await UserModel.create({
    fullName: "Administrador del Sistema",
    email: "administrador@gmail.com",
    password: hashedPassword,
    phone: "0000000000",
    documentType: docType._id,
    documentNumber: "0000000000",
    role: adminRole._id,
    isActive: true,
  });

  console.log("✅ Usuario administrador sembrado correctamente");
};