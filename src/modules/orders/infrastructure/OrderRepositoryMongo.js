import mongoose from "mongoose";
import { productModel } from "../../products/infrastructure/ProductModel.js";
import { ClientModel } from "../../clients/infrastructure/ClientModel.js";
import { orderModel } from "./OrderModel.js";

class OrderRepositoryMongo {
    async create(orderData) {
        const order = new orderModel(orderData);
        return await order.save();
    }

    async findAll({ page = 1, limit = 15, search = "" } = {}) {
        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number(limit) || 15));
        const term = String(search || "").trim();
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const filter = term
            ? { $or: [
                { documentNumber: { $regex: escapedTerm, $options: "i" } },
                { status: { $regex: escapedTerm, $options: "i" } },
            ] }
            : {};

        if (term) {
            const clientIds = await ClientModel.find({
                $or: [
                    { firstName: { $regex: escapedTerm, $options: "i" } },
                    { lastName: { $regex: escapedTerm, $options: "i" } },
                ],
            }).distinct("_id");
            filter.$or.push({ client: { $in: clientIds } });
        }

        const total = await orderModel.countDocuments(filter);
        const orders = await orderModel.find(filter)
            .populate({
                path: "client",
                populate: { path: "documentType" }
            })
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit);

        return {
            items: orders,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        };
    }

    async findById(id) {
        return await orderModel.findById(id)
            .populate({
                path: "client",
                populate: { path: "documentType" }
            });
    }

    async update(id, orderData) {
        return await orderModel.findByIdAndUpdate(id, orderData, {
            returnDocument: "after",
            runValidators: true,
        });
    }

    async delete(id) {
        return await orderModel.findByIdAndDelete(id);
    }

    async expirePendingOrders() {
        const now = new Date();
        let processed = 0;

        while (true) {
            const expiredOrder = await orderModel.findOne({
                status: "Pendiente",
                dueDate: { $lt: now },
            }).select("_id").sort({ dueDate: 1 });

            if (!expiredOrder) return { modifiedCount: processed };

            const updated = await this.expireSingleOrder(expiredOrder._id, now);
            if (updated) processed += 1;
        }
    }

    async expireSingleOrder(id, now = new Date()) {
        const session = await mongoose.startSession();
        let updatedOrder = null;

        try {
            await session.withTransaction(async () => {
                const order = await orderModel.findOneAndUpdate(
                    { _id: id, status: "Pendiente", dueDate: { $lt: now } },
                    {
                        $set: {
                            status: "Anulado",
                            cancelReason: "Pedido anulado automáticamente por vencimiento de fecha.",
                            canceledAt: now,
                        },
                    },
                    { returnDocument: "after", runValidators: true, session },
                );

                if (!order) return;

                for (const item of order.products || []) {
                    const product = await productModel.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } },
                        { session, returnDocument: "after" },
                    );
                    if (!product) throw new Error(`Producto no encontrado: ${item.product}`);
                }
                updatedOrder = order;
            });
            return updatedOrder;
        } finally {
            await session.endSession();
        }
    }

    async cancelAndRestoreStock(id, reason, now = new Date()) {
        const session = await mongoose.startSession();
        let updatedOrder = null;

        try {
            await session.withTransaction(async () => {
                const order = await orderModel.findOneAndUpdate(
                    { _id: id, status: "Pendiente" },
                    { $set: { status: "Anulado", cancelReason: reason, canceledAt: now } },
                    { returnDocument: "after", runValidators: true, session },
                );

                if (!order) return;

                for (const item of order.products || []) {
                    const product = await productModel.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } },
                        { session, returnDocument: "after" },
                    );
                    if (!product) throw new Error(`Producto no encontrado: ${item.product}`);
                }
                updatedOrder = order;
            });
            return updatedOrder;
        } finally {
            await session.endSession();
        }
    }
}

export default OrderRepositoryMongo;