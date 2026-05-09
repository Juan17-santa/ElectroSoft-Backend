import { ClientModel } from './ClientModel.js';

export const clientRepository = {
    create: async (client) => {
        return await ClientModel.create(client);
    },

    findAll: async () => {
        return await ClientModel.find();
    },

    findById: async (id) => {
        return await ClientModel.findById(id);
    },

    update: async (id, data) => {
        return await ClientModel.findByIdAndUpdate(id, data, { new: true });
    },

    delete: async (id) => {
        return await ClientModel.findByIdAndDelete(id);
    }
};
