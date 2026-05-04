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
import ShoppingRepositoryMongo from "./ShoppingRepositoryMongo.js";
import ShoppingTransactionManagerMongo from "./ShoppingTransactionManagerMongo.js";

const shoppingRepository = new ShoppingRepositoryMongo();
const transactionManager = new ShoppingTransactionManagerMongo();

// Crea una compra y marca el impacto simulado.
export const createShopping = async (req, res) => {
    try {
        const useCase = new CreateShoppingUseCase(shoppingRepository, transactionManager);
        const result = await useCase.execute(req.body);

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
        const useCase = new CancelShoppingUseCase(shoppingRepository, transactionManager);
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
