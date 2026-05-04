/**
 * Caso de uso para crear una devolución.
 *
 * Responsabilidades:
 * - Iniciar una transacción de MongoDB.
 * - Crear la entidad DevolutionEntity para aplicar validaciones de dominio.
 * - Guardar la devolución en estado PENDIENTE.
 * - Marcar impactApplied = true como impacto simulado.
 * - Confirmar o revertir la transacción según el resultado.
 *
 * Importante:
 * - No depende del módulo de ventas.
 * - No actualiza inventario ni compras reales.
 * - El shoppingId se guarda como referencia simple para conectar lógica real después.
 */
import DevolutionEntity from "../domain/DevolutionEntity.js";

export default class CreateDevolutionUseCase {
    constructor(devolutionRepository, transactionManager) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
    }

    async execute(devolutionData) {
        // Inicia sesión para ejecutar el flujo completo de forma transaccional.
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            // Crea la entidad y ejecuta validaciones de negocio.
            const devolution = new DevolutionEntity({
                ...devolutionData,
                estado: "PENDIENTE",
                impactApplied: false,
                fechaCreacion: new Date(),
            });

            // Guarda la devolución sin impactar otros módulos.
            const createdDevolution = await this.devolutionRepository.create(devolution, session);

            // Marca impacto simulado para dejar trazabilidad del flujo.
            const updatedDevolution = await this.devolutionRepository.update(
                createdDevolution._id,
                { impactApplied: true },
                session,
            );

            await session.commitTransaction();

            return updatedDevolution;
        } catch (error) {
            // Cualquier error revierte la creación y el impacto simulado.
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
