/**
 * Entidad de compra.
 *
 * Representa la lógica de negocio mínima del módulo Shopping.
 * Esta entidad es autocontenida: no consulta productos, proveedores ni inventario.
 *
 * Validaciones:
 * - El proveedorId es obligatorio.
 * - La compra debe tener al menos un producto.
 * - Cada producto debe tener productoId.
 * - La cantidad de cada producto debe ser mayor a 0.
 * - El precioCompra de cada producto debe ser mayor a 0.
 *
 * Nota:
 * - El impacto en inventario se simula con impactApplied.
 * - La conexión futura con otros módulos debe hacerse desde nuevos casos de uso,
 *   sin contaminar esta entidad con dependencias externas.
 */
export default class ShoppingEntity {
    constructor({
        proveedorId,
        productos,
        total = 0,
        estado = "ACTIVA",
        impactApplied = false,
        fechaCompra,
        fechaCreacion = new Date(),
        anuladaEn = null,
    }) {
        // VALIDACIÓN: PROVEEDOR
        if (!proveedorId) throw new Error("El proveedorId es obligatorio");

        // VALIDACIÓN: PRODUCTOS
        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error("La compra debe tener al menos un producto");
        }

        productos.forEach((producto, index) => {
            // VALIDACIÓN: PRODUCTO
            if (!producto.productoId) {
                throw new Error(`El productoId es obligatorio en el producto ${index + 1}`);
            }

            // VALIDACIÓN: CANTIDAD
            if (Number(producto.cantidad) <= 0) {
                throw new Error(`La cantidad debe ser mayor a 0 en el producto ${index + 1}`);
            }

            // VALIDACIÓN: PRECIO DE COMPRA
            if (Number(producto.precioCompra) <= 0) {
                throw new Error(`El precioCompra debe ser mayor a 0 en el producto ${index + 1}`);
            }
        });

        this.proveedorId = proveedorId;
        this.productos = productos.map((producto) => ({
            productoId: producto.productoId,
            cantidad: Number(producto.cantidad),
            precioCompra: Number(producto.precioCompra),
        }));
        this.total = Number(total);
        this.estado = estado;
        this.impactApplied = impactApplied;
        this.fechaCompra = fechaCompra;
        this.fechaCreacion = fechaCreacion;
        this.anuladaEn = anuladaEn;
    }

    /**
     * Calcula el total de la compra a partir de sus productos.
     *
     * El backend no confía en totales enviados por cliente.
     * Esta base solo usa cantidad * precioCompra.
     */
    calculateTotal() {
        this.total = this.productos.reduce(
            (acc, producto) => acc + producto.cantidad * producto.precioCompra,
            0,
        );

        return this.total;
    }
}
