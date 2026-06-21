import { devolutionModel } from "./DevolutionModel.js";

export default class DevolutionRepositoryMongo {
    async create(data, session) {
        const [devolution] = await devolutionModel.create([data], { session });
        return devolution;
    }

    async findById(id, session = null) {
        return await devolutionModel.findById(id).session(session);
    }

    async findBySaleId(saleId, { includeAnuladas = true } = {}) {
        const filter = { saleId: String(saleId) };
        if (!includeAnuladas) filter.anulada = { $ne: true };

        return await devolutionModel.find(filter).sort({ fechaCreacion: -1 });
    }

    async update(id, data, session = null) {
        return await devolutionModel.findByIdAndUpdate(id, data, {
            new: true,
            session,
            runValidators: true,
        });
    }

    async findAll({ includeAnuladas = true } = {}) {
        const filter = includeAnuladas ? {} : { anulada: { $ne: true } };
        return await devolutionModel.find(filter).sort({ fechaCreacion: -1 });
    }
}
