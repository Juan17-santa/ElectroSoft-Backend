import { Router } from "express";
import NotificationController from "./NotificationController.js";

const router = Router();

router.get("/", NotificationController.getRecent);
router.put("/mark-read", NotificationController.markAsRead);

export default router;
