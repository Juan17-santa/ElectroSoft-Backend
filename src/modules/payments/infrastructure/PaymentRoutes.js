/**
 * Rutas HTTP del módulo Payments.
 *
 * Endpoints:
 * - POST  /                    → Registrar un pago/abono
 * - GET   /                    → Listar todos los pagos
 * - GET   /venta/:ventaId      → Pagos de una venta específica
 * - GET   /:id                 → Detalle de un pago por ID
 *
 * IMPORTANTE: /venta/:ventaId debe ir ANTES de /:id
 * para que Express no confunda "venta" como un id.
 */
import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import {
    createPayment,
    getPayments,
    getPaymentsByVenta,
    getPaymentById,
    cancelPayment,
} from "./PaymentController.js";

const router = Router();

router.post("/", requireAuth, requirePermission("pagos:abonar", "ventas:abonar"), createPayment);
router.get("/", requireAuth, requirePermission("pagos:acceso", "pagos:ver"), getPayments);
router.get("/venta/:ventaId", requireAuth, requirePermission("pagos:ver"), getPaymentsByVenta);
router.get("/:id", requireAuth, requirePermission("pagos:ver"), getPaymentById);
router.patch("/:id/cancel", requireAuth, requirePermission("pagos:anular"), cancelPayment);

export default router;
