/**
 * Rutas de la API para proveedores.
 * 
 * Define los endpoints disponibles y los conecta con el controlador.
 * 
 * Endpoints:
 * - POST   /            → Crear proveedores
 * - GET    /            → Obtener todos los proveedores
 * - GET    /:id         → Obtener proveeedor por ID
 * - PUT    /:id         → Actualizar proveedor
 * - DELETE /:id         → Eliminar proveedor
 * - PATCH  /:id/status  → Cambiar estado del proveedor
 */

import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import { changeStatusProvider, createProvider, deleteProvider, getProviders, getProviderById, updateProvider, checkProviderUnique } from "./ProviderController.js";


const router = Router();

router.post("/", requireAuth, requirePermission("proveedores:crear"), createProvider);
router.post("/check-unique", requireAuth, requirePermission("proveedores:acceso", "proveedores:ver"), checkProviderUnique);
router.get("/", requireAuth, requirePermission("proveedores:acceso", "proveedores:ver"), getProviders);
router.get("/:id", requireAuth, requirePermission("proveedores:ver"), getProviderById);
router.put("/:id", requireAuth, requirePermission("proveedores:editar"), updateProvider);
router.delete("/:id", requireAuth, requirePermission("proveedores:eliminar"), deleteProvider);
router.patch("/:id/status", requireAuth, requirePermission("proveedores:estado"), changeStatusProvider);

export default router;