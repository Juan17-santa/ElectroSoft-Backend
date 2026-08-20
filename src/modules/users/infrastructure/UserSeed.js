// src/modules/users/infrastructure/UserSeed.js
import { UserModel } from "./UserModel.js";
import { RoleModel } from "../../roles/infrastructure/RoleModel.js";
import { DocumentTypeModel } from "../../../shared/infrastructure/models/DocumentTypeModel.js";
import { encryptPassword } from "../../../infrastructure/security/passwordEncrypter.js";

export const seedAdminUser = async () => {
  const adminName = process.env.DEFAULT_ADMIN_NAME;
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const adminRoleName = process.env.DEFAULT_ADMIN_ROLE;

  if (!adminName || !adminEmail || !adminPassword || !adminRoleName) {
    throw new Error("Faltan DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD o DEFAULT_ADMIN_ROLE");
  }

  const existing = await UserModel.findOne({ email: adminEmail.toLowerCase() });
  if (existing) return;

  const adminRole = await RoleModel.findOne({ name: adminRoleName });
  if (!adminRole) throw new Error("Rol Administrador no encontrado");

  const docType = await DocumentTypeModel.findOne();
  if (!docType) throw new Error("No hay tipos de documento");

  const hashedPassword = await encryptPassword(adminPassword);

  await UserModel.create({
    fullName: adminName,
    email: adminEmail.toLowerCase(),
    password: hashedPassword,
    phone: "0000000000",
    documentType: docType._id,
    documentNumber: "0000000000",
    role: adminRole._id,
    isActive: true,
  });

  console.log("Usuario administrador sembrado correctamente");
};