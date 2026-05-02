/**
 * GET /api/document-types
 * Obtiene todos los tipos de documento
 */

import { Router } from "express";
import { getDocumentTypes } from "../controllers/DocumentTypeController.js";

const router = Router();

router.get("/", getDocumentTypes);

export default router;