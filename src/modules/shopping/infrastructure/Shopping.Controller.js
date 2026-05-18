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

const shoppingRepository = new ShoppingRepositoryMongo();
const externalCatalogGateway = new ShoppingExternalCatalogGatewayMongo();
const transactionManager = new ShoppingTransactionManagerMongo();

// Crea una compra y aplica su impacto de inventario.
export const createShopping = async (req, res) => {
    try {
        const useCase = new CreateShoppingUseCase(
            shoppingRepository,
            transactionManager,
            externalCatalogGateway,
        );

        // Mapeo del request HTTP al formato del dominio.
        // El cliente puede enviar "id" y "costeProducto", pero el dominio
        // espera "productoId" y "precioCompra".
        const shoppingData = {
            ...req.body,
            productos: req.body.productos?.map((producto) => ({
                productoId: producto.productoId ?? producto.id,
                cantidad: producto.cantidad,
                precioCompra: producto.precioCompra ?? producto.costeProducto,
                precioVenta: producto.precioVenta,
                usarPrecioSugerido: producto.usarPrecioSugerido ?? producto.sobreescribirConSugerido ?? false,
            })),
        };

        const result = await useCase.execute(shoppingData);

        res.status(201).json({
            message: "Compra registrada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Anula una compra activa si cumple la regla doble de 48 horas.
export const cancelShopping = async (req, res) => {
    try {
        const useCase = new CancelShoppingUseCase(shoppingRepository, transactionManager, externalCatalogGateway);
        const result = await useCase.execute(req.params.id);

        res.json({
            message: "Compra anulada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lista todas las compras.
export const getShopping = async (req, res) => {
    try {
        const useCase = new GetShoppingUseCase(shoppingRepository);
        const result = await useCase.execute();

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtiene el detalle de una compra por ID.
export const getShoppingById = async (req, res) => {
    try {
        const useCase = new GetShoppingByIdUseCase(shoppingRepository);
        const result = await useCase.execute(req.params.id);

        res.json({ data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

// Valida si una compra activa se puede anular sin modificar datos.
export const getShoppingCancellationStatus = async (req, res) => {
    try {
        const useCase = new CancelShoppingUseCase(shoppingRepository, transactionManager, externalCatalogGateway);
        await useCase.validate(req.params.id);

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

export const rejectGetCancelShopping = (_req, res) => {
    res.status(405).json({
        error: "Metodo no permitido. Para anular una compra usa PATCH /api/shopping/:id/cancel",
    });
};
