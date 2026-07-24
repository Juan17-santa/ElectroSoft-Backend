/**
 * GET /api/document-types
 * Obtiene todos los tipos de documento
 */

import { Router } from "express";
import { getDocumentTypeById, getDocumentTypes } from "../controllers/DocumentTypeController.js";

const router = Router();

router.get("/", getDocumentTypes);
router.get("/:id", getDocumentTypeById)

export default router;