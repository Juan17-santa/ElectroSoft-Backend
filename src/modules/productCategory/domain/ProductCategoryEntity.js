/**
 * Entidad de categoría de productos.
 * 
 * Representa la lógica de negocio de una categoría.
 * Aquí se aplican las validaciones principales antes de crear o actualizar.
 * 
 * Validaciones:
 * - El nombre es obligatorio.
 * - El nombre debe ser un string.
 * - Debe tener mínimo 5 caracteres.
 * - Solo puede contener letras y espacios.
 */

export default class ProductCategoryEntity {
    constructor({ id, name, description, status }) {
        
        // VALIDACIÓN: NOMBRE
        if (!name) throw new Error("El nombre es obligatorio");

        if (typeof name !== "string") {throw new Error("El nombre debe ser un string")}

        if (name.length < 5) {throw new Error("El nombre debe tener mínimo 5 caracteres")}

        const regex = /^[a-zA-Z\s]+$/;
        if (!regex.test(name)) {throw new Error("El nombre solo puede contener letras");}

        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
    }
}