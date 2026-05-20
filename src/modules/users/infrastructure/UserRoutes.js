import { Router } from "express";
import { UserController } from "./UserController.js";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";

const router = Router();

router.get("/", requireAuth, requirePermission("usuarios:ver"), UserController.getAll);
router.get("/:id", requireAuth, requirePermission("usuarios:ver"), UserController.getById);
router.post("/", requireAuth, requirePermission("usuarios:crear"), UserController.create);
router.put("/:id", requireAuth, requirePermission("usuarios:editar"), UserController.update);
router.delete("/:id", requireAuth, requirePermission("usuarios:eliminar"), UserController.delete);
router.patch("/:id/toggle-status", requireAuth, requirePermission("usuarios:estado"), UserController.toggleStatus);

export default router;