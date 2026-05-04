/**
 * Rutas HTTP del módulo Shopping.
 *
 * Define los endpoints disponibles y los conecta con el controlador.
 *
 * Endpoints:
 * - POST   /              -> Crear compra.
 * - PATCH  /:id/cancel    -> Anular compra.
 * - GET    /              -> Obtener todas las compras.
 * - GET    /:id           -> Obtener compra por ID.
 */
import { Router } from "express";
import {
    cancelShopping,
    createShopping,
    getShopping,
    getShoppingById,
} from "./ShoppingController.js";

const router = Router();

router.post("/", createShopping);
router.patch("/:id/cancel", cancelShopping);
router.get("/", getShopping);
router.get("/:id", getShoppingById);

export default router;
