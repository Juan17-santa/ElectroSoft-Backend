import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    documentType: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentType', required: true },
    documentNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const ClientModel = mongoose.model('Client', ClientSchema);