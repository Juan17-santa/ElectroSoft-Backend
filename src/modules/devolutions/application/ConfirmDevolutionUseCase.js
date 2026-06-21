export default class ConfirmDevolutionUseCase {
    constructor(devolutionRepository, transactionManager) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
    }

    async execute(id) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const devolution = await this.devolutionRepository.findById(id, session);
            if (!devolution) throw new Error("Devolucion no encontrada");
            if (devolution.anulada) throw new Error("No se puede confirmar una devolucion anulada");
            if (devolution.estadoResolucion === "RESUELTO") {
                throw new Error("La devolucion ya esta resuelta");
            }

            const now = new Date();
            const updatedDevolution = await this.devolutionRepository.update(
                id,
                {
                    estadoResolucion: "RESUELTO",
                    confirmadaEn: now,
                    actualizadoEn: now,
                    historialEstados: [
                        ...(devolution.historialEstados ?? []),
                        { estado: "RESUELTO", fecha: now },
                    ],
                },
                session,
            );

            await session.commitTransaction();
            return updatedDevolution;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
