/**
 * Controlador HTTP del módulo Devolutions.
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
 * - POST   /devolutions
 * - PATCH  /devolutions/:id/confirm
 * - GET    /devolutions
 * - GET    /devolutions/:id
 */
import ConfirmDevolutionUseCase from "../application/ConfirmDevolutionUseCase.js";
import CreateDevolutionUseCase from "../application/CreateDevolutionUseCase.js";
import GetDevolutionByIdUseCase from "../application/GetDevolutionByIdUseCase.js";
import GetDevolutionsUseCase from "../application/GetDevolutionsUseCase.js";
import DevolutionRepositoryMongo from "./DevolutionRepositoryMongo.js";
import DevolutionTransactionManagerMongo from "./DevolutionTransactionManagerMongo.js";

const devolutionRepository = new DevolutionRepositoryMongo();
const transactionManager = new DevolutionTransactionManagerMongo();

// Crea una devolución y marca el impacto simulado.
export const createDevolution = async (req, res) => {
    try {
        const useCase = new CreateDevolutionUseCase(devolutionRepository, transactionManager);
        const result = await useCase.execute(req.body);

        res.status(201).json({
            message: "Devolucion registrada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Confirma una devolución pendiente.
export const confirmDevolution = async (req, res) => {
    try {
        const useCase = new ConfirmDevolutionUseCase(devolutionRepository, transactionManager);
        const result = await useCase.execute(req.params.id);

        res.json({
            message: "Devolucion confirmada con exito",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Lista todas las devoluciones.
export const getDevolutions = async (req, res) => {
    try {
        const useCase = new GetDevolutionsUseCase(devolutionRepository);
        const result = await useCase.execute();

        res.json({ data: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtiene el detalle de una devolución por ID.
export const getDevolutionById = async (req, res) => {
    try {
        const useCase = new GetDevolutionByIdUseCase(devolutionRepository);
        const result = await useCase.execute(req.params.id);

        res.json({ data: result });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};
