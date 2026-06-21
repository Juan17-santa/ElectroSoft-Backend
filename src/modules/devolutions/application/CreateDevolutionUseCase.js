import DevolutionEntity from "../domain/DevolutionEntity.js";

export default class CreateDevolutionUseCase {
    constructor(devolutionRepository, transactionManager) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
    }

    async execute(devolutionData) {
        const session = await this.transactionManager.startSession();
        const now = new Date();

        try {
            session.startTransaction();

            const devolution = new DevolutionEntity({
                ...devolutionData,
                estadoResolucion: devolutionData.estadoResolucion ?? "CREADA",
                historialEstados: [{ estado: "CREADA", fecha: now }],
                anulada: false,
                anuladaEn: null,
                impactApplied: false,
                fechaCreacion: now,
                actualizadoEn: now,
            });

            const createdDevolution = await this.devolutionRepository.create(devolution, session);

            await session.commitTransaction();
            return createdDevolution;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}
