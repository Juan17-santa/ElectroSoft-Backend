import { Router } from "express";
import { RoleController } from "../infrastructure/RoleController.js";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";

const router = Router();

// Permisos válidos agrupados — cualquier autenticado (el frontend los necesita al crear roles)
router.get("/permissions", requireAuth, RoleController.getPermissions);

// Todos requieren roles:acceso
router.get("/", requireAuth, requirePermission("roles:acceso"), RoleController.getAll);
router.get("/:id", requireAuth, requirePermission("roles:acceso"), RoleController.getById);
router.post("/", requireAuth, requirePermission("roles:acceso"), RoleController.create);
router.put("/:id", requireAuth, requirePermission("roles:acceso"), RoleController.update);
router.delete("/:id", requireAuth, requirePermission("roles:acceso"), RoleController.delete);
router.patch("/:id/toggle-status", requireAuth, requirePermission("roles:acceso"), RoleController.toggleStatus);

export default router;