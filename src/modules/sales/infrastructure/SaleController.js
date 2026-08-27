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
import NotificationService from "../../notifications/application/NotificationService.js";

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

        const numeroFactura = await saleRepository.getNextInvoiceNumber();   // ← ESTA LÍNEA FALTA

        const saleData = {
            ...req.body,
            numeroFactura,
            creadoPor: req.user?.id || null,
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

        await NotificationService.createNotification(
            "Venta Anulada",
            `Se ha anulado la venta ${id}.`,
            "SALE",
            `/sales/${id}`
        );

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 0;
        const useCase = new GetSalesUseCase(saleRepository);
        const result = await useCase.execute({ page, limit });

        res.json({ data: result.data || result, pagination: result.data ? { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages } : undefined });
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


export const getMisEstadisticas = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
        const userId = req.user.id;

        const ventas = await saleRepository.getMisEstadisticas(userId, Number(year), Number(month));

        const totalVentas = ventas.reduce((acc, v) => acc + (v.montoPagado ?? 0), 0);
        const productosVendidos = ventas.reduce((acc, v) =>
            acc + v.productos.reduce((sum, p) => sum + p.cantidad, 0), 0);
        const ventasPorTipo = {
            Contado: ventas
                .filter(v => v.tipoVenta === "Contado")
                .reduce((acc, v) => acc + (v.montoPagado ?? 0), 0),
            Credito: ventas
                .filter(v => v.tipoVenta === "Crédito" || v.tipoVenta === "Credito")
                .reduce((acc, v) => acc + (v.montoPagado ?? 0), 0),
        };

        res.json({
            success: true,
            data: {
                totalVentas,
                productosVendidos,
                cantidadVentas: ventas.length,
                ventasPorTipo,
                ventas,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMisVentasMensuales = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const userId = req.user.id;
        const data = await saleRepository.getMisVentasMensuales(userId, Number(year));
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};