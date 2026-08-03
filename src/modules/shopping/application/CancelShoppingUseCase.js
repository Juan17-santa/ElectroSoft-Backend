const HOURS_LIMIT = 48;
const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

function parseInvoiceDateEndOfDay(purchaseDate) {
    if (!purchaseDate || typeof purchaseDate !== "string") {
        throw new Error("The purchaseDate is required to cancel the purchase");
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
        const [year, month, day] = purchaseDate.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day, 23, 59, 59, 999);

        if (
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() !== month - 1 ||
            parsedDate.getDate() !== day
        ) {
            throw new Error("The purchaseDate is not valid");
        }

        return parsedDate;
    }

    const parts = purchaseDate.split("/");
    if (parts.length !== 3) {
        throw new Error("The purchaseDate must be in format DD/MM/YYYY or YYYY-MM-DD");
    }

    const [day, month, year] = parts.map(Number);
    const parsedDate = new Date(year, month - 1, day, 23, 59, 59, 999);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        throw new Error("The purchaseDate is not valid");
    }

    return parsedDate;
}

function validateCancellationWindow(shopping, now) {
    const createdAt = new Date(shopping.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
        throw new Error("The createdAt date of the purchase is not valid");
    }

    const hoursFromCreation = (now - createdAt) / MILLISECONDS_PER_HOUR;
    if (hoursFromCreation >= HOURS_LIMIT) {
        throw new Error("More than 48 hours have passed since the creation of the purchase");
    }

    const purchaseDateEndOfDay = parseInvoiceDateEndOfDay(shopping.purchaseDate);
    const hoursFromInvoice = (now - purchaseDateEndOfDay) / MILLISECONDS_PER_HOUR;

    if (hoursFromInvoice >= HOURS_LIMIT) {
        throw new Error("More than 48 hours have passed since the purchase date");
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

    async execute(id, motivo = null) {
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

            await this.externalCatalogGateway.bulkRevertPurchaseEntries(
                shopping.products.map((producto) => ({
                    productId: producto.productId?._id ?? producto.productId,
                    quantity: producto.quantity,
                    salePrice: producto.salePrice,
                    useSuggestedPrice: producto.useSuggestedPrice,
                    previousPrice: producto.previousPrice ?? null,
                    previousCostoPromedio: producto.previousCostoPromedio ?? null,
                })),
                session,
            );

            const cancellationInfo = {
                motivo: motivo ?? "Anulada desde backend",
                fechaAnulacion: now,
            };

            const updatedShopping = await this.shoppingRepository.update(
                id,
                {
                    estado: "ANULADA",
                    cancelledAt: now,
                    infoAnulacion: cancellationInfo,
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