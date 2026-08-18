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

    findByDocumentNumberExcluding: async (documentNumber, excludeId) => {
        const filter = { documentNumber };
        if (excludeId) filter._id = { $ne: excludeId };
        return await ClientModel.findOne(filter);
    },

    findByEmailExcluding: async (email, excludeId) => {
        const filter = { email: email.toLowerCase() };
        if (excludeId) filter._id = { $ne: excludeId };
        return await ClientModel.findOne(filter);
    },

    update: async (id, data) => {
        return await ClientModel.findByIdAndUpdate(id, data, { returnDocument: "after" }).populate('documentType');
    },

    delete: async (id) => {
        return await ClientModel.findByIdAndDelete(id);
    }
};