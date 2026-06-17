import { ClientModel } from './ClientModel.js';

export const clientRepository = {
    create: async (client) => {
        return await ClientModel.create(client);
    },

    findAll: async () => {
        return await ClientModel.find().sort({ createdAt: -1 }).populate('documentType');
    },

    findById: async (id) => {
        return await ClientModel.findById(id).populate('documentType');
    },

    findByDocumentNumber: async (documentNumber) => {
        return await ClientModel.findOne({ documentNumber });
    },

    findByEmail: async (email) => {
        return await ClientModel.findOne({ email: email.toLowerCase() });
    },

    update: async (id, data) => {
        return await ClientModel.findByIdAndUpdate(id, data, { new: true }).populate('documentType');
    },

    delete: async (id) => {
        return await ClientModel.findByIdAndDelete(id);
    }
};