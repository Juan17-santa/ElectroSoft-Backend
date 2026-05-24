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
import {
    createSale,
    cancelSale,
    getSaleCancellationStatus,
    getSales,
    getSaleById,
    rejectGetCancelSale,
} from "./SaleController.js";

const router = Router();

router.post("/", createSale);
router.get("/:id/cancellation-status", getSaleCancellationStatus);
router.get("/:id/cancel", rejectGetCancelSale);
router.patch("/:id/cancel", cancelSale);
router.get("/", getSales);
router.get("/:id", getSaleById);

export default router;
