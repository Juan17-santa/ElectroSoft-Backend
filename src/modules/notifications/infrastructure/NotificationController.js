import NotificationService from "../application/NotificationService.js";

class NotificationController {
  static async getRecent(req, res) {
    try {
      const notifications = await NotificationService.getRecentNotifications({
        limit: req.query.limit,
        afterCreatedAt: req.query.afterCreatedAt,
        afterId: req.query.afterId,
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Error obteniendo notificaciones", error: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      await NotificationService.markAsRead();
      res.json({ message: "Notificaciones marcadas como leídas" });
    } catch (error) {
      res.status(500).json({ message: "Error actualizando notificaciones", error: error.message });
    }
  }

  static async markOneAsRead(req, res) {
    try {
      const notification = await NotificationService.markOneAsRead(req.params.id);
      if (!notification) return res.status(404).json({ message: "Notificación no encontrada" });
      res.json(notification);
    } catch (error) {
      res.status(400).json({ message: "Error actualizando notificación", error: error.message });
    }
  }

  static async deleteOne(req, res) {
    try {
      const notification = await NotificationService.deleteById(req.params.id);
      if (!notification) return res.status(404).json({ message: "Notificación no encontrada" });
      res.json({ message: "Notificación eliminada", data: notification });
    } catch (error) {
      res.status(400).json({ message: "Error eliminando notificación", error: error.message });
    }
  }

  static async deleteAll(req, res) {
    try {
      const result = await NotificationService.deleteAll();
      res.json({ message: "Notificaciones eliminadas", deletedCount: result.deletedCount });
    } catch (error) {
      res.status(500).json({ message: "Error eliminando notificaciones", error: error.message });
    }
  }
}

export default NotificationController;
