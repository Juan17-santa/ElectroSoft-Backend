/**
 * Rutas de la API para categorías de productos.
 * 
 * Define los endpoints disponibles y los conecta con el controlador.
 * 
 * Endpoints:
 * - POST   /            → Crear categoría
 * - GET    /            → Obtener todas las categorías
 * - GET    /:id         → Obtener categoría por ID
 * - PUT    /:id         → Actualizar categoría
 * - DELETE /:id         → Eliminar categoría
 * - PATCH  /:id/status  → Cambiar estado de la categoría
 */

import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import { changeStatusProductCategory, createProductCategory, deleteProductCategory, getProductCategory, getProductCategoryById, updateProductCategory } from "./ProductCategory.Controller.js";

const router = Router();

router.post("/", requireAuth, requirePermission("categorias:crear"), createProductCategory);
router.get("/", requireAuth, requirePermission("categorias:acceso", "categorias:ver"), getProductCategory);
router.get("/:id", requireAuth, requirePermission("categorias:ver"), getProductCategoryById);
router.put("/:id", requireAuth, requirePermission("categorias:editar"), updateProductCategory);
router.delete("/:id", requireAuth, requirePermission("categorias:eliminar"), deleteProductCategory);
router.patch("/:id/status", requireAuth, requirePermission("categorias:estado"), changeStatusProductCategory);

export default router;