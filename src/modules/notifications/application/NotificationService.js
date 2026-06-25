import { Notification } from "../infrastructure/NotificationModel.js";
import { getIO } from "../../../config/socket.js";

class NotificationService {
  /**
   * Crea una notificación en la BD y la emite en vivo vía WebSockets.
   */
  static async createNotification(title, description, type = "SYSTEM", link = null) {
    try {
      const newNotification = await Notification.create({
        title,
        description,
        type,
        link,
      });

      try {
        const io = getIO();
        // Emitimos el evento a todos los clientes conectados
        io.emit("new_notification", newNotification);
      } catch (wsError) {
        // Ignoramos el error si los WebSockets no están inicializados aún
        console.error("Error emitiendo WebSocket (puede que aún no esté conectado):", wsError.message);
      }

      return newNotification;
    } catch (error) {
      console.error("Error al crear notificación:", error);
      throw error;
    }
  }

  /**
   * Obtiene las últimas notificaciones ordenadas por fecha
   */
  static async getRecentNotifications(limit = 20) {
    return await Notification.find().sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Marca las notificaciones como leídas
   */
  static async markAsRead() {
    return await Notification.updateMany({ isRead: false }, { isRead: true });
  }
}

export default NotificationService;
