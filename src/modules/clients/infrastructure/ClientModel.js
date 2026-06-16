import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    documentType: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentType', required: true },
    documentNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    estado: { type: Boolean, default: true },          // true = activo, false = suspendido
    cupoActivo: { type: Boolean, default: false },      // tiene cupo de crédito asignado
    cupoTotal: { type: Number, default: 0, min: 0 },   // monto máximo de crédito
    totalCompras: { type: Number, default: 0 },        // total histórico comprado
    createdAt: { type: Date, default: Date.now }
});

export const ClientModel = mongoose.model('Client', ClientSchema);