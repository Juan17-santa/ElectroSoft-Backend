import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["SALE", "USER", "PAYMENT", "STOCK", "SYSTEM"], 
      default: "SYSTEM" 
    },
    isRead: { type: Boolean, default: false },
    link: { type: String } // Opcional, para redirigir al presionar la notificación
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200 });

export const Notification = mongoose.model("Notification", notificationSchema);
