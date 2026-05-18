/**
 * Modelo de persistencia MongoDB para compras.
 *
 * Define cómo se almacena una compra en la base de datos.
 * Este archivo pertenece a infrastructure, por eso puede usar Mongoose.
 *
 * Campos principales:
 * - proveedorId: referencia al proveedor.
 * - productos: productos comprados dentro de la compra.
 * - total: total calculado por el caso de uso.
 * - estado: ACTIVA o ANULADA.
 * - impactApplied: marca de impacto simulado.
 * - fechaCompra: fecha de factura en formato DD/MM/YYYY.
 * - fechaCreacion: fecha de registro en sistema.
 * - anuladaEn: fecha de anulación.
 */
import mongoose from "mongoose";

// Subdocumento de producto comprado.
const shoppingProductSchema = new mongoose.Schema(
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
        precioCompra: {
            type: Number,
            required: true,
            min: 1,
        },
        precioVenta: {
            type: Number,
            required: true,
            min: 1,
        },
        usarPrecioSugerido: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { _id: false },
);

// Documento principal de compra.
const shoppingSchema = new mongoose.Schema({
    numeroFactura: {
        type: String,
        required: true,
        trim: true,
    },
    proveedorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        required: true,
    },
    productos: {
        type: [shoppingProductSchema],
        required: true,
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "La compra debe tener al menos un producto",
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
    fechaCompra: {
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
});

shoppingSchema.index({ numeroFactura: 1, estado: 1 });

export const shoppingModel = mongoose.model("shopping", shoppingSchema);
