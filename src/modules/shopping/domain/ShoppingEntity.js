export default class ShoppingEntity {
    constructor({
        invoiceNumber,
        providerId,
        products,
        total = 0,
        estado = "ACTIVA",
        impactApplied = false,
        purchaseDate,
        purchaseDateIso,
        createdAt = new Date(),
        cancelledAt = null,
        creadoPor = null, 
    }) {
        if (!invoiceNumber || !/^\d+$/.test(String(invoiceNumber).trim())) {
            throw new Error("The invoiceNumber is required and must contain only numbers");
        }

        if (!providerId) throw new Error("The providerId is required");

        if (!Array.isArray(products) || products.length === 0) {
            throw new Error("The purchase must have at least one product");
        }

        products.forEach((product, index) => {
            const quantity = Number(product.quantity);
            const purchasePrice = Number(product.purchasePrice);
            const salePrice = Number(product.salePrice);

            if (!product.productId) {
                throw new Error(`The productId is required in product ${index + 1}`);
            }

            if (!Number.isFinite(quantity) || quantity <= 0) {
                throw new Error(`The quantity must be greater than 0 in product ${index + 1}`);
            }

            if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
                throw new Error(`The purchasePrice must be greater than 0 in product ${index + 1}`);
            }

            if (!Number.isFinite(salePrice) || salePrice <= purchasePrice) {
                throw new Error(`The salePrice must be greater than purchasePrice in product ${index + 1}`);
            }
        });

        this.invoiceNumber = String(invoiceNumber).trim();
        this.providerId = providerId;
        this.products = products.map((product) => ({
            productId: product.productId,
            quantity: Number(product.quantity),
            purchasePrice: Number(product.purchasePrice),
            salePrice: Number(product.salePrice),
            useSuggestedPrice: product.useSuggestedPrice === true || product.useSuggestedPrice === "true",
            appliedPrice: product.appliedPrice != null ? Number(product.appliedPrice) : null,
            // Campos opcionales: snapshot de precio previo para permitir reversión exacta
            previousPrice: product.previousPrice != null ? Number(product.previousPrice) : null,
            previousCostoPromedio: product.previousCostoPromedio != null ? Number(product.previousCostoPromedio) : null,
        }));
        this.total = Number(total);
        this.estado = estado;
        this.impactApplied = impactApplied;
        this.purchaseDate = purchaseDate;
        this.purchaseDateIso = purchaseDateIso ?? null;
        this.createdAt = createdAt;
        this.cancelledAt = cancelledAt;
        this.creadoPor = creadoPor;
    }

    calculateTotal() {
        this.total = this.products.reduce(
            (acc, product) => acc + product.quantity * product.purchasePrice,
            0,
        );
        return this.total;
    }
}
