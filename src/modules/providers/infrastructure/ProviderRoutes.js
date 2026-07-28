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
import { changeStatusProvider, createProvider, deleteProvider, getProviders, getProviderById, updateProvider, checkProviderUnique } from "./ProviderController.js";


const router = Router();

router.post("/", createProvider)
router.post("/check-unique", checkProviderUnique);
router.get("/", getProviders)
router.get("/:id", getProviderById)
router.put("/:id", updateProvider)
router.delete("/:id", deleteProvider)
router.patch("/:id/status", changeStatusProvider);

export default router;