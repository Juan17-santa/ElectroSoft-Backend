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
import {
    createPayment,
    getPayments,
    getPaymentsByVenta,
    getPaymentById,
} from "./PaymentController.js";

const router = Router();

router.post("/", createPayment);
router.get("/venta/:ventaId", getPaymentsByVenta);
router.get("/", getPayments);
router.get("/:id", getPaymentById);

export default router;
