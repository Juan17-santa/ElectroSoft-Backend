import DevolutionEntity from "../domain/DevolutionEntity.js";
import {
    applyInventoryImpact,
    recalculateSaleReturnState,
    validateReturnQuantities,
} from "./DevolutionInventoryService.js";

export default class CreateBatchDevolutionUseCase {
    constructor(devolutionRepository, transactionManager, productRepository, saleRepository) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    async execute(saleId, devolutionsData) {
        const session = await this.transactionManager.startSession();
        const now = new Date();

        try {
            session.startTransaction();

            const sale = await this.saleRepository.findById(saleId, session);
            if (!sale) throw new Error("Venta no encontrada");
            if (sale.estado === "ANULADA" || sale.estado === "Anulado") {
                throw new Error("No se puede registrar una devolucion sobre una venta anulada");
            }

            const devolutions = devolutionsData.map((data) => {
                const devolution = new DevolutionEntity({
                    ...data,
                    saleId,
                    estadoResolucion: data.estadoResolucion ?? "CREADA",
                    historialEstados: [
                        { estado: data.estadoResolucion ?? "CREADA", fecha: now },
                    ],
                    anulada: false,
                    anuladaEn: null,
                    impactApplied: false,
                    fechaCreacion: now,
                    actualizadoEn: now,
                });
                return devolution;
            });

            const allProductos = devolutions.flatMap((d) => d.productos);
            await validateReturnQuantities({
                sale,
                devolutionRepository: this.devolutionRepository,
                saleId,
                productos: allProductos,
                session,
            });

            const createdDevolutions = [];
            for (const devolution of devolutions) {
                if (devolution.estadoResolucion === "RESUELTO") {
                    await applyInventoryImpact(this.productRepository, devolution.productos, session);
                    devolution.impactApplied = true;
                    devolution.confirmadaEn = now;
                }
                const created = await this.devolutionRepository.create(devolution, session);
                createdDevolutions.push(created);
            }

            await recalculateSaleReturnState({
                saleRepository: this.saleRepository,
                devolutionRepository: this.devolutionRepository,
                saleId,
                session,
            });

            await session.commitTransaction();
            return createdDevolutions;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }
}