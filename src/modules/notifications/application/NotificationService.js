import { Notification } from "../infrastructure/NotificationModel.js";
import mongoose from "mongoose";

class NotificationService {
  static async createNotification(title, description, type = "SYSTEM", link = null) {
    try {
      return await Notification.create({
        title,
        description,
        type,
        link,
      });
    } catch (error) {
      console.error("Error al crear notificación:", error);
      return null;
    }
  }

  static async getRecentNotifications({ limit = 20, afterCreatedAt = null, afterId = null } = {}) {
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));

    if (!afterCreatedAt) {
      return await Notification.find().sort({ createdAt: -1, _id: -1 }).limit(safeLimit);
    }

    const cursorDate = new Date(afterCreatedAt);
    if (Number.isNaN(cursorDate.getTime())) {
      throw new Error("afterCreatedAt inválido");
    }

    const cursorId = afterId && mongoose.Types.ObjectId.isValid(afterId)
      ? new mongoose.Types.ObjectId(afterId)
      : null;
    const filter = cursorId
      ? { $or: [{ createdAt: { $gt: cursorDate } }, { createdAt: cursorDate, _id: { $gt: cursorId } }] }
      : { createdAt: { $gt: cursorDate } };

    return await Notification.find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .limit(safeLimit);
  }

  static async deleteById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID de notificación inválido");
    return await Notification.findByIdAndDelete(id);
  }

  static async deleteAll() {
    return await Notification.deleteMany({});
  }

  static async markOneAsRead(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("ID de notificación inválido");
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true, runValidators: true },
    );
  }

  static async markAsRead() {
    return await Notification.updateMany({ isRead: false }, { isRead: true });
  }
}

export default NotificationService;
