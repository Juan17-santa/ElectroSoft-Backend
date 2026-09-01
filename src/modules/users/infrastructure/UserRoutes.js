import { Router } from "express";
import { UserController } from "./UserController.js";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";

const router = Router();

const allowSelfOrAdminEdit = (req, res, next) => {
  const targetUserId = req.params.id?.toString();
  const currentUserId = req.user?.id?.toString();
  const isAdmin = req.user?.role === "Administrador";

  if (isAdmin || targetUserId === currentUserId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "No tienes el permiso requerido",
  });
};

// GET / acepta acceso O ver
router.get("/", requireAuth, requirePermission("usuarios:acceso", "usuarios:ver"), UserController.getAll);

router.get("/check-email", requireAuth, UserController.checkEmail);
router.get("/check-document", requireAuth, UserController.checkDocument);

router.get("/:id", requireAuth, requirePermission("usuarios:ver"), UserController.getById);

router.post("/", requireAuth, requirePermission("usuarios:crear"), UserController.create);
router.put("/:id", requireAuth, allowSelfOrAdminEdit, UserController.update);
router.delete("/:id", requireAuth, requirePermission("usuarios:eliminar"), UserController.delete);
router.patch("/:id/toggle-status", requireAuth, requirePermission("usuarios:estado"), UserController.toggleStatus);

export default router;