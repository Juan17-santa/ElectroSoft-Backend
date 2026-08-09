import {
    applyInventoryImpact,
    isFinalResolutionState,
    recalculateSaleReturnState,
} from "./DevolutionInventoryService.js";

export default class AnularDevolutionUseCase {
    constructor(devolutionRepository, transactionManager, productRepository, saleRepository) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    async execute(id) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const devolution = await this.devolutionRepository.findById(id, session);
            if (!devolution) throw new Error("Devolucion no encontrada");
            if (devolution.anulada) throw new Error("La devolucion ya esta anulada");
            if (isFinalResolutionState(devolution.estadoResolucion)) {
                throw new Error(
                    "No se puede anular una devolucion en estado final (RESUELTO o RECHAZADA)",
                );
            }

            const now = new Date();
            const updatedDevolution = await this.devolutionRepository.update(
                id,
                {
                    anulada: true,
                    anuladaEn: now,
                    estadoResolucion: "Anulada",
                    actualizadoEn: now,
                    impactApplied: false,
                    historialEstados: [
                        ...(devolution.historialEstados ?? []),
                        { estado: "Anulada", fecha: now },
                    ],
                },
                session,
            );

            if (devolution.impactApplied) {
                await applyInventoryImpact(this.productRepository, devolution.productos, session, -1);
            }

            await recalculateSaleReturnState({
                saleRepository: this.saleRepository,
                devolutionRepository: this.devolutionRepository,
                saleId: devolution.saleId,
                session,
            });

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
