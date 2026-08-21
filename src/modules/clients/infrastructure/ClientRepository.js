import { ClientModel } from './ClientModel.js';

export const clientRepository = {
    create: async (client) => {
        return await ClientModel.create(client);
    },

    findAll: async ({ page = 1, limit = 0 } = {}) => {
        const query = ClientModel.find().sort({ createdAt: -1 }).populate('documentType');
        
        if (limit > 0) {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                query.skip(skip).limit(limit).exec(),
                ClientModel.countDocuments()
            ]);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        }
        
        const data = await query.exec();
        return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
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