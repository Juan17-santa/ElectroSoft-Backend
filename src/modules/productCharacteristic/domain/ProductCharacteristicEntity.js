/**
 * Entidad de Características de Producto
 * 
 * Representa las características predeterminadas/sugeridas que se pueden usar en productos.
 * 
 * Validaciones:
 * - El nombre es obligatorio (mínimo 2 caracteres, máximo 50).
 * - No puede contener números.
 * - Solo puede contener letras, espacios y guiones.
 */

export default class ProductCharacteristicEntity {
    constructor({ id, name, createdAt }) {
        // VALIDACIÓN: NOMBRE
        if (!name) throw new Error("El nombre de la característica es obligatorio");
        if (typeof name !== "string") throw new Error("El nombre debe ser un texto");
        
        const trimmedName = name.trim();
        
        if (trimmedName.length < 2) throw new Error("El nombre debe tener mínimo 2 caracteres");
        if (trimmedName.length > 50) throw new Error("El nombre no puede exceder 50 caracteres");
        if (/\d/.test(trimmedName)) throw new Error("No se permiten números en el nombre");
        if (!/^[a-zA-Z\s\-áéíóúÁÉÍÓÚñÑ]+$/.test(trimmedName)) throw new Error("Caracteres inválidos");

        this.id = id;
        this.name = trimmedName;
        this.createdAt = createdAt || new Date();
    }
}
