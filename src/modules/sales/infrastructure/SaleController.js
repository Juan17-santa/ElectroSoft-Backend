/**
 * Controlador HTTP del módulo Sales.
 *
 * Responsabilidades:
 * - Recibir requests HTTP.
 * - Crear los casos de uso con sus dependencias inyectadas.
 * - Enviar respuestas JSON al cliente.
 *
 * Importante:
 * - No contiene validaciones de negocio (esas viven en domain y application).
 * - Las dependencias técnicas (repositorios, gateway) viven en infrastructure.
 *
 * Endpoints manejados:
 * - POST   /sales                        → Crear venta
 * - PATCH  /sales/:id/cancel             → Anular venta
 * - GET    /sales/:id/cancellation-status → Verificar si se puede anular
 * - GET    /sales                        → Obtener todas las ventas
 * - GET    /sales/:id                    → Obtener venta por ID
 */
import mongoose from "mongoose";
import CreateSaleUseCase from "../application/CreateSaleUseCase.js";
import CancelSaleUseCase from "../application/CancelSaleUseCase.js";
import GetSalesUseCase from "../application/GetSalesUseCase.js";
import GetSalesByIdsUseCase from "../application/GetSalesByIdsUseCase.js";
import GetSaleByIdUseCase from "../application/GetSaleByIdUseCase.js";
import SaleRepositoryMongo from "./SaleRepositoryMongo.js";
import SaleExternalCatalogGatewayMongo from "./SaleExternalCatalogGatewayMongo.js";
import SaleTransactionManagerMongo from "./SaleTransactionManagerMongo.js";
import DevolutionRepositoryMongo from "../../devolutions/infrastructure/DevolutionRepositoryMongo.js";
import PaymentRepositoryMongo from "../../payments/infrastructure/PaymentRepositoryMongo.js";

const saleRepository = new SaleRepositoryMongo();
const externalCatalogGateway = new SaleExternalCatalogGatewayMongo();
const transactionManager = new SaleTransactionManagerMongo();
const devolutionRepository = new DevolutionRepositoryMongo();
const paymentRepository = new PaymentRepositoryMongo();

// Crea una venta y descuenta el stock de los productos
export const createSale = async (req, res) => {
    try {
        const useCase = new CreateSaleUseCase(
            saleRepository,
            transactionManager,
            externalCatalogGateway,
        );

        const saleData = {
            ...req.body,
            productos: req.body.productos?.map((producto) => ({
                productoId: producto.productoId ?? producto.id,
                cantidad: producto.cantidad,
                precioUnitario: producto.precioUnitario ?? producto.precio,
            })),
        };

        const result = await useCase.execute(saleData);

        res.status(201).json({
            message: "Venta registrada con éxito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Anula una venta activa si cumple la regla de 48 horas
export const cancelSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body || {};
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new CancelSaleUseCase(
            saleRepository,
            transactionManager,
            externalCatalogGateway,
            devolutionRepository,
            paymentRepository,
        );
        const result = await useCase.execute(id, motivo);

        res.json({
            message: "Venta anulada con éxito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Verifica si una venta activa puede ser anulada sin modificar datos
export const getSaleCancellationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new CancelSaleUseCase(
            saleRepository,
            transactionManager,
            externalCatalogGateway,
            devolutionRepository,
            paymentRepository,
        );
        await useCase.validate(id);

        res.json({
            puedeAnularse: true,
            razon: "",
        });
    } catch (error) {
        res.json({
            puedeAnularse: false,
            razon: error.message,
        });
    }
};

// Rechaza peticiones GET a la ruta de anulación
export const rejectGetCancelSale = (_req, res) => {
    res.status(405).json({
        error: "Método no permitido. Para anular una venta usa PATCH /api/sales/:id/cancel",
    });
};

// Lista todas las ventas
export const getSales = async (req, res) => {
    try {
        const useCase = new GetSalesUseCase(saleRepository);
        const result = await useCase.execute();

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtiene ventas específicas por IDs (p. ej. las ventas de un reporte de devoluciones)
export const getSalesByIds = async (req, res) => {
    try {
        const ids = String(req.query.ids ?? "")
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean);

        const useCase = new GetSalesByIdsUseCase(saleRepository);
        const result = await useCase.execute(ids);

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtiene el detalle de una venta por ID
export const getSaleById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "ID inválido" });
        }

        const useCase = new GetSaleByIdUseCase(saleRepository);
        const result = await useCase.execute(id);

        res.json({ data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
