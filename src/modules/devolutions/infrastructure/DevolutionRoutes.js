import { Router } from "express";
import {
    anularDevolution,
    confirmDevolution,
    createDevolution,
    getDevolutionById,
    getDevolutions,
    getDevolutionsBySaleId,
    updateDevolution,
} from "./DevolutionController.js";

const router = Router();

router.post("/", createDevolution);
router.patch("/:id", updateDevolution);
router.patch("/:id/anular", anularDevolution);
router.patch("/:id/confirm", confirmDevolution);
router.get("/", getDevolutions);
router.get("/sale/:saleId", getDevolutionsBySaleId);
router.get("/:id", getDevolutionById);

export default router;
