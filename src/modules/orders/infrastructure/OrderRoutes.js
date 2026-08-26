/**
 * Rutas de la API para pedidos.
 *
 * Define los endpoints del módulo orders y los conecta con su controlador.
 *
 * Endpoints:
 * - POST   /             → Crear pedido
 * - GET    /             → Obtener todos los pedidos
 * - GET    /:id          → Obtener pedido por ID
 * - PATCH  /:id/cancel   → Cancelar pedido manualmente
 * - PATCH  /:id/confirm  → Confirmar pedido y preparar su conversión a venta
 */

import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import {
    createOrder,
    updateOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    confirmOrder,
} from "./OrderController.js";

const router = Router();

router.post("/", requireAuth, requirePermission("pedidos:procesar"), createOrder);
router.put("/:id", requireAuth, requirePermission("pedidos:editar"), updateOrder);
router.get("/", requireAuth, requirePermission("pedidos:acceso", "pedidos:ver"), getOrders);
router.get("/:id", requireAuth, requirePermission("pedidos:ver"), getOrderById);
router.patch("/:id/cancel", requireAuth, requirePermission("pedidos:anular"), cancelOrder);
router.patch("/:id/confirm", requireAuth, requirePermission("pedidos:procesar"), confirmOrder);

export default router;
