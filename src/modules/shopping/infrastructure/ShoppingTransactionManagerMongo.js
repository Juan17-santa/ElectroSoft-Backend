/**
 * Transaction manager de MongoDB para el módulo Shopping.
 *
 * Responsabilidad:
 * - Encapsular la creación de sesiones de Mongoose.
 * - Evitar que los casos de uso importen mongoose directamente.
 *
 * Esto mantiene la capa application desacoplada de la tecnología de persistencia.
 */
import mongoose from "mongoose";

export default class ShoppingTransactionManagerMongo {
    async startSession() {
        return await mongoose.startSession();
    }
}
