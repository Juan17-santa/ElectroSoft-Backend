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

router.post("/", createOrder); // LISTOOO **** cuadrar el iva
router.get("/", getOrders); // LISTOOO
router.get("/:id", getOrderById); // LISTOOOO
router.patch("/:id/cancel", cancelOrder); /// LISTO
router.patch("/:id/confirm", confirmOrder);

export default router;
