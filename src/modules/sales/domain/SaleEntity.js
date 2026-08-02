/**
 * Entidad de dominio para Ventas.
 *
 * Representa la lógica de negocio de una venta.
 * Contiene todas las validaciones de negocio sin depender de librerías externas.
 *
 * Validaciones:
 * - El número de factura es obligatorio y solo debe contener números.
 * - El clienteId es obligatorio.
 * - La venta debe tener al menos un producto.
 * - Cada producto debe tener productoId, cantidad > 0 y precioUnitario > 0.
 */
export default class SaleEntity {
    constructor({
        numeroFactura,
        clienteId,
        productos,
        total = 0,
        subtotal = 0,
        iva = 0,
        estado = "ACTIVA",
        impactApplied = false,
        fechaVenta,
        fechaCreacion = new Date(),
        anuladaEn = null,
        tipoVenta = "Contado",
        diasPlazo = null,
        observaciones = "",
        montoPagado = 0,
        montoPorPagar = 0,
        montoCredito = 0,
        montoContado = 0,
    }) {
        // VALIDACIÓN: NÚMERO DE FACTURA
        if (!numeroFactura || !String(numeroFactura).trim()) {
            throw new Error("El numeroFactura es obligatorio");
        }

        // VALIDACIÓN: CLIENTE
        if (!clienteId) {
            throw new Error("El clienteId es obligatorio");
        }

        // VALIDACIÓN: PRODUCTOS
        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error("La venta debe tener al menos un producto");
        }

        productos.forEach((producto, index) => {
            const cantidad = Number(producto.cantidad);
            const precioUnitario = Number(producto.precioUnitario);

            if (!producto.productoId) {
                throw new Error(`El productoId es obligatorio en el producto ${index + 1}`);
            }

            if (!Number.isFinite(cantidad) || cantidad <= 0) {
                throw new Error(`La cantidad debe ser mayor a 0 en el producto ${index + 1}`);
            }

            if (!Number.isInteger(cantidad)) {
                throw new Error(`La cantidad debe ser un número entero en el producto ${index + 1}`);
            }

            if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
                throw new Error(`El precioUnitario debe ser mayor a 0 en el producto ${index + 1}`);
            }
        });

        // ASIGNACIÓN DE VALORES
        this.numeroFactura = String(numeroFactura).trim();
        this.clienteId = clienteId;
        this.productos = productos.map((producto) => ({
            productoId: producto.productoId,
            cantidad: Number(producto.cantidad),
            precioUnitario: Number(producto.precioUnitario),
        }));
        this.total = Number(total);
        this.subtotal = Number(subtotal);
        this.iva = Number(iva);
        this.estado = estado;
        this.impactApplied = impactApplied;
        this.fechaVenta = fechaVenta;
        this.fechaCreacion = fechaCreacion;
        this.anuladaEn = anuladaEn;
        this.tipoVenta = tipoVenta || "Contado";
        this.diasPlazo = diasPlazo;
        this.observaciones = observaciones || "";
        this.montoPagado = Number(montoPagado || 0);
        this.montoPorPagar = Number(montoPorPagar || 0);
        this.montoCredito = Number(montoCredito || 0);
        this.montoContado = Number(montoContado || 0);
    }

    calculateTotal() {
        // En este sistema, el precioUnitario de los productos ya incluye el IVA.
        this.total = this.productos.reduce(
            (acc, producto) => acc + (producto.cantidad * producto.precioUnitario),
            0,
        );
        this.subtotal = this.total / 1.19;
        this.iva = this.total - this.subtotal;


        if (this.tipoVenta === "Contado") {
            this.montoPagado = this.total;
            this.montoPorPagar = 0;
            this.montoContado = this.total;
            this.montoCredito = 0;
        } else if (this.tipoVenta === "Credito" || this.tipoVenta === "Crédito") {
            this.montoPagado = 0;
            this.montoPorPagar = this.total;
            this.montoContado = 0;
            this.montoCredito = this.total;
        } else if (this.tipoVenta === "Mixto") {
            this.montoCredito = Number(this.montoCredito || 0);
            this.montoContado = Math.max(0, this.total - this.montoCredito);
            this.montoPagado = this.montoContado;
            this.montoPorPagar = this.montoCredito;
        }

        return this.total;
    }
}