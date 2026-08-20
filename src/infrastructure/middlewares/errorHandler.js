export const sendControllerError = (res, error, fallbackStatus = 500) => {
    if (error?.code === 11000) {
        return res.status(409).json({ error: "El recurso ya existe." });
    }

    if (error?.name === "ValidationError" || error?.name === "CastError") {
        return res.status(400).json({ error: "Los datos enviados no son válidos." });
    }

    const status = fallbackStatus >= 500 ? 500 : fallbackStatus;
    const message = status >= 500 ? "Ocurrió un error inesperado." : error?.message;
    return res.status(status).json({ error: message || "Solicitud inválida." });
};

export const errorHandler = (error, _req, res, _next) => {
    console.error(error);
    return sendControllerError(res, error, 500);
};