import { Router } from "express";
import NotificationController from "./NotificationController.js";
import { requireAuth } from "../../../infrastructure/middlewares/requireAuth.js";

const router = Router();

router.get("/", requireAuth, NotificationController.getRecent);
router.put("/mark-read", requireAuth, NotificationController.markAsRead);
router.put("/:id/read", requireAuth, NotificationController.markOneAsRead);
router.delete("/", requireAuth, NotificationController.deleteAll);
router.delete("/:id", requireAuth, NotificationController.deleteOne);

export default router;
