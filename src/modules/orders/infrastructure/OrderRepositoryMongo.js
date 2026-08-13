import { productModel } from "../../products/infrastructure/ProductModel.js";
import { orderModel } from "./OrderModel.js";

class OrderRepositoryMongo {
    async create(orderData) {
        const order = new orderModel(orderData);
        return await order.save();
    }

    async findAll() {
        return await orderModel.find()
            .populate({
                path: "client",
                populate: { path: "documentType" }
            })
            .sort({ createdAt: -1 });
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

        const expiredOrders = await orderModel.find({
            status: "Pendiente",
            dueDate: { $lt: now }
        });

        if (expiredOrders.length === 0) return;

        const stockPromises = expiredOrders.flatMap(order =>
            (order.products || []).map(item =>
                productModel.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                })
            )
        );

        await Promise.all(stockPromises);

        return await orderModel.updateMany(
            { status: "Pendiente", dueDate: { $lt: now } },
            {
                $set: {
                    status: "Anulado",
                    cancelReason: "Pedido anulado automáticamente por vencimiento de fecha.",
                    canceledAt: now
                }
            }
        );
    }

    async expireSingleOrder(order) {
        if (!order) return null;

        const now = new Date();

        const stockPromises = (order.products || []).map(item =>
            productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            })
        );

        await Promise.all(stockPromises);

        order.status = "Anulado";
        order.cancelReason = "Pedido anulado automáticamente por vencimiento de fecha.";
        order.canceledAt = now;

        return await order.save();
    }
}

export default OrderRepositoryMongo;