/**
 * Repositorio de pedidos (MongoDB).
 *
 * Responsabilidades:
 * - Interactuar directamente con la colección de órdenes.
 * - Exponer operaciones CRUD para el módulo orders.
 * - Aplicar la anulación automática de pedidos pendientes cuando corresponde.
 */

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

        for (const order of expiredOrders) {
            for (const item of order.products) {
                await productModel.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        return await orderModel.updateMany(
            { status: "Pendiente", dueDate: { $lt: now } },
            {
                status: "Anulado",
                cancelReason: "Pedido anulado automáticamente por vencimiento de fecha.",
                canceledAt: now
            }
        );
    }

    async expireSingleOrder(order) {
        const now = new Date();

        for (const item of order.products) {
            await productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        order.status = "Anulado";
        order.cancelReason = "Pedido anulado automáticamente por vencimiento de fecha.";
        order.canceledAt = now;
        await order.save();

        return order;
    }
}

export default OrderRepositoryMongo;