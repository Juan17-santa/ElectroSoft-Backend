/**
 * Modelo de base de datos para productos.
 * 
 * Define la estructura del documento en MongoDB.
 * 
 * Campos:
 * - nombre: nombre del producto (obligatorio).
 * - categoriaId: referencia a la categoría del producto (ObjectId).
 * - precio: precio del producto (obligatorio).
 * - stock: cantidad en inventario (obligatorio).
 * - tipoStock: tipo de medida del stock ("unidad" o "metros").
 * - serial: número serial del producto (obligatorio).
 * - garantia: periodo de garantía.
 * - caracteristicas: array de sub-documentos (ficha técnica).
 * - estado: activo/inactivo (por defecto activo).
 */

import mongoose from "mongoose";

const featureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    unit: { type: String, default: "-" },
    value: { type: String, default: "" },
    visible: { type: Boolean, default: true }
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductCategory", required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    typeStock: { type: String, enum: ["unidad", "metros"], required: true },
    serial: { type: String, required: true },
    warranty: { type: String, enum: ["3 meses", "6 meses", "9 meses", "12 meses"], required: true },
    characteristics: [featureSchema],
    status: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const productModel = mongoose.model("Product", productSchema);