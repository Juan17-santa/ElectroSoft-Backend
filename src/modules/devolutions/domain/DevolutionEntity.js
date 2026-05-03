/**
 * Entidad de devolución.
 *
 * Representa la lógica de negocio mínima del módulo Devolutions.
 * Esta entidad es autocontenida: no consulta compras, ventas ni productos.
 *
 * Validaciones:
 * - El shoppingId es obligatorio.
 * - La devolución debe tener al menos un producto.
 * - Cada producto debe tener productoId.
 * - La cantidad de cada producto debe ser mayor a 0.
 * - Cada producto debe tener motivo.
 *
 * Nota:
 * - El impacto se simula con impactApplied.
 * - La confirmación de devolución no depende del módulo de ventas.
 */
export default class DevolutionEntity {
    constructor({
        shoppingId,
        productos,
        estado = "PENDIENTE",
        impactApplied = false,
        fechaCreacion = new Date(),
        confirmadaEn = null,
    }) {
        // VALIDACIÓN: COMPRA RELACIONADA
        if (!shoppingId) throw new Error("El shoppingId es obligatorio");

        // VALIDACIÓN: PRODUCTOS DEVUELTOS
        if (!Array.isArray(productos) || productos.length === 0) {
            throw new Error("La devolucion debe tener al menos un producto");
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

            // VALIDACIÓN: MOTIVO
            if (!producto.motivo) {
                throw new Error(`El motivo es obligatorio en el producto ${index + 1}`);
            }
        });

        this.shoppingId = shoppingId;
        this.productos = productos.map((producto) => ({
            productoId: producto.productoId,
            cantidad: Number(producto.cantidad),
            motivo: producto.motivo,
        }));
        this.estado = estado;
        this.impactApplied = impactApplied;
        this.fechaCreacion = fechaCreacion;
        this.confirmadaEn = confirmadaEn;
    }
}
