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
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        purchasePrice: {
            type: Number,
            required: true,
            min: 1,
        },
        salePrice: {
            type: Number,
            required: true,
            min: 1,
        },
        useSuggestedPrice: {
            type: Boolean,
            required: true,
            default: false,
        },
        // Precio que efectivamente se aplicó al inventario (WAC o sugerido).
        // SalePrice conserva el valor tecleado por el usuario para la fórmula WAC.
        appliedPrice: {
            type: Number,
            required: false,
            default: null,
        },
        // Snapshot del estado previo del producto para permitir una reversión exacta
        previousPrice: {
            type: Number,
            required: false,
            default: null,
        },
        previousCostoPromedio: {
            type: Number,
            required: false,
            default: null,
        },
    },
    { _id: false },
);

// Documento principal de compra.
const shoppingSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        trim: true,
    },
    providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Provider",
        required: true,
    },
    products: {
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
    purchaseDate: {
        type: String,
        required: false,
        default: "",
    },
    // Fecha de factura normalizada para permitir consultas por rango (from/to).
    purchaseDateIso: {
        type: Date,
        required: false,
        default: null,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    cancelledAt: {
        type: Date,
        default: null,
    },
    // Información detallada de la anulación (motivo y fecha) para mostrar en frontend
    infoAnulacion: {
        motivo: { type: String, default: null },
        fechaAnulacion: { type: Date, default: null },
    },
    creadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null,
    },
});

// Índice único parcial: una factura solo puede existir una vez en una compra
// ACTIVA. Las anuladas pueden reutilizar el número (regla de negocio actual).
shoppingSchema.index(
    { invoiceNumber: 1 },
    { unique: true, partialFilterExpression: { estado: "ACTIVA" } },
);
shoppingSchema.index({ createdAt: -1 });
shoppingSchema.index({ purchaseDateIso: 1 });

export const shoppingModel = mongoose.model("shopping", shoppingSchema);