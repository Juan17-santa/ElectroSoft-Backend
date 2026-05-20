export default class ShoppingEntity {
    constructor({
        numeroFactura,
        proveedorId,
        productos,
        total = 0,
        estado = "ACTIVA",
        impactApplied = false,
        fechaCompra,
        fechaCreacion = new Date(),
        anuladaEn = null,
    }) {
        if (!numeroFactura || !/^\d+$/.test(String(numeroFactura).trim())) {
            throw new Error("El numeroFactura es obligatorio y solo debe contener numeros");
        }

        if (!proveedorId) throw new Error("El proveedorId es obligatorio");

        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error("La compra debe tener al menos un producto");
        }

        productos.forEach((producto, index) => {
            const cantidad = Number(producto.cantidad);
            const precioCompra = Number(producto.precioCompra);
            const precioVenta = Number(producto.precioVenta);

            if (!producto.productoId) {
                throw new Error(`El productoId es obligatorio en el producto ${index + 1}`);
            }

            if (!Number.isFinite(cantidad) || cantidad <= 0) {
                throw new Error(`La cantidad debe ser mayor a 0 en el producto ${index + 1}`);
            }

            if (!Number.isFinite(precioCompra) || precioCompra <= 0) {
                throw new Error(`El precioCompra debe ser mayor a 0 en el producto ${index + 1}`);
            }

            if (!Number.isFinite(precioVenta) || precioVenta <= precioCompra) {
                throw new Error(`El precioVenta debe ser mayor al precioCompra en el producto ${index + 1}`);
            }
        });

        this.numeroFactura = String(numeroFactura).trim();
        this.proveedorId = proveedorId;
        this.productos = productos.map((producto) => ({
            productoId: producto.productoId,
            cantidad: Number(producto.cantidad),
            precioCompra: Number(producto.precioCompra),
            precioVenta: Number(producto.precioVenta),
            usarPrecioSugerido: producto.usarPrecioSugerido === true || producto.usarPrecioSugerido === "true",
        }));
        this.total = Number(total);
        this.estado = estado;
        this.impactApplied = impactApplied;
        this.fechaCompra = fechaCompra;
        this.fechaCreacion = fechaCreacion;
        this.anuladaEn = anuladaEn;
    }

    calculateTotal() {
        this.total = this.productos.reduce(
            (acc, producto) => acc + producto.cantidad * producto.precioCompra,
            0,
        );

        return this.total;
    }
}
