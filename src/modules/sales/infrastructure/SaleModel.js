/**
 * Modelo de persistencia MongoDB para ventas.
 *
 * Define cómo se almacena una venta en la base de datos.
 * Este archivo pertenece a infrastructure, por eso puede usar Mongoose.
 *
 * Campos principales:
 * - numeroFactura: número único de la factura de venta.
 * - clienteId: referencia al cliente que realizó la compra.
 * - productos: productos vendidos (subdocumento).
 * - total: total calculado por el caso de uso.
 * - estado: ACTIVA o ANULADA.
 * - impactApplied: bandera que indica si el stock fue descontado.
 * - fechaVenta: fecha de la factura (formato DD/MM/YYYY o YYYY-MM-DD).
 * - fechaCreacion: fecha de registro en el sistema.
 * - anuladaEn: fecha en que fue anulada.
 */
import mongoose from "mongoose";

// Subdocumento de producto vendido
const saleProductSchema = new mongoose.Schema(
    {
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1,
        },
        precioUnitario: {
            type: Number,
            required: true,
            min: 0.01,
        },
    },
    { _id: false },
);

// Documento principal de venta
const saleSchema = new mongoose.Schema({
    numeroFactura: {
        type: String,
        required: true,
        trim: true,
    },
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
    },
    productos: {
        type: [saleProductSchema],
        required: true,
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "La venta debe tener al menos un producto",
        },
    },
    total: {
        type: Number,
        required: true,
        default: 0,
    },
    estado: {
        type: String,
        required: true,
        default: "ACTIVA",
        enum: ["ACTIVA", "ANULADA"],
    },
    impactApplied: {
        type: Boolean,
        required: true,
        default: false,
    },
    fechaVenta: {
        type: String,
        required: false,
        default: "",
    },
    fechaCreacion: {
        type: Date,
        required: true,
        default: Date.now,
    },
    anuladaEn: {
        type: Date,
        default: null,
    },
    tipoVenta: {
        type: String,
        default: "Contado",
        enum: ["Contado", "Crédito"],
    },
    observaciones: {
        type: String,
        default: "",
        trim: true,
    },
});

saleSchema.index({ numeroFactura: 1, estado: 1 });

export const saleModel = mongoose.model("Sale", saleSchema);