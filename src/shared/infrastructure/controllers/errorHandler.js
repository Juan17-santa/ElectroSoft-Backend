import mongoose from "mongoose";

const INFRA_ERROR_NAMES = new Set([
    "MongoServerError",
    "MongoNetworkError",
    "MongoNetworkTimeoutError",
    "MongoBulkWriteError",
    "BulkWriteError",
    "BSONError",
    "TypeError",
    "ReferenceError",
    "RangeError",
]);

// Errores de datos inválidos provenientes del cliente: deben responderse con
// 400 y mensaje claro, no como errores internos (500).
const CLIENT_ERROR_NAMES = new Set(["ValidationError", "CastError"]);

export function isInfrastructureError(error) {
    if (!error) return false;
    if (error instanceof mongoose.Error) {
        return !CLIENT_ERROR_NAMES.has(error.name);
    }
    return INFRA_ERROR_NAMES.has(error.name);
}

export function sendUnexpectedError(res, error) {
    console.error(error);
    return res.status(500).json({ error: "Error interno del servidor" });
}

// Conserva el contrato { error } del Frontend:
// - Errores de negocio esperados: fallbackStatus con su mensaje (400/404).
// - Errores inesperados (infraestructura/programación): 500 genérico + detalle en consola.
export function sendControllerError(res, error, fallbackStatus = 400) {
    if (isInfrastructureError(error)) {
        return sendUnexpectedError(res, error);
    }
    return res.status(fallbackStatus).json({ error: error.message });
}
