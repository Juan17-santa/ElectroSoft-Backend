/**
 * Entidad de producto.
 * 
 * Representa la lógica de negocio de un producto.
 * Aquí se aplican las validaciones principales antes de crear o actualizar.
 * 
 * Validaciones:
 * - El nombre es obligatorio (mínimo 3 caracteres, máximo 100).
 * - La categoría es obligatoria.
 * - El precio es obligatorio y debe ser mayor a 0.
 * - El stock es obligatorio y debe ser mayor o igual a 0.
 * - El tipo de stock debe ser "unidad" o "metros".
 * - El serial es obligatorio (mínimo 2 caracteres, máximo 50).
 * - La garantía es obligatoria y debe ser un valor válido.
 * - Las características (si existen) deben tener nombre.
 */

export default class ProductEntity {
    constructor({ id, nombre, categoriaId, precio, stock, tipoStock, serial, garantia, caracteristicas, estado }) {

        // VALIDACIÓN: NOMBRE
        if (!nombre) throw new Error("El nombre del producto es obligatorio");
        if (typeof nombre !== "string") throw new Error("El nombre debe ser un texto");
        if (nombre.trim().length < 3) throw new Error("El nombre debe tener mínimo 3 caracteres");
        if (nombre.trim().length > 100) throw new Error("El nombre no puede exceder 100 caracteres");

        // VALIDACIÓN: CATEGORÍA
        if (!categoriaId) throw new Error("La categoría es obligatoria");

        // VALIDACIÓN: PRECIO
        if (precio === undefined || precio === null || precio === "") throw new Error("El precio es obligatorio");
        if (typeof precio !== "number" || isNaN(precio)) throw new Error("El precio debe ser un número");
        if (precio <= 0) throw new Error("El precio debe ser mayor a 0");

        // VALIDACIÓN: STOCK
        if (stock === undefined || stock === null || stock === "") throw new Error("El stock es obligatorio");
        if (typeof stock !== "number" || isNaN(stock)) throw new Error("El stock debe ser un número");
        if (stock < 0) throw new Error("El stock no puede ser negativo");
        if (!Number.isInteger(stock)) throw new Error("El stock debe ser un número entero");

        // VALIDACIÓN: TIPO DE STOCK
        if (!tipoStock) throw new Error("El tipo de stock es obligatorio");
        if (!["unidad", "metros"].includes(tipoStock)) throw new Error("El tipo de stock debe ser 'unidad' o 'metros'");

        // VALIDACIÓN: SERIAL
        if (!serial) throw new Error("El serial es obligatorio");
        if (typeof serial !== "string") throw new Error("El serial debe ser un texto");
        if (serial.trim().length < 2) throw new Error("El serial debe tener mínimo 2 caracteres");
        if (serial.trim().length > 50) throw new Error("El serial no puede exceder 50 caracteres");

        // VALIDACIÓN: GARANTÍA
        if (!garantia) throw new Error("La garantía es obligatoria");
        const garantiasValidas = ["3 meses", "6 meses", "9 meses", "12 meses"];
        if (!garantiasValidas.includes(garantia)) throw new Error("La garantía debe ser: 3 meses, 6 meses, 9 meses o 12 meses");

        // VALIDACIÓN: CARACTERÍSTICAS (si se envían)
        if (caracteristicas && Array.isArray(caracteristicas)) {
            caracteristicas.forEach((caract, index) => {
                if (!caract.nombre || !caract.nombre.trim()) {
                    throw new Error(`La característica #${index + 1} debe tener un nombre`);
                }
            });
        }

        this.id = id;
        this.nombre = nombre.trim();
        this.categoriaId = categoriaId;
        this.precio = precio;
        this.stock = stock;
        this.tipoStock = tipoStock;
        this.serial = serial.trim();
        this.garantia = garantia;
        this.caracteristicas = (caracteristicas || []).map(c => ({
            nombre: c.nombre.trim(),
            medida: c.medida ? c.medida.trim() : "-",
            valor: c.valor ? (typeof c.valor === "string" ? c.valor.trim() : String(c.valor)) : "",
            visible: c.visible !== undefined ? c.visible : true
        }));
        this.estado = estado !== undefined ? estado : true;
    }
}