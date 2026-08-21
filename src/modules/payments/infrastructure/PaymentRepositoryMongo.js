/**
 * Repositorio MongoDB para pagos y abonos.
 *
 * Responsabilidades:
 * - Encapsular el acceso a Mongoose.
 * - Exponer operaciones usadas por los casos de uso.
 *
 * Métodos:
 * - create:          crea un nuevo pago.
 * - findById:        busca un pago por ID (con populate de ventaId).
 * - findByVentaId:   retorna todos los pagos de una venta específica.
 * - findAll:         lista todos los pagos ordenados por fechaPago descendente.
 * - cancel:          anula un pago por ID.
 * - cancelBySaleId:  anula todos los pagos de una venta (usado al anular la venta).
 */
import { paymentModel } from "./PaymentModel.js";

export default class PaymentRepositoryMongo {
    async create(data, session) {
        const [payment] = await paymentModel.create([data], { session });
        return payment;
    }

    async findById(id) {
        return await paymentModel
            .findById(id)
            .populate("ventaId", "numeroFactura total estado clienteId");
    }

    async findByVentaId(ventaId, session = null) {
        return await paymentModel
            .find({ ventaId })
            .sort({ fechaPago: 1 })
            .session(session);
    }

    async findAll({ page = 1, limit = 0 } = {}) {
        const query = paymentModel.find()
            .populate("ventaId", "numeroFactura total estado clienteId")
            .sort({ fechaPago: -1 });

        if (limit > 0) {
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                query.skip(skip).limit(limit).exec(),
                paymentModel.countDocuments()
            ]);
            return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
        }

        const data = await query.exec();
        return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 };
    }

    async cancel(id) {
        return await paymentModel.findByIdAndUpdate(
            id,
            { $set: { estado: "ANULADO" } },
            { returnDocument: "after" }
        );
    }

    async cancelBySaleId(saleId, session = null) {
        return await paymentModel.updateMany(
            { ventaId: saleId, estado: { $ne: "ANULADO" } },
            { $set: { estado: "ANULADO" } },
            { session }
        );
    }
}
