/**
 * Modelo de base de datos para pedidos.
 * 
 * Define la estructura del documento en MongoDB.
 * 
 * Campos:
 * - documentNumber: documento del cliente.
 * - client: referencia al cliente.
 * - orderDate: fecha del pedido.
 * - dueDate: fecha de vencimiento del pedido.
 * - products: productos asociados al pedido.
 * - paymentMethod: forma de pago.
 * - subtotal: subtotal del pedido.
 * - iva: valor del IVA.
 * - total: total final.
 * - status: estado actual del pedido.
 */

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    // DOCUMENTO DEL CLIENTE
    documentNumber: { type: String, required: true, trim: true },
    // REFERENCIA AL CLIENTE
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    // FECHA DEL PEDIDO
    orderDate: { type: Date, required: true, default: Date.now },
    // FECHA DE VENCIMIENTO calculada automáticamente: orderDate + 15 días.
    dueDate: { type: Date, required: true },
    // PRODUCTOS DEL PEDIDO
    products: [
        {
            // REFERENCIA AL PRODUCTO
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            // NOMBRE DEL PRODUCTO
            name: { type: String, required: true, trim: true },
            // PRECIO UNITARIO
            price: { type: Number, required: true, min: 0 },
            // CANTIDAD
            quantity: { type: Number, required: true, min: 1 },
            // SUBTOTAL DEL PRODUCTO
            lineTotal: { type: Number, required: true, min: 0 }
        }
    ],
    // FORMA DE PAGO
    paymentMethod: { type: String, enum: ["Contado", "Credito", "Mixto"], required: true },
    // MONTO DE CRÉDITO SOLICITADO
    requestedCredit: { type: Number, default: 0, min: 0 },
    // SUBTOTAL GENERAL
    subtotal: { type: Number, required: true, min: 0 },
    // IVA GENERAL
    iva: { type: Number, required: true, min: 0 },
    // TOTAL GENERAL
    total: { type: Number, required: true, min: 0 },
    // ESTADO DEL PEDIDO / Solo Pendiente o Anulado.
    status: { type: String, enum: ["Pendiente", "Anulado"], default: "Pendiente" },
    // MOTIVO DE ANULACIÓN cuando el pedido se cancela manualmente.
    cancelReason: { type: String, default: null, trim: true },
    // FECHA DE ANULACIÓN cuando la cancelación se realiza manualmente.
    canceledAt: { type: Date, default: null }
}, { timestamps: true });

export const orderModel = mongoose.model("Order", orderSchema);