/**
 * Caso de uso para anular una compra.
 *
 * Responsabilidades:
 * - Iniciar una transacción de MongoDB.
 * - Buscar la compra.
 * - Validar que la compra esté ACTIVA.
 * - Validar la regla doble de 48 horas:
 *   1. Desde fechaCreacion.
 *   2. Desde fechaCompra en formato DD/MM/YYYY, tomando el fin del día.
 * - Marcar la compra como ANULADA.
 * - Registrar anuladaEn.
 *
 * Importante:
 * - No recalcula stock.
 * - No toca inventario real.
 * - La anulación solo cambia el estado dentro del módulo Shopping.
 */
const HOURS_LIMIT = 48;
const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

/**
 * Convierte fechaCompra desde DD/MM/YYYY al final del día.
 *
 * Esta regla evita penalizar compras registradas el mismo día en horas tempranas.
 */
function parseInvoiceDateEndOfDay(fechaCompra) {
    if (!fechaCompra || typeof fechaCompra !== "string") {
        throw new Error("La fechaCompra es obligatoria para anular la compra");
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaCompra)) {
        const [year, month, day] = fechaCompra.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day, 23, 59, 59, 999);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() !== month - 1 ||
            parsedDate.getDate() !== day
        ) {
            throw new Error("La fechaCompra no es valida");
        }

        return parsedDate;
    }

    const parts = fechaCompra.split("/");
    if (parts.length !== 3) {
        throw new Error("La fechaCompra debe tener formato DD/MM/YYYY o YYYY-MM-DD");
    }

    const [day, month, year] = parts.map(Number);
    const parsedDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        throw new Error("La fechaCompra no es valida");
    }

    return parsedDate;
}

/**
 * Valida la ventana máxima de 48 horas para anular.
 *
 * Si cualquiera de los dos controles falla, la compra no puede anularse.
 */
function validateCancellationWindow(shopping, now) {
    const fechaCreacion = new Date(shopping.fechaCreacion);

    if (Number.isNaN(fechaCreacion.getTime())) {
        throw new Error("La fechaCreacion de la compra no es valida");
    }

    const hoursFromCreation = (now - fechaCreacion) / MILLISECONDS_PER_HOUR;
    if (hoursFromCreation >= HOURS_LIMIT) {
        throw new Error("Han pasado mas de 48 horas desde la creacion de la compra");
    }

    const fechaCompraEndOfDay = parseInvoiceDateEndOfDay(shopping.fechaCompra);
    const hoursFromInvoice = (now - fechaCompraEndOfDay) / MILLISECONDS_PER_HOUR;

    if (hoursFromInvoice >= HOURS_LIMIT) {
        throw new Error("Han pasado mas de 48 horas desde la fecha de compra");
    }
}

export default class CancelShoppingUseCase {
    constructor(shoppingRepository, transactionManager) {
        this.shoppingRepository = shoppingRepository;
        this.transactionManager = transactionManager;
    }

    async validate(id) {
        const shopping = await this.shoppingRepository.findById(id);

        if (!shopping) {
            throw new Error("Compra no encontrada");
        }

        if (shopping.estado !== "ACTIVA") {
            throw new Error("Solo se pueden anular compras activas");
        }

        validateCancellationWindow(shopping, new Date());

        return {
            puedeAnularse: true,
            razon: "",
        };
    }

    async execute(id) {
        // Inicia sesión para garantizar que lectura y actualización sean atómicas.
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            // La lectura participa en la misma sesión transaccional.
            const shopping = await this.shoppingRepository.findById(id, session);

            if (!shopping) {
                throw new Error("Compra no encontrada");
            }

            if (shopping.estado !== "ACTIVA") {
                throw new Error("Solo se pueden anular compras activas");
            }

            const now = new Date();
            validateCancellationWindow(shopping, now);

            // Solo se marca estado; el impacto de inventario aún no existe.
            const updatedShopping = await this.shoppingRepository.update(
                id,
                {
                    estado: "ANULADA",
                    anuladaEn: now,
                },
                session,
            );

            await session.commitTransaction();

            return updatedShopping;
        } catch (error) {
            // Si falla la validación o la actualización, se revierte la transacción.
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
