export const DEVOLUTION_STATES = [
    "CREADA",
    "PENDIENTE_PROVEEDOR",
    "ENVIADO_PROVEEDOR",
    "PRODUCTO_ENTREGADO_PROVEEDOR",
    "PRODUCTO_ENTREGADO_CLIENTE",
    "REEMBOLSO_PROVEEDOR",
    "REEMBOLSO_EMPRESA",
    "RESUELTO",
    "RECHAZADA",
];

export const DEVOLUTION_SPECIAL_STATES = ["Anulada"];

export const DEVOLUTION_PRODUCT_REASONS = ["GARANTIA", "LOGISTICA", "CLIENTE"];

function normalizeDateOnly(value) {
    if (!value) return new Date().toISOString().split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        throw new Error("La fechaDevolucion debe tener formato YYYY-MM-DD");
    }
    return String(value);
}

export default class DevolutionEntity {
    constructor({
        saleId,
        productos,
        fechaDevolucion,
        estadoResolucion = "CREADA",
        historialEstados = [],
        anulada = false,
        anuladaEn = null,
        impactApplied = false,
        fechaCreacion = new Date(),
        actualizadoEn = new Date(),
        confirmadaEn = null,
    }) {
        if (!saleId) throw new Error("El saleId es obligatorio");

        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error("La devolucion debe tener al menos un producto");
        }

        if (
            !DEVOLUTION_STATES.includes(estadoResolucion) &&
            !DEVOLUTION_SPECIAL_STATES.includes(estadoResolucion)
        ) {
            throw new Error("El estadoResolucion no es valido");
        }

        productos.forEach((producto, index) => {
            if (!producto.productoId) {
                throw new Error(`El productoId es obligatorio en el producto ${index + 1}`);
            }

            if (!producto.nombre || !String(producto.nombre).trim()) {
                throw new Error(`El nombre es obligatorio en el producto ${index + 1}`);
            }

            const cantidad = Number(producto.cantidad);
            if (!Number.isFinite(cantidad) || cantidad <= 0) {
                throw new Error(`La cantidad debe ser mayor a 0 en el producto ${index + 1}`);
            }

            if (!Number.isInteger(cantidad)) {
                throw new Error(`La cantidad debe ser un numero entero en el producto ${index + 1}`);
            }

            if (producto.motivo && !DEVOLUTION_PRODUCT_REASONS.includes(producto.motivo)) {
                throw new Error(`El motivo no es valido en el producto ${index + 1}`);
            }

            if (!producto.descripcion || !String(producto.descripcion).trim()) {
                throw new Error(`La descripcion es obligatoria en el producto ${index + 1}`);
            }
        });

        this.saleId = String(saleId);
        this.productos = productos.map((producto) => ({
            productoId: String(producto.productoId),
            nombre: String(producto.nombre).trim(),
            cantidad: Number(producto.cantidad),
            motivo: producto.motivo ?? "",
            submotivo: producto.submotivo ?? "",
            condicionProducto: producto.condicionProducto ?? "",
            regresarAlInventario:
                producto.regresarAlInventario === undefined
                    ? true
                    : Boolean(producto.regresarAlInventario),
            gestion: producto.gestion ?? "",
            responsable: producto.responsable ?? "",
            garantiaProveedor:
                producto.garantiaProveedor === undefined ? null : producto.garantiaProveedor,
            descripcion: String(producto.descripcion).trim(),
            observaciones: producto.observaciones ?? "",
            montoReembolso:
                producto.montoReembolso === undefined ? null : Number(producto.montoReembolso),
        }));
        this.fechaDevolucion = normalizeDateOnly(fechaDevolucion);
        this.estadoResolucion = estadoResolucion;
        this.historialEstados = historialEstados;
        this.anulada = Boolean(anulada);
        this.anuladaEn = anuladaEn;
        this.impactApplied = Boolean(impactApplied);
        this.fechaCreacion = fechaCreacion;
        this.actualizadoEn = actualizadoEn;
        this.confirmadaEn = confirmadaEn;
    }
}
