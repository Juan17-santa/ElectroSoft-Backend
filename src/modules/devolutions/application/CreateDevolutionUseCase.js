import DevolutionEntity from "../domain/DevolutionEntity.js";
import {
    applyInventoryImpact,
    applyReembolsoRules,
    recalculateSaleReturnState,
    validateReturnQuantities,
} from "./DevolutionInventoryService.js";

export default class CreateDevolutionUseCase {
    constructor(devolutionRepository, transactionManager, productRepository, saleRepository) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    async execute(devolutionData) {
        const session = await this.transactionManager.startSession();
        const now = new Date();

        try {
            session.startTransaction();

            const devolution = new DevolutionEntity({
                ...devolutionData,
                estadoResolucion: devolutionData.estadoResolucion ?? "CREADA",
                historialEstados: [
                    { estado: devolutionData.estadoResolucion ?? "CREADA", fecha: now },
                ],
                anulada: false,
                anuladaEn: null,
                impactApplied: false,
                fechaCreacion: now,
                actualizadoEn: now,
            });

            const sale = await this.saleRepository.findById(devolution.saleId, session);
            if (!sale) throw new Error("Venta no encontrada");
            if (sale.estado === "ANULADA" || sale.estado === "Anulado") {
                throw new Error("No se puede registrar una devolucion sobre una venta anulada");
            }

            await validateReturnQuantities({
                sale,
                devolutionRepository: this.devolutionRepository,
                saleId: devolution.saleId,
                productos: devolution.productos,
                session,
            });

            devolution.productos = applyReembolsoRules(sale, devolution.productos);

            if (devolution.estadoResolucion === "RESUELTO") {
                await applyInventoryImpact(this.productRepository, devolution.productos, session);
                devolution.impactApplied = true;
                devolution.confirmadaEn = now;
            }

            const createdDevolution = await this.devolutionRepository.create(devolution, session);
            await recalculateSaleReturnState({
                saleRepository: this.saleRepository,
                devolutionRepository: this.devolutionRepository,
                saleId: devolution.saleId,
                session,
            });

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
