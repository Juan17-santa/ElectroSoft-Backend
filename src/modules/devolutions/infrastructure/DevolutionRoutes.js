import { Router } from "express";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";
import { requirePermission } from "../../../infrastructure/middlewares/requirePermission.js";
import {
    anularDevolution,
    confirmDevolution,
    createBatchDevolutions,
    createDevolution,
    getDevolutionById,
    getDevolutions,
    getDevolutionsBySaleId,
    updateDevolution,
} from "./DevolutionController.js";

const router = Router();

router.post("/", requireAuth, requirePermission("devoluciones:ver"), createDevolution);
router.post("/batch", requireAuth, requirePermission("devoluciones:ver"), createBatchDevolutions);
router.patch("/:id", requireAuth, requirePermission("devoluciones:editar"), updateDevolution);
router.patch("/:id/anular", requireAuth, requirePermission("devoluciones:anular"), anularDevolution);
router.patch("/:id/confirm", requireAuth, requirePermission("devoluciones:ver"), confirmDevolution);
router.get("/", requireAuth, requirePermission("devoluciones:acceso", "devoluciones:ver"), getDevolutions);
router.get("/sale/:saleId", requireAuth, requirePermission("devoluciones:ver"), getDevolutionsBySaleId);
router.get("/:id", requireAuth, requirePermission("devoluciones:ver"), getDevolutionById);

export default router;
