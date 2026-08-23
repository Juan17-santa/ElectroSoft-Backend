/**
 * Controlador HTTP del módulo Shopping.
 *
 * Responsabilidades:
 * - Recibir requests HTTP.
 * - Crear los casos de uso con sus dependencias.
 * - Enviar respuestas JSON al cliente.
 *
 * Importante:
 * - No contiene validaciones de negocio.
 * - Las reglas viven en domain y application.
 * - Las dependencias técnicas viven en infrastructure.
 *
 * Endpoints manejados:
 * - POST   /shopping
 * - PATCH  /shopping/:id/cancel
 * - GET    /shopping
 * - GET    /shopping/:id
 */
import CancelShoppingUseCase from "../application/CancelShoppingUseCase.js";
import CreateShoppingUseCase from "../application/CreateShoppingUseCase.js";
import GetShoppingByIdUseCase from "../application/GetShoppingByIdUseCase.js";
import GetShoppingUseCase from "../application/GetShoppingUseCase.js";
import ShoppingExternalCatalogGatewayMongo from "./ShoppingExternalCatalogGatewayMongo.js";
import ShoppingRepositoryMongo from "./ShoppingRepositoryMongo.js";
import ShoppingTransactionManagerMongo from "./ShoppingTransactionManagerMongo.js";
import {
    isInfrastructureError,
    sendControllerError,
    sendUnexpectedError,
} from "../../../shared/infrastructure/controllers/errorHandler.js";
import mongoose from "mongoose";

const shoppingRepository = new ShoppingRepositoryMongo();
const externalCatalogGateway = new ShoppingExternalCatalogGatewayMongo();
const transactionManager = new ShoppingTransactionManagerMongo();

function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    return new mongoose.Types.ObjectId(id).toString() === String(id);
}

// Validación de estructura del DTO de creación de compra.
function validateCreateShoppingBody(body) {
    if (!body || typeof body !== "object") {
        throw new Error("El cuerpo de la solicitud es requerido");
    }

    if (!body.invoiceNumber || !/^\d+$/.test(String(body.invoiceNumber).trim())) {
        throw new Error("El invoiceNumber es requerido y debe contener solo numeros");
    }

    if (!isValidObjectId(body.providerId)) {
        throw new Error("El providerId es requerido y debe ser un ObjectId valido");
    }

    if (!Array.isArray(body.products) || body.products.length === 0) {
        throw new Error("La compra debe tener al menos un producto");
    }

    body.products.forEach((product, index) => {
        if (!isValidObjectId(product.productId) && !product.newProduct) {
            throw new Error(`El productId es requerido y debe ser un ObjectId valido en el producto ${index + 1}`);
        }

        const quantity = Number(product.quantity);
        const purchasePrice = Number(product.purchasePrice);
        const salePrice = Number(product.salePrice);

        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(`La quantity debe ser numerica y mayor a 0 en el producto ${index + 1}`);
        }

        if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
            throw new Error(`El purchasePrice debe ser numerico y mayor a 0 en el producto ${index + 1}`);
        }

        if (!Number.isFinite(salePrice) || salePrice <= 0) {
            throw new Error(`El salePrice debe ser numerico y mayor a 0 en el producto ${index + 1}`);
        }
    });
}

// Crea una compra y aplica su impacto de inventario.
export const createShopping = async (req, res) => {
    try {
        validateCreateShoppingBody(req.body);

        const useCase = new CreateShoppingUseCase(
            shoppingRepository,
            transactionManager,
            externalCatalogGateway,
        );

        // Mapeo del request HTTP al formato del dominio.
        const shoppingData = {
            invoiceNumber: req.body.invoiceNumber,
            creadoPor: req.user?.id || null,
            providerId: req.body.providerId,
            purchaseDate: req.body.purchaseDate,
            products: (req.body.products ?? []).map((product) => ({
                productId: product.productId,
                quantity: product.quantity,
                purchasePrice: product.purchasePrice,
                salePrice: product.salePrice,
                useSuggestedPrice: product.useSuggestedPrice ?? false,
                appliedPrice: product.appliedPrice ?? null,
                newProduct: product.newProduct ?? null,
            })),
        };

        const result = await useCase.execute(shoppingData);

        res.status(201).json({
            message: "Compra registrada con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

// Anula una compra activa si cumple la regla doble de 48 horas.
export const cancelShopping = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        const useCase = new CancelShoppingUseCase(shoppingRepository, transactionManager, externalCatalogGateway);
        // El frontend envía el motivo en `motivo` (payload JSON). Aceptamos también `reason`.
        const motivo = req.body?.motivo ?? req.body?.reason ?? null;
        const result = await useCase.execute(req.params.id, motivo);

        res.json({
            message: "Compra anulada con exito",
            data: result,
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

// Lista todas las compras con paginación y búsqueda.
export const getShopping = async (req, res) => {
    try {
        const useCase = new GetShoppingUseCase(shoppingRepository);
        const { page, limit, search } = req.query;
        const result = await useCase.execute({ page, limit, search });

        res.json({
            data: result.items,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        sendUnexpectedError(res, error);
    }
};

// Exporta compras por rango de fecha de factura (purchaseDateIso) y búsqueda.
// Soporta paginación para que el frontend descargue el reporte por lotes.
export const exportShopping = async (req, res) => {
    try {
        const { from, to, search, page, limit } = req.query;
        const result = await shoppingRepository.exportAll({ from, to, search, page, limit });

        res.json({
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    } catch (error) {
        sendControllerError(res, error, 400);
    }
};

// Verifica si un número de factura está en uso por una compra activa.
export const checkInvoiceExists = async (req, res) => {
    try {
        const exists = await shoppingRepository.checkInvoiceExists(req.params.number);
        res.json({ exists });
    } catch (error) {
        sendUnexpectedError(res, error);
    }
};

// Obtiene el detalle de una compra por ID.
export const getShoppingById = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        const useCase = new GetShoppingByIdUseCase(shoppingRepository);
        const result = await useCase.execute(req.params.id);

        res.json({ data: result });
    } catch (error) {
        sendControllerError(res, error, 404);
    }
};

// Valida si una compra activa se puede anular sin modificar datos.
export const getShoppingCancellationStatus = async (req, res) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: "ID invalido" });
        }

        const useCase = new CancelShoppingUseCase(shoppingRepository, transactionManager, externalCatalogGateway);
        await useCase.validate(req.params.id);

        res.json({
            puedeAnularse: true,
            razon: "",
        });
    } catch (error) {
        if (isInfrastructureError(error)) {
            return sendUnexpectedError(res, error);
        }
        res.json({
            puedeAnularse: false,
            razon: error.message,
        });
    }
};

export const rejectGetCancelShopping = (_req, res) => {
    res.status(405).json({
        error: "Metodo no permitido. Para anular una compra usa PATCH /api/shopping/:id/cancel",
    });
};

export const getMisEstadisticasCompras = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
        const userId = req.user.id;

        const compras = await shoppingRepository.getMisEstadisticas(userId, Number(year), Number(month));

        const totalCompras = compras.reduce((acc, c) => acc + c.total, 0);

        res.json({
            success: true,
            data: {
                totalCompras,
                cantidadCompras: compras.length,
                compras,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMisComprasMensuales = async (req, res) => {
    try {
        const { year = new Date().getFullYear() } = req.query;
        const userId = req.user.id;
        const data = await shoppingRepository.getMisComprasMensuales(userId, Number(year));
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};