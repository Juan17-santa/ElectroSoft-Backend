import {
    applyInventoryImpact,
    isFinalResolutionState,
    recalculateSaleReturnState,
    validateReturnQuantities,
} from "./DevolutionInventoryService.js";

export default class ConfirmDevolutionUseCase {
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
            if (devolution.anulada) throw new Error("No se puede confirmar una devolucion anulada");
            if (isFinalResolutionState(devolution.estadoResolucion)) {
                throw new Error("La devolucion ya esta en un estado final");
            }

            const sale = await this.saleRepository.findById(devolution.saleId, session);
            if (!sale) throw new Error("Venta no encontrada");
            if (sale.estado === "ANULADA" || sale.estado === "Anulado") {
                throw new Error("No se puede confirmar una devolucion de una venta anulada");
            }

            await validateReturnQuantities({
                sale,
                devolutionRepository: this.devolutionRepository,
                saleId: devolution.saleId,
                productos: devolution.productos,
                session,
                excludeDevolutionId: id,
            });

            const now = new Date();
            const updateData = {
                estadoResolucion: "RESUELTO",
                confirmadaEn: now,
                actualizadoEn: now,
                historialEstados: [
                    ...(devolution.historialEstados ?? []),
                    { estado: "RESUELTO", fecha: now },
                ],
            };

            const shouldApplyImpact = !devolution.impactApplied;

            if (shouldApplyImpact) {
                await applyInventoryImpact(this.productRepository, devolution.productos, session);
                updateData.impactApplied = true;
            }

            // Actualización condicional: si aplica impacto de inventario, se exige
            // impactApplied: false para que dos confirmaciones concurrentes no
            // dupliquen el stock.
            const updatedDevolution = await this.devolutionRepository.update(
                id,
                updateData,
                session,
                shouldApplyImpact ? { impactApplied: false } : {},
            );

            if (!updatedDevolution) {
                throw new Error("La devolucion ya fue confirmada por otra solicitud");
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
