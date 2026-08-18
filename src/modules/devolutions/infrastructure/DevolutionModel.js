import mongoose from "mongoose";
import {
    DEVOLUTION_PRODUCT_REASONS,
    DEVOLUTION_SPECIAL_STATES,
    DEVOLUTION_STATES,
} from "../domain/DevolutionEntity.js";

const devolutionProductSchema = new mongoose.Schema(
    {
        productoId: {
            type: String,
            required: true,
            trim: true,
        },
        nombre: {
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
            enum: DEVOLUTION_PRODUCT_REASONS,
        },
        submotivo: {
            type: String,
            default: "",
            trim: true,
        },
        condicionProducto: {
            type: String,
            default: "",
            trim: true,
        },
        regresarAlInventario: {
            type: Boolean,
            default: true,
        },
        gestion: {
            type: String,
            default: "",
            trim: true,
        },
        responsable: {
            type: String,
            default: "",
            trim: true,
        },
        garantiaProveedor: {
            type: Boolean,
            default: null,
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
        },
        observaciones: {
            type: String,
            default: "",
            trim: true,
        },
        montoReembolso: {
            type: Number,
            default: null,
            min: 0,
        },
    },
    { _id: false },
);

const historialEstadoSchema = new mongoose.Schema(
    {
        estado: {
            type: String,
            required: true,
            trim: true,
        },
        fecha: {
            type: Date,
            required: true,
            default: Date.now,
        },
    },
    { _id: false },
);

const devolutionSchema = new mongoose.Schema({
    saleId: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    productos: {
        type: [devolutionProductSchema],
        required: true,
        validate: {
            validator: (value) => Array.isArray(value) && value.length > 0,
            message: "La devolucion debe tener al menos un producto",
        },
    },
    fechaDevolucion: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/,
    },
    estadoResolucion: {
        type: String,
        required: true,
        default: "CREADA",
        enum: [...DEVOLUTION_STATES, ...DEVOLUTION_SPECIAL_STATES],
    },
    historialEstados: {
        type: [historialEstadoSchema],
        default: [],
    },
    anulada: {
        type: Boolean,
        required: true,
        default: false,
    },
    anuladaEn: {
        type: Date,
        default: null,
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
    actualizadoEn: {
        type: Date,
        required: true,
        default: Date.now,
    },
    confirmadaEn: {
        type: Date,
        default: null,
    },
});

devolutionSchema.index({ fechaCreacion: -1 });
devolutionSchema.index({ fechaDevolucion: 1 });
devolutionSchema.index({ anulada: 1, fechaCreacion: -1 });

export const devolutionModel = mongoose.model("devolution", devolutionSchema);
