/**
 * Controlador HTTP del módulo Payments.
 *
 * Responsabilidades:
 * - Recibir requests HTTP.
 * - Crear los casos de uso con sus dependencias inyectadas.
 * - Enviar respuestas JSON al cliente.
 *
 * No contiene validaciones de negocio (viven en domain/application).
 *
 * Endpoints manejados:
 * - POST  /payments                   → Registrar un pago/abono
 * - GET   /payments                   → Listar todos los pagos
 * - GET   /payments/venta/:ventaId    → Pagos de una venta específica
 * - GET   /payments/:id               → Detalle de un pago por ID
 */
import mongoose from "mongoose";
import CreatePaymentUseCase from "../application/CreatePaymentUseCase.js";
import GetPaymentsUseCase from "../application/GetPaymentsUseCase.js";
import GetPaymentsByVentaUseCase from "../application/GetPaymentsByVentaUseCase.js";
import GetPaymentByIdUseCase from "../application/GetPaymentByIdUseCase.js";
import CancelPaymentUseCase from "../application/CancelPaymentUseCase.js";
import PaymentRepositoryMongo from "./PaymentRepositoryMongo.js";
import PaymentSaleGatewayMongo from "./PaymentSaleGatewayMongo.js";

const paymentRepository = new PaymentRepositoryMongo();
const saleGateway = new PaymentSaleGatewayMongo();

// Registra un nuevo pago / abono sobre una venta
export const createPayment = async (req, res) => {
    try {
        const useCase = new CreatePaymentUseCase(paymentRepository, saleGateway);
        const result = await useCase.execute(req.body);

        res.status(201).json({
            message: "Pago registrado con éxito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lista todos los pagos del sistema
export const getPayments = async (req, res) => {
    try {
        const useCase = new GetPaymentsUseCase(paymentRepository);
        const result = await useCase.execute();

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retorna el historial de abonos de una venta específica
export const getPaymentsByVenta = async (req, res) => {
    try {
        const { ventaId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(ventaId)) {
            return res.status(400).json({ error: "ventaId inválido" });
        }

        const useCase = new GetPaymentsByVentaUseCase(paymentRepository, saleGateway);
        const result = await useCase.execute(ventaId);

        res.json({ data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// Retorna el detalle de un pago por ID
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetPaymentByIdUseCase(paymentRepository);
        const result = await useCase.execute(id);

        res.json({ data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// Anula un pago (abono) por ID
export const cancelPayment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new CancelPaymentUseCase(paymentRepository);
        const result = await useCase.execute(id);

        res.json({ message: "Pago anulado con éxito", data: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
