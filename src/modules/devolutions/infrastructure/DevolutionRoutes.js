/**
 * Rutas HTTP del módulo Devolutions.
 *
 * Define los endpoints disponibles y los conecta con el controlador.
 *
 * Endpoints:
 * - POST   /              -> Crear devolución.
 * - PATCH  /:id/confirm   -> Confirmar devolución.
 * - GET    /              -> Obtener todas las devoluciones.
 * - GET    /:id           -> Obtener devolución por ID.
 */
import { Router } from "express";
import {
    confirmDevolution,
    createDevolution,
    getDevolutionById,
    getDevolutions,
} from "./DevolutionController.js";

const router = Router();

router.post("/", createDevolution);
router.patch("/:id/confirm", confirmDevolution);
router.get("/", getDevolutions);
router.get("/:id", getDevolutionById);

export default router;
