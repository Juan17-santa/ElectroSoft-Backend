/**
 * Modelo de base de datos para categorías de productos.
 * 
 * Define la estructura del documento en MongoDB.
 * 
 * Campos:
 * - name: nombre de la categoría (único y obligatorio).
 * - description: descripción opcional.
 * - status: estado de la categoría (activo/inactivo, por defecto activo).
 */

import mongoose from "mongoose";

const productCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    status: { type: Boolean, default: true },
}, {
    timestamps: true
})

export const productCategoryModel = mongoose.model("ProductCategory", productCategorySchema);