import NotificationService from "../application/NotificationService.js";

class NotificationController {
  static async getRecent(req, res) {
    try {
      const notifications = await NotificationService.getRecentNotifications();
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
}

export default NotificationController;
