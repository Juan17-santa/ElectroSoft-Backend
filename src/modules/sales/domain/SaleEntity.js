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
        estado = "ACTIVA",
        impactApplied = false,
        fechaVenta,
        fechaCreacion = new Date(),
        anuladaEn = null,
    }) {
        // VALIDACIÓN: NÚMERO DE FACTURA
        if (!numeroFactura || !/^\d+$/.test(String(numeroFactura).trim())) {
            throw new Error("El numeroFactura es obligatorio y solo debe contener números");
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
        this.estado = estado;
        this.impactApplied = impactApplied;
        this.fechaVenta = fechaVenta;
        this.fechaCreacion = fechaCreacion;
        this.anuladaEn = anuladaEn;
    }

    calculateTotal() {
        this.total = this.productos.reduce(
            (acc, producto) => acc + producto.cantidad * producto.precioUnitario,
            0,
        );

        return this.total;
    }
}