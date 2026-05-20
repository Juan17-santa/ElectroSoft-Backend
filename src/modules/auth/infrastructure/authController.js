import LoginUseCase from "../../auth/application/LoginUseCase.js";
import SendVerificationCodeUseCase from "../../auth/application/SendVerificationCodeUseCase.js";
import VerifyCodeUseCase from "../../auth/application/VerifyCodeUseCase.js";
import ResetPasswordUseCase from "../../auth/application/ResetPasswordUseCase.js";
import ChangePasswordUseCase from "../../auth/application/ChangePasswordUseCase.js";
import { userRepository } from "../../../modules/users/infrastructure/UserRepositoryMongo.js";
import { verificationCodeRepository } from "../infrastructure/VerificationCodeRepositoryMongo.js";

const login = new LoginUseCase(userRepository);
const sendCode = new SendVerificationCodeUseCase(userRepository, verificationCodeRepository);
const verifyCode = new VerifyCodeUseCase(verificationCodeRepository);
const resetPassword = new ResetPasswordUseCase(userRepository, verificationCodeRepository);
const changePassword = new ChangePasswordUseCase(userRepository);

export const AuthController = {
  login: async (req, res) => {
    try {
      const result = await login.execute(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  },

  sendCode: async (req, res) => {
    try {
      const result = await sendCode.execute(req.body);
      // Devuelve el código para que el frontend lo envíe al correo
      res.json({ success: true, data: result });
    } catch (error) {
      const status = error.message.includes("No existe") ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  verifyCode: async (req, res) => {
    try {
      const result = await verifyCode.execute(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const result = await resetPassword.execute(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      const status = error.message.includes("incorrecto") ? 400 : 404;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  changePassword: async (req, res) => {
    try {
      // req.user.id viene del middleware de autenticación (JWT)
      const result = await changePassword.execute({
        userId: req.user.id,
        ...req.body,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      const status =
        error.message.includes("incorrecta") ? 401 :
        error.message === "Usuario no encontrado" ? 404 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  },
};