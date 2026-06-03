/**
 * Entidad de Medidas de Producto
 * 
 * Representa las medidas predeterminadas/sugeridas que se pueden usar en características de productos.
 * 
 * Validaciones:
 * - El nombre es obligatorio (mínimo 1 carácter, máximo 20).
 * - Solo puede contener letras, números, espacios y símbolos comunes.
 */

export default class ProductMeasureEntity {
    constructor({ id, name, createdAt }) {
        // VALIDACIÓN: NOMBRE
        if (!name) throw new Error("El nombre de la medida es obligatorio");
        if (typeof name !== "string") throw new Error("El nombre debe ser un texto");
        
        const trimmedName = name.trim();
        
        if (trimmedName.length < 1) throw new Error("El nombre debe tener mínimo 1 carácter");
        if (trimmedName.length > 20) throw new Error("El nombre no puede exceder 20 caracteres");
        if (!/^[a-zA-Z0-9\s\-áéíóúÁÉÍÓÚñÑ%/()]*$/.test(trimmedName)) throw new Error("Caracteres inválidos");

        this.id = id;
        this.name = trimmedName;
        this.createdAt = createdAt || new Date();
    }
}
