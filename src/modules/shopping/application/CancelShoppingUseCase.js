const HOURS_LIMIT = 48;
const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

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
    constructor(shoppingRepository, transactionManager, externalCatalogGateway = null) {
        this.shoppingRepository = shoppingRepository;
        this.transactionManager = transactionManager;
        this.externalCatalogGateway = externalCatalogGateway;
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
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const shopping = await this.shoppingRepository.findById(id, session);

            if (!shopping) {
                throw new Error("Compra no encontrada");
            }

            if (shopping.estado !== "ACTIVA") {
                throw new Error("Solo se pueden anular compras activas");
            }

            const now = new Date();
            validateCancellationWindow(shopping, now);

            if (!this.externalCatalogGateway) {
                throw new Error("No se configuro el repositorio de productos para revertir inventario");
            }

            for (const producto of shopping.productos) {
                const updatedProduct = await this.externalCatalogGateway.revertPurchaseEntry(
                    producto.productoId,
                    producto.cantidad,
                    session,
                );

                if (!updatedProduct) {
                    throw new Error("No se puede anular la compra porque el stock actual de un producto es menor a la cantidad comprada");
                }
            }

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
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
