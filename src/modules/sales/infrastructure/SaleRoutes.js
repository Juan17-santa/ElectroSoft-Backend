/**
 * Rutas HTTP del módulo Sales.
 *
 * Define los endpoints disponibles y los conecta con el controlador.
 *
 * Endpoints:
 * - POST   /                      → Crear venta
 * - PATCH  /:id/cancel            → Anular venta
 * - GET    /:id/cancel            → Rechazado (método no permitido)
 * - GET    /:id/cancellation-status → Verificar si se puede anular
 * - GET    /                      → Obtener todas las ventas
 * - GET    /:id                   → Obtener venta por ID
 */
import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import {
    createSale,
    cancelSale,
    getSaleCancellationStatus,
    getSales,
    getSalesByIds,
    getSaleById,
    rejectGetCancelSale,
} from "./SaleController.js";

const router = Router();

router.post("/", requireAuth, requirePermission("ventas:crear"), createSale);
router.get("/", requireAuth, requirePermission("ventas:acceso", "ventas:ver"), getSales);
// Debe registrarse antes de "/:id" para no ser capturado como un ID.
router.get("/by-ids", requireAuth, requirePermission("ventas:ver"), getSalesByIds);
router.get("/:id/cancellation-status", requireAuth, requirePermission("ventas:ver"), getSaleCancellationStatus);
router.get("/:id/cancel", requireAuth, rejectGetCancelSale);
router.patch("/:id/cancel", requireAuth, requirePermission("ventas:anular"), cancelSale);
router.get("/:id", requireAuth, requirePermission("ventas:ver"), getSaleById);

export default router;
