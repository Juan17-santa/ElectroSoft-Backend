import { verifyToken } from "../security/tokenGenerator.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Token no enviado");

    const token = authHeader.split(" ")[1]; // Bearer <token>
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ ok: false, error: "No autorizado" });
  }
};