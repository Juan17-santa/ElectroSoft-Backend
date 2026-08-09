import { Router } from "express";
import { RoleController } from "../infrastructure/RoleController.js";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";

const router = Router();

// Públicas para cualquier autenticado
router.get("/permissions", requireAuth, RoleController.getPermissions);
router.get("/list", requireAuth, RoleController.getList); // ← antes de /:id

// Protegidas con permisos granulares
router.get("/", requireAuth, requirePermission("roles:acceso", "roles:ver"), RoleController.getAll);
router.get("/:id", requireAuth, requirePermission("roles:ver"), RoleController.getById);
router.post("/", requireAuth, requirePermission("roles:crear"), RoleController.create);
router.put("/:id", requireAuth, requirePermission("roles:editar"), RoleController.update);
router.delete("/:id", requireAuth, requirePermission("roles:eliminar"), RoleController.delete);
router.patch("/:id/toggle-status", requireAuth, requirePermission("roles:estado"), RoleController.toggleStatus);

export default router;