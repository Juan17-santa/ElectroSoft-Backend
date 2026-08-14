/**
 * Rutas de la API para productos.
 * 
 * Define los endpoints disponibles y los conecta con el controlador.
 * 
 * Endpoints:
 * - POST   /            → Crear producto
 * - GET    /            → Obtener todos los productos
 * - GET    /:id         → Obtener producto por ID
 * - PUT    /:id         → Actualizar producto
 * - DELETE /:id         → Eliminar producto
 * - PATCH  /:id/status  → Cambiar estado del producto
 */

import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, changeStatusProduct } from "./Product.Controller.js";

const router = Router();

router.post("/", requireAuth, requirePermission("productos:crear"), createProduct);
router.get("/", requireAuth, requirePermission("productos:acceso", "productos:ver"), getProducts);
router.get("/:id", requireAuth, requirePermission("productos:ver"), getProductById);
router.put("/:id", requireAuth, requirePermission("productos:editar"), updateProduct);
router.delete("/:id", requireAuth, requirePermission("productos:eliminar"), deleteProduct);
router.patch("/:id/status", requireAuth, requirePermission("productos:estado"), changeStatusProduct);

export default router;
