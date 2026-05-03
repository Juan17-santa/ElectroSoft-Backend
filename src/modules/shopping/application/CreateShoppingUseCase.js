/**
 * Caso de uso para crear una compra.
 *
 * Responsabilidades:
 * - Iniciar una transacción de MongoDB.
 * - Crear la entidad ShoppingEntity para aplicar validaciones de dominio.
 * - Calcular el total desde los productos recibidos.
 * - Guardar la compra.
 * - Marcar impactApplied = true como impacto simulado.
 * - Confirmar o revertir la transacción según el resultado.
 *
 * Importante:
 * - No actualiza stock real.
 * - No consulta productos, proveedores ni otros módulos.
 * - El impacto queda preparado para conectarse en una etapa posterior.
 */
import ShoppingEntity from "../domain/ShoppingEntity.js";

export default class CreateShoppingUseCase {
    constructor(shoppingRepository, transactionManager) {
        this.shoppingRepository = shoppingRepository;
        this.transactionManager = transactionManager;
    }

    async execute(shoppingData) {
        // Inicia sesión para ejecutar el flujo completo de forma transaccional.
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            // Crea la entidad y ejecuta validaciones de negocio.
            const shopping = new ShoppingEntity({
                ...shoppingData,
                estado: "ACTIVA",
                impactApplied: false,
                fechaCreacion: new Date(),
            });
            shopping.calculateTotal();

            // Guarda la compra sin impactar inventario real.
            const createdShopping = await this.shoppingRepository.create(shopping, session);

            // Marca impacto simulado para dejar trazabilidad del flujo.
            const updatedShopping = await this.shoppingRepository.update(
                createdShopping._id,
                { impactApplied: true },
                session,
            );

            await session.commitTransaction();

            return updatedShopping;
        } catch (error) {
            // Cualquier error revierte la creación y el impacto simulado.
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
