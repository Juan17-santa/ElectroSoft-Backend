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
import { changeStatusProductCategory, createProductCategory, deleteProductCategory, getProductCategory, getProductCategoryById, updateProductCategory } from "./ProductCategory.Controller.js";

const router = Router();

router.post("/", createProductCategory)
router.get("/", getProductCategory)
router.get("/:id", getProductCategoryById)
router.put("/:id", updateProductCategory)
router.delete("/:id", deleteProductCategory)
router.patch("/:id/status", changeStatusProductCategory);

export default router;