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
    exportShopping,
    getShoppingCancellationStatus,
    getShopping,
    getShoppingById,
    rejectGetCancelShopping,
    getMisEstadisticasCompras,
    getMisComprasMensuales, 
} from "./Shopping.Controller.js";

const router = Router();

router.post("/", requireAuth, requirePermission("compras:crear"), createShopping);

router.get("/mis-estadisticas", requireAuth, getMisEstadisticasCompras);
router.get("/mis-compras-mensuales", requireAuth, getMisComprasMensuales);

router.get("/invoice-exists/:number", requireAuth, requirePermission("compras:acceso", "compras:ver"), checkInvoiceExists);
router.get("/export", requireAuth, requirePermission("compras:reporte"), exportShopping);
router.get("/:id/cancellation-status", requireAuth, requirePermission("compras:acceso", "compras:ver", "compras:anular"), getShoppingCancellationStatus);
router.get("/:id/cancel", requireAuth, requirePermission("compras:anular"), rejectGetCancelShopping);
router.patch("/:id/cancel", requireAuth, requirePermission("compras:anular"), cancelShopping);
router.get("/:id", requireAuth, requirePermission("compras:acceso", "compras:ver"), getShoppingById);
router.get("/", requireAuth, requirePermission("compras:acceso", "compras:ver"), getShopping);

export default router;
