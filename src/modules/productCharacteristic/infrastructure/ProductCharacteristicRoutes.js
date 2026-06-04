/**
 * Rutas de la API para características de producto
 * 
 * Endpoints:
 * - POST   /            → Crear característica
 * - GET    /            → Obtener todas las características
 * - DELETE /:id         → Eliminar característica
 */

import { Router } from "express";
import { createCharacteristic, getCharacteristics, deleteCharacteristic } from "./ProductCharacteristicController.js";

const router = Router();

router.post("/", createCharacteristic);
router.get("/", getCharacteristics);
router.delete("/:id", deleteCharacteristic);

export default router;
