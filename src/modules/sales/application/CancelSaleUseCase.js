/**
 * Caso de uso para anular una venta.
 *
 * Responsabilidades:
 * - Verificar que la venta exista y esté en un estado anulable
 *   (ACTIVA por compatibilidad, Vigente o Finalizado).
 * - Validar que la anulación esté dentro de la ventana permitida (48 horas desde creación Y desde fechaVenta).
 * - Revertir el stock de los productos vendidos.
 * - Anular los pagos de la venta en la misma transacción.
 * - Marcar la venta como ANULADA.
 * - Confirmar o revertir la transacción.
 */

const HOURS_LIMIT = 48;
const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

const CANCELLABLE_SALE_STATES = ["ACTIVA", "Vigente", "Finalizado"];

function parseSaleDateEndOfDay(fechaVenta) {
    if (!fechaVenta || typeof fechaVenta !== "string") {
        throw new Error("La fechaVenta es obligatoria para anular la venta");
    }

    // Formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaVenta)) {
        const [year, month, day] = fechaVenta.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day, 23, 59, 59, 999);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() !== month - 1 ||
            parsedDate.getDate() !== day
        ) {
            throw new Error("La fechaVenta no es válida");
        }

        return parsedDate;
    }

    // Formato DD/MM/YYYY
    const parts = fechaVenta.split("/");
    if (parts.length !== 3) {
        throw new Error("La fechaVenta debe tener formato DD/MM/YYYY o YYYY-MM-DD");
    }

    const [day, month, year] = parts.map(Number);
    const parsedDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        throw new Error("La fechaVenta no es válida");
    }

    return parsedDate;
}

function validateCancellationWindow(sale, now) {
    const fechaCreacion = new Date(sale.fechaCreacion);

    if (Number.isNaN(fechaCreacion.getTime())) {
        throw new Error("La fechaCreacion de la venta no es válida");
    }

    const hoursFromCreation = (now - fechaCreacion) / MILLISECONDS_PER_HOUR;
    if (hoursFromCreation >= HOURS_LIMIT) {
        throw new Error("Han pasado más de 48 horas desde la creación de la venta");
    }

    const fechaVentaEndOfDay = parseSaleDateEndOfDay(sale.fechaVenta);
    const hoursFromInvoice = (now - fechaVentaEndOfDay) / MILLISECONDS_PER_HOUR;

    if (hoursFromInvoice >= HOURS_LIMIT) {
        throw new Error("Han pasado más de 48 horas desde la fecha de venta");
    }
}

export default class CancelSaleUseCase {
    constructor(
        saleRepository,
        transactionManager,
        externalCatalogGateway = null,
        devolutionRepository = null,
        paymentRepository = null,
    ) {
        this.saleRepository = saleRepository;
        this.transactionManager = transactionManager;
        this.externalCatalogGateway = externalCatalogGateway;
        this.devolutionRepository = devolutionRepository;
        this.paymentRepository = paymentRepository;
    }

    // Solo valida si se puede anular, sin modificar datos
    async validate(id) {
        const sale = await this.saleRepository.findById(id);

        if (!sale) {
            throw new Error("Venta no encontrada");
        }

        if (!CANCELLABLE_SALE_STATES.includes(sale.estado)) {
            throw new Error("Solo se pueden anular ventas activas, vigentes o finalizadas");
        }

        await this.ensureSaleHasNoDevolutions(id);
        validateCancellationWindow(sale, new Date());

        return {
            puedeAnularse: true,
            razon: "",
        };
    }

    async execute(id, motivo) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const sale = await this.saleRepository.findById(id, session);

            if (!sale) {
                throw new Error("Venta no encontrada");
            }

            if (!CANCELLABLE_SALE_STATES.includes(sale.estado)) {
                throw new Error("Solo se pueden anular ventas activas, vigentes o finalizadas");
            }

            await this.ensureSaleHasNoDevolutions(id, session);

            const now = new Date();
            validateCancellationWindow(sale, now);

            if (!this.externalCatalogGateway) {
                throw new Error("No se configuró el repositorio de productos para revertir inventario");
            }

            // Revertir el stock de cada producto
            for (const producto of sale.productos) {
                const updatedProduct = await this.externalCatalogGateway.revertSaleEntry(
                    producto.productoId,
                    producto.cantidad,
                    session,
                );

                if (!updatedProduct) {
                    throw new Error("No se pudo revertir el inventario de uno de los productos");
                }
            }

            // Decrementar compras del cliente
            await this.externalCatalogGateway.revertSaleFromClient(sale.clienteId, sale.total, session);

            // Anular los pagos de la venta en la misma transacción
            if (this.paymentRepository) {
                await this.paymentRepository.cancelBySaleId(id, session);
            }

            const updatedSale = await this.saleRepository.update(
                id,
                {
                    estado: "ANULADA",
                    anuladaEn: now,
                    ...(motivo ? { observaciones: motivo } : {}),
                },
                session,
            );

            await session.commitTransaction();

            return updatedSale;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async ensureSaleHasNoDevolutions(id, session = null) {
        if (!this.devolutionRepository) return;

        const devolutions = await this.devolutionRepository.findBySaleId(id, {
            includeAnuladas: false,
            session,
        });

        // Una devolución RECHAZADA no cuenta: se comporta como si nunca hubiera existido
        const hasActiveDevolutions = devolutions.some(
            (devolution) =>
                !devolution.anulada &&
                devolution.estadoResolucion !== "Anulada" &&
                devolution.estadoResolucion !== "RECHAZADA",
        );

        if (hasActiveDevolutions) {
            throw new Error("No se puede anular una venta que tiene devoluciones registradas");
        }
    }
}
