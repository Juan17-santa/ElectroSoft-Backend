/**
 * Controlador de pedidos.
 *
 * Maneja las peticiones HTTP del módulo orders y delega en casos de uso.
 *
 * RESPONSABILIDADES:
 * - Recibir solicitudes del frontend.
 * - Validar IDs y datos básicos.
 * - Invocar los casos de uso correspondientes.
 * - Enviar respuestas estructuradas.
 */

import mongoose from "mongoose";

import CreateOrderUseCase from "../application/CreateOrderUseCase.js";
import GetOrdersUseCase from "../application/GetOrdersUseCase.js";
import GetOrderByIdUseCase from "../application/GetOrderByIdUseCase.js";
import CancelOrderUseCase from "../application/CancelOrderUseCase.js";
import ConfirmOrderUseCase from "../application/ConfirmOrderUseCase.js";
import OrderRepositoryMongo from "./OrderRepositoryMongo.js";
import ProductRepositoryMongo from "../../products/infrastructure/ProductRepositoryMongo.js";
import { clientRepository } from "../../clients/infrastructure/ClientRepository.js";
import CreateSaleUseCase from "../../sales/application/CreateSaleUseCase.js";
import SaleRepositoryMongo from "../../sales/infrastructure/SaleRepositoryMongo.js";
import SaleExternalCatalogGatewayMongo from "../../sales/infrastructure/SaleExternalCatalogGatewayMongo.js";
import SaleTransactionManagerMongo from "../../sales/infrastructure/SaleTransactionManagerMongo.js";

const orderRepository = new OrderRepositoryMongo();
const clientRepositoryInstance = clientRepository;
const productRepository = new ProductRepositoryMongo();
const saleRepository = new SaleRepositoryMongo();
const saleExternalCatalogGateway = new SaleExternalCatalogGatewayMongo();
const saleTransactionManager = new SaleTransactionManagerMongo();
const createSaleUseCase = new CreateSaleUseCase(
    saleRepository,
    saleTransactionManager,
    saleExternalCatalogGateway,
);

export const createOrder = async (req, res) => {
    try {
        const useCase = new CreateOrderUseCase(orderRepository, clientRepositoryInstance, productRepository);
        const result = await useCase.execute(req.body);
        res.status(201).json({ message: "Pedido creado con éxito.", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const useCase = new GetOrdersUseCase(orderRepository);
        const result = await useCase.execute();
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetOrderByIdUseCase(orderRepository);
        const result = await useCase.execute(id);
        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason } = req.body;

        const useCase = new CancelOrderUseCase(orderRepository, productRepository);
        const result = await useCase.execute(id, cancelReason);

        res.json({ message: "Pedido anulado con éxito.", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const confirmOrder = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new ConfirmOrderUseCase(orderRepository, createSaleUseCase, productRepository, saleRepository);
        const result = await useCase.execute(id, req.body);

        res.json({ message: "Pedido confirmado, convertido en venta y eliminado de orders.", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};