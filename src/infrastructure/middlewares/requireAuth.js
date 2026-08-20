import { verifyToken } from "../security/tokenGenerator.js";
import { UserModel } from "../../modules/users/infrastructure/UserModel.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Token no proporcionado",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.id)
      .populate("role", "name permissions isActive")
      .select("email isActive role");

    if (!user || !user.isActive || !user.role?.isActive) {
      return res.status(401).json({
        success: false,
        message: "La cuenta no está activa",
      });
    }

    req.user = {
      ...decoded,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    };
    next();
  } catch (error) {
    if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido o expirado",
      });
    }
    console.error("Error al validar autenticación:", error);
    return res.status(401).json({
      success: false,
      message: "No se pudo validar la autenticación",
    });
  }
};