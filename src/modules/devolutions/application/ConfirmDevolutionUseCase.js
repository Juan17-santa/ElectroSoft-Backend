/**
 * Caso de uso para confirmar una devolución.
 *
 * Responsabilidades:
 * - Iniciar una transacción de MongoDB.
 * - Buscar la devolución.
 * - Validar que exista.
 * - Validar que esté en estado PENDIENTE.
 * - Actualizar estado a CONFIRMADA.
 * - Registrar confirmadaEn.
 *
 * Importante:
 * - No depende del módulo de ventas.
 * - No actualiza compras ni inventario real.
 */
export default class ConfirmDevolutionUseCase {
    constructor(devolutionRepository, transactionManager) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
    }

    async execute(id) {
        // Inicia sesión para garantizar que lectura y actualización sean atómicas.
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            // La lectura participa en la misma sesión transaccional.
            const devolution = await this.devolutionRepository.findById(id, session);

            if (!devolution) {
                throw new Error("Devolucion no encontrada");
            }

            if (devolution.estado !== "PENDIENTE") {
                throw new Error("Solo se pueden confirmar devoluciones pendientes");
            }

            // Solo cambia el estado interno de la devolución.
            const updatedDevolution = await this.devolutionRepository.update(
                id,
                {
                    estado: "CONFIRMADA",
                    confirmadaEn: new Date(),
                },
                session,
            );

            await session.commitTransaction();

            return updatedDevolution;
        } catch (error) {
            // Si falla la validación o la actualización, se revierte la transacción.
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
