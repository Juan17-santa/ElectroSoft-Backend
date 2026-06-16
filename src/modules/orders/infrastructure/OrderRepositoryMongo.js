/**
 * Repositorio de pedidos (MongoDB).
 *
 * Responsabilidades:
 * - Interactuar directamente con la colección de órdenes.
 * - Exponer operaciones CRUD para el módulo orders.
 * - Aplicar la anulación automática de pedidos pendientes cuando corresponde.
 *
 * NOTA:
 * El flujo de anulación automática se ejecuta al consultar pedidos.
 * Esto hace compatible la lógica con la arquitectura actual sin requerir un scheduler externo.
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
            new: true,
            runValidators: true,
        });
    }

    // 🚀 ACTUALIZACIÓN MASIVA (Para cuando listan todos los pedidos)
    async expirePendingOrders() {
        const now = new Date();

        // 1. Buscar cuáles se van a vencer para poder devolverles el stock
        const expiredOrders = await orderModel.find({
            status: "Pendiente",
            dueDate: { $lt: now }
        });

        // Si no hay ninguno vencido, nos ahorramos el updateMany
        if (expiredOrders.length === 0) return;

        // 2. Devolver el stock de todos los productos de esos pedidos vencidos
        for (const order of expiredOrders) {
            for (const item of order.products) {
                await productModel.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity } // Suma la cantidad de vuelta al stock
                });
            }
        }

        // 3. 🛡️ CORRECCIÓN: Guardar el motivo y fecha automática en el updateMany para que el Front los muestre
        return await orderModel.updateMany(
            { status: "Pendiente", dueDate: { $lt: now } },
            {
                status: "Anulado",
                cancelReason: "Pedido anulado automáticamente por vencimiento de fecha.",
                canceledAt: now
            }
        );
    }

    // 🎯 ACTUALIZACIÓN QUIRÚRGICA (Para cuando consultan un solo pedido por ID)
    async expireSingleOrder(order) {
        const now = new Date();

        // Devolvemos el stock de este pedido en específico
        for (const item of order.products) {
            await productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: item.quantity }
            });
        }

        // Cambiamos el estado a Anulado, agregamos el motivo automático y guardamos
        order.status = "Anulado";
        order.cancelReason = "Pedido anulado automáticamente por vencimiento de fecha.";
        order.canceledAt = now;
        await order.save();

        return order;
    }
}

export default OrderRepositoryMongo;