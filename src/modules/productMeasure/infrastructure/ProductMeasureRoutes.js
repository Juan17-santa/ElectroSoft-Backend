/**
 * Rutas de la API para medidas de producto
 * 
 * Endpoints:
 * - POST   /            → Crear medida
 * - GET    /            → Obtener todas las medidas
 * - DELETE /:id         → Eliminar medida
 */

import { Router } from "express";
import { createMeasure, getMeasures, deleteMeasure } from "./ProductMeasureController.js";

const router = Router();

router.post("/", createMeasure);
router.get("/", getMeasures);
router.delete("/:id", deleteMeasure);

export default router;
