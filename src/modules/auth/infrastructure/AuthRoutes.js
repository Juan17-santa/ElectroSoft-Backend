import { Router } from "express";
import { AuthController } from "../infrastructure/authController.js";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";

const router = Router();

// Rutas públicas (no requieren token)
router.post("/login", AuthController.login);
router.post("/send-code", AuthController.sendCode);
router.post("/verify-code", AuthController.verifyCode);
router.post("/reset-password", AuthController.resetPassword);

// Ruta protegida (requiere token JWT)
router.post("/change-password", requireAuth, AuthController.changePassword);

export default router;