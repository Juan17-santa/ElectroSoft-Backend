/**
 * Modelo de Características de Producto (MongoDB)
 * 
 * Define la estructura de las características predeterminadas/sugeridas.
 */

import mongoose from "mongoose";

const productCharacteristicSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50
    },
    status: { 
        type: Boolean, 
        default: true 
    }
}, {
    timestamps: true
});

export const ProductCharacteristicModel = mongoose.model("ProductCharacteristic", productCharacteristicSchema);
