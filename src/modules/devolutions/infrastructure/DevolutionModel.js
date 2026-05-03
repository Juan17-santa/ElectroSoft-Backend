/**
 * Modelo de persistencia MongoDB para devoluciones.
 *
 * Define cómo se almacena una devolución en la base de datos.
 * Este archivo pertenece a infrastructure, por eso puede usar Mongoose.
 *
 * Campos principales:
 * - shoppingId: identificador de la compra asociada como dato simple.
 * - productos: productos incluidos en la devolución.
 * - estado: PENDIENTE o CONFIRMADA.
 * - impactApplied: marca de impacto simulado.
 * - fechaCreacion: fecha de registro en sistema.
 * - confirmadaEn: fecha de confirmación.
 */
import mongoose from "mongoose";

// Subdocumento de producto devuelto.
const devolutionProductSchema = new mongoose.Schema(
    {
        productoId: {
            type: String,
            required: true,
            trim: true,
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1,
        },
        motivo: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false },
);

// Documento principal de devolución.
const devolutionSchema = new mongoose.Schema({
    shoppingId: {
        type: String,
        required: true,
        trim: true,
    },
    productos: {
        type: [devolutionProductSchema],
        required: true,
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "La devolucion debe tener al menos un producto",
        },
    },
    estado: {
        type: String,
        required: true,
        default: "PENDIENTE",
        enum: ["PENDIENTE", "CONFIRMADA"],
    },
    impactApplied: {
        type: Boolean,
        required: true,
        default: false,
    },
    fechaCreacion: {
        type: Date,
        required: true,
        default: Date.now,
    },
    confirmadaEn: {
        type: Date,
        default: null,
    },
});

export const devolutionModel = mongoose.model("devolution", devolutionSchema);
