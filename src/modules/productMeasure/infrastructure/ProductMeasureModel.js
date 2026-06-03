/**
 * Modelo de Medidas de Producto (MongoDB)
 * 
 * Define la estructura de las medidas predeterminadas/sugeridas.
 */

import mongoose from "mongoose";

const productMeasureSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 1,
        maxlength: 20
    },
    status: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

export const ProductMeasureModel = mongoose.model("ProductMeasure", productMeasureSchema);
