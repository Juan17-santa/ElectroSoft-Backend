import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    documentType: { type: String, required: true },
    documentNumber: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

export const ClientModel = mongoose.model('clients', ClientSchema);