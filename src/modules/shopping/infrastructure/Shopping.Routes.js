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
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import {
    cancelShopping,
    checkInvoiceExists,
    createShopping,
    getShoppingCancellationStatus,
    getShopping,
    getShoppingById,
    rejectGetCancelShopping,
} from "./Shopping.Controller.js";

const router = Router();

router.post("/", requireAuth, requirePermission("compras:crear"), createShopping);
router.get("/invoice-exists/:number", requireAuth, requirePermission("compras:acceso", "compras:ver"), checkInvoiceExists);
router.get("/:id/cancellation-status", requireAuth, requirePermission("compras:ver"), getShoppingCancellationStatus);
router.get("/:id/cancel", requireAuth, rejectGetCancelShopping);
router.patch("/:id/cancel", requireAuth, requirePermission("compras:anular"), cancelShopping);
router.get("/", requireAuth, requirePermission("compras:acceso", "compras:ver"), getShopping);
router.get("/:id", requireAuth, requirePermission("compras:ver"), getShoppingById);

export default router;
