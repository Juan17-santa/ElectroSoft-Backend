/**
 * Modelo de base de datos para proveedores.
 * 
 * Define la estructura del documento en MongoDB.
 * 
 * Campos:
 * - documentType: referencia al tipo de documento (obligatorio).
 * - document: número de documento del proveedor (único y obligatorio).
 * - providerName: nombre del proveedor (obligatorio).
 * - contactName: nombre del contacto principal (obligatorio).
 * - contactPhone: teléfono del contacto principal (obligatorio).
 * - categoriesAssociated: array de referencias a categorías de productos.
 * - status: estado del proveedor (activo/inactivo, por defecto activo).
 */

import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({

    documentType: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentType", required: true },
    document: { type: String, required: true, unique: true, trim: true },
    providerName: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    categoriesAssociated: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory" }],
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const providerModel = mongoose.model("Provider", providerSchema);