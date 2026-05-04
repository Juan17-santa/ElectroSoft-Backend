/**
 * Repositorio MongoDB para devoluciones.
 *
 * Responsabilidades:
 * - Encapsular el acceso a Mongoose.
 * - Exponer operaciones usadas por los casos de uso.
 * - Recibir session cuando el caso de uso trabaja con transacciones.
 *
 * Métodos:
 * - create: crea una devolución dentro de una sesión.
 * - findById: busca una devolución por ID.
 * - update: actualiza una devolución y retorna el documento actualizado.
 * - findAll: lista devoluciones ordenadas por fechaCreacion descendente.
 */
import { devolutionModel } from "./DevolutionModel.js";

export default class DevolutionRepositoryMongo {
    async create(data, session) {
        // create con array permite asociar correctamente la session de Mongoose.
        const [devolution] = await devolutionModel.create([data], { session });
        return devolution;
    }

    async findById(id, session = null) {
        return await devolutionModel.findById(id).session(session);
    }

    async update(id, data, session) {
        return await devolutionModel.findByIdAndUpdate(id, data, {
            new: true,
            session,
            // Ejecuta validaciones declaradas en el schema al actualizar.
            runValidators: true,
        });
    }

    async findAll() {
        return await devolutionModel.find().sort({ fechaCreacion: -1 });
    }
}
