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
    constructor({ productId, name, categoryId, price, stock, typeStock, serial, warranty, characteristics, status }) {

        // VALIDACIÓN: NOMBRE
        if (!name) throw new Error("El nombre del producto es obligatorio");
        if (typeof name !== "string") throw new Error("El nombre debe ser un texto");
        if (name.trim().length < 3) throw new Error("El nombre debe tener mínimo 3 caracteres");
        if (name.trim().length > 100) throw new Error("El nombre no puede exceder 100 caracteres");

        // VALIDACIÓN: CATEGORÍA
        if (!categoryId) throw new Error("La categoría es obligatoria");

        // VALIDACIÓN: PRECIO
        const normalizedPrice = Number(price ?? 0);
        if (price === undefined || price === null || price === "") {
            this.price = 0;
        } else {
            if (typeof price !== "number" && typeof price !== "string") throw new Error("El precio debe ser un número");
            if (isNaN(normalizedPrice)) throw new Error("El precio debe ser un número");
            if (normalizedPrice < 0) throw new Error("El precio no puede ser negativo");
            this.price = Number(normalizedPrice.toFixed(2));
        }

        // VALIDACIÓN: STOCK
        const normalizedStock = Number(stock ?? 0);
        if (stock === undefined || stock === null || stock === "") {
            this.stock = 0;
        } else {
            if (typeof stock !== "number" && typeof stock !== "string") throw new Error("El stock debe ser un número");
            if (isNaN(normalizedStock)) throw new Error("El stock debe ser un número");
            if (normalizedStock < 0) throw new Error("El stock no puede ser negativo");
            if (!Number.isInteger(normalizedStock)) throw new Error("El stock debe ser un número entero");
            this.stock = normalizedStock;
        }

        // VALIDACIÓN: TIPO DE STOCK
        if (!typeStock) throw new Error("El tipo de stock es obligatorio");
        if (!["unidad", "metros"].includes(typeStock)) throw new Error("El tipo de stock debe ser 'unidad' o 'metros'");

        // VALIDACIÓN: SERIAL
        if (!serial) throw new Error("El serial es obligatorio");
        if (typeof serial !== "string") throw new Error("El serial debe ser un texto");
        if (serial.trim().length < 2) throw new Error("El serial debe tener mínimo 2 caracteres");
        if (serial.trim().length > 50) throw new Error("El serial no puede exceder 50 caracteres");

        // VALIDACIÓN: GARANTÍA
        if (!warranty) throw new Error("La garantía es obligatoria");
        const ValidGuarantees = ["3 meses", "6 meses", "9 meses", "12 meses"];
        if (!ValidGuarantees.includes(warranty)) throw new Error("La garantía debe ser: 3 meses, 6 meses, 9 meses o 12 meses");

        // VALIDACIÓN: CARACTERÍSTICAS (si se envían)
        if (characteristics && Array.isArray(characteristics)) {
            characteristics.forEach((caract, index) => {
                if (!caract.name || !caract.name.trim()) {
                    throw new Error(`La característica #${index + 1} debe tener un nombre`);
                }
            });
        }

        this.productId = productId;
        this.name = name.trim();
        this.categoryId = categoryId;
        this.typeStock = typeStock;
        this.serial = serial.trim();
        this.warranty = warranty;
        this.characteristics = (characteristics || []).map(c => ({
            name: c.name.trim(),
            unit: c.unit ? c.unit.trim() : "-",
            value: c.value ? (typeof c.value === "string" ? c.value.trim() : String(c.value)) : "",
            visible: c.visible !== undefined ? c.visible : true
        }));
        this.status = status !== undefined ? status : true;
    }
}
