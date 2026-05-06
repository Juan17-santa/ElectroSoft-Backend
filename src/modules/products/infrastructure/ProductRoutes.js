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
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, changeStatusProduct } from "./ProductController.js";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.patch("/:id/status", changeStatusProduct);

export default router;
