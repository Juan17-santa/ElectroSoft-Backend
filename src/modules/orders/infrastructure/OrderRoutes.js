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
import {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder,
    confirmOrder,
} from "./OrderController.js";

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.patch("/:id/cancel", cancelOrder);
router.patch("/:id/confirm", confirmOrder);

export default router;
