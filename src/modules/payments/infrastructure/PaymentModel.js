/**
 * Modelo de persistencia MongoDB para pagos y abonos.
 *
 * Define cómo se almacena un pago en la base de datos.
 * Este archivo pertenece a infrastructure, por eso puede usar Mongoose.
 *
 * Campos:
 * - ventaId:         referencia a la venta que se está pagando.
 * - monto:           valor del abono registrado en este pago.
 * - metodoPago:      EFECTIVO | TRANSFERENCIA | TARJETA.
 * - totalPagado:     acumulado pagado hasta este pago (incluye el actual).
 * - saldoPendiente:  cuánto falta por pagar después de este abono.
 * - estado:          PENDIENTE (hay saldo) o PAGADA (saldo = 0).
 * - fechaPago:       fecha en que se registró el pago.
 * - notas:           comentario opcional del cajero.
 */
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    ventaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sale",
        required: true,
    },
    monto: {
        type: Number,
        required: true,
        min: 0.01,
    },
    metodoPago: {
        type: String,
        required: true,
        enum: ["EFECTIVO", "TRANSFERENCIA", "TARJETA"],
    },
    totalPagado: {
        type: Number,
        required: true,
        default: 0,
    },
    saldoPendiente: {
        type: Number,
        required: true,
        default: 0,
    },
    estado: {
        type: String,
        required: true,
        default: "PENDIENTE",
        enum: ["PENDIENTE", "PAGADA"],
    },
    fechaPago: {
        type: Date,
        required: true,
        default: Date.now,
    },
    notas: {
        type: String,
        default: "",
        trim: true,
    },
});

paymentSchema.index({ ventaId: 1, fechaPago: -1 });

export const paymentModel = mongoose.model("Payment", paymentSchema);