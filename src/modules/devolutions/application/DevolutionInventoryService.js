const FINAL_RESOLUTION_STATES = new Set(["RESUELTO", "RECHAZADA"]);
const CANCELLED_RESOLUTION_STATE = "Anulada";
const CANCELLED_SALE_STATES = new Set(["ANULADA", "Anulado"]);

function toPlain(document) {
    return document?.toObject?.() ?? document;
}

function getId(value) {
    if (!value) return "";
    if (value._id) return String(value._id);
    return String(value);
}

function isActiveDevolution(devolution) {
    return !devolution.anulada && devolution.estadoResolucion !== CANCELLED_RESOLUTION_STATE;
}

function getSaleProductQuantities(sale) {
    return (sale.productos ?? []).reduce((acc, item) => {
        const producto = toPlain(item);
        const productoId = getId(producto.productoId);
        acc.set(productoId, (acc.get(productoId) ?? 0) + Number(producto.cantidad ?? 0));
        return acc;
    }, new Map());
}

function addProductQuantities(target, productos = []) {
    productos.forEach((item) => {
        const producto = toPlain(item);
        const productoId = getId(producto.productoId);
        target.set(productoId, (target.get(productoId) ?? 0) + Number(producto.cantidad ?? 0));
    });
}

export function isFinalResolutionState(state) {
    return FINAL_RESOLUTION_STATES.has(state);
}

/**
 * Reglas de negocio para el monto reembolsado por producto.
 * - REEMBOLSO_TOTAL: montoReembolso = cantidad x precioUnitario (el precio de la
 *   venta ya incluye IVA), redondeado a 2 decimales.
 * - REEMBOLSO_PARCIAL: montoReembolso = valor ingresado, obligatorio, mayor a 0
 *   y nunca superior al total de la linea (cantidad x precioUnitario, IVA incluido).
 * - Otras gestiones: montoReembolso = null.
 * No muta los documentos originales: devuelve un arreglo nuevo.
 */
export function applyReembolsoRules(sale, productos = []) {
    const salePrices = new Map();
    (sale?.productos ?? []).forEach((item) => {
        const producto = toPlain(item);
        salePrices.set(getId(producto.productoId), Number(producto.precioUnitario ?? 0));
    });

    const tieneSaldoPendiente =
        Number(sale?.montoPorPagar ?? 0) > 0 && sale?.estado !== "Finalizado";

    return productos.map((item, index) => {
        const producto = { ...toPlain(item) };
        const gestion = String(producto.gestion ?? "");
        const esReembolso = gestion === "REEMBOLSO_TOTAL" || gestion === "REEMBOLSO_PARCIAL";

        if (esReembolso && tieneSaldoPendiente) {
            throw new Error(
                "No se puede registrar un reembolso en efectivo sobre una venta con saldo pendiente. Aplica el valor como abono al saldo de la venta.",
            );
        }

        const cantidad = Number(producto.cantidad ?? 0);
        const precioUnitario = salePrices.get(getId(producto.productoId)) ?? 0;
        const maximo = Math.round(cantidad * precioUnitario * 100) / 100;

        if (gestion === "REEMBOLSO_TOTAL") {
            if (maximo <= 0) {
                throw new Error(
                    `No se puede calcular el reembolso total del producto ${index + 1}: la venta no tiene precio valido`,
                );
            }
            producto.montoReembolso = maximo;
        } else if (gestion === "REEMBOLSO_PARCIAL") {
            const monto = Number(producto.montoReembolso);
            if (!Number.isFinite(monto) || monto <= 0) {
                throw new Error(
                    `El montoReembolso es obligatorio y debe ser mayor a 0 para la gestion REEMBOLSO_PARCIAL del producto ${index + 1}`,
                );
            }
            if (monto < 100) {
                throw new Error(
                    `El montoReembolso del producto ${index + 1} no puede ser menor a 100`,
                );
            }
            if (monto > 999999999) {
                throw new Error(
                    `El montoReembolso del producto ${index + 1} no puede superar 9 digitos`,
                );
            }
            if (maximo <= 0) {
                throw new Error(
                    `No se puede validar el reembolso parcial del producto ${index + 1}: la venta no tiene precio valido`,
                );
            }
            if (monto > maximo) {
                throw new Error(
                    `El montoReembolso del producto ${index + 1} supera el maximo permitido (${maximo})`,
                );
            }
            producto.montoReembolso = monto;
        } else {
            producto.montoReembolso = null;
        }

        return producto;
    });
}

export async function validateReturnQuantities({
    sale,
    devolutionRepository,
    saleId,
    productos,
    session,
    excludeDevolutionId = null,
}) {
    const soldByProduct = getSaleProductQuantities(sale);
    const returnedByProduct = new Map();
    const existingDevolutions = await devolutionRepository.findBySaleId(saleId, {
        includeAnuladas: false,
        session,
    });

    productos.forEach((item, index) => {
        const producto = toPlain(item);
        const cantidad = Number(producto.cantidad);

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
            throw new Error(`La cantidad debe ser mayor a 0 en el producto ${index + 1}`);
        }

        if (!Number.isInteger(cantidad)) {
            throw new Error(`La cantidad debe ser un numero entero en el producto ${index + 1}`);
        }
    });

    existingDevolutions
        .filter((devolution) => String(devolution._id) !== String(excludeDevolutionId ?? ""))
        .filter(isActiveDevolution)
        .forEach((devolution) => addProductQuantities(returnedByProduct, devolution.productos));

    addProductQuantities(returnedByProduct, productos);

    for (const [productoId, returnedQuantity] of returnedByProduct.entries()) {
        const soldQuantity = soldByProduct.get(productoId) ?? 0;

        if (soldQuantity <= 0) {
            throw new Error(`El producto ${productoId} no pertenece a la venta`);
        }

        if (returnedQuantity > soldQuantity) {
            throw new Error(
                `La cantidad devuelta del producto ${productoId} supera la cantidad vendida. ` +
                `Vendido: ${soldQuantity}, devuelto: ${returnedQuantity}`,
            );
        }
    }
}

export async function applyInventoryImpact(productRepository, productos = [], session, multiplier = 1) {
    for (const item of productos) {
        const producto = toPlain(item);

        if (producto.condicionProducto !== "BUEN_ESTADO") continue;

        const updatedProduct = await productRepository.updateStock(
            producto.productoId,
            Number(producto.cantidad) * multiplier,
            session,
        );

        if (!updatedProduct) {
            throw new Error(`Producto no encontrado: ${producto.productoId}`);
        }
    }
}

export async function recalculateSaleReturnState({
    saleRepository,
    devolutionRepository,
    saleId,
    session,
}) {
    const sale = await saleRepository.findById(saleId, session);
    if (!sale) throw new Error("Venta no encontrada");
    if (CANCELLED_SALE_STATES.has(sale.estado)) return sale;

    const soldByProduct = getSaleProductQuantities(sale);
    const existingDevolutions = await devolutionRepository.findBySaleId(saleId, {
        includeAnuladas: false,
        session,
    });
    const returnedByProduct = new Map();

    existingDevolutions
        .filter(isActiveDevolution)
        .forEach((devolution) => addProductQuantities(returnedByProduct, devolution.productos));

    const totalSold = [...soldByProduct.values()].reduce((sum, quantity) => sum + quantity, 0);
    const totalReturned = [...returnedByProduct.values()].reduce((sum, quantity) => sum + quantity, 0);

    const nextState =
        totalReturned <= 0
            ? "ACTIVA"
            : [...soldByProduct.entries()].every(
                ([productoId, soldQuantity]) => (returnedByProduct.get(productoId) ?? 0) >= soldQuantity,
            ) && totalReturned >= totalSold
                ? "Devuelto"
                : "Devolución Parcial";

    if (sale.estado === nextState) return sale;

    return await saleRepository.update(saleId, { estado: nextState }, session);
}
