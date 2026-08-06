import { DEVOLUTION_SPECIAL_STATES, DEVOLUTION_STATES } from "../domain/DevolutionEntity.js";
import {
    applyInventoryImpact,
    applyReembolsoRules,
    isFinalResolutionState,
    recalculateSaleReturnState,
    validateReturnQuantities,
} from "./DevolutionInventoryService.js";

const LOCKED_FIELDS = new Set(["saleId", "productos", "fechaCreacion", "_id", "id"]);
const PRODUCT_MUTABLE_FIELDS = [
    "cantidad",
    "motivo",
    "submotivo",
    "condicionProducto",
    "gestion",
    "responsable",
    "garantiaProveedor",
    "descripcion",
    "observaciones",
    "montoReembolso",
];

export default class UpdateDevolutionUseCase {
    constructor(devolutionRepository, transactionManager, productRepository, saleRepository) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    async execute(id, data) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const devolution = await this.devolutionRepository.findById(id, session);
            if (!devolution) throw new Error("Devolucion no encontrada");
            if (devolution.anulada) throw new Error("No se puede actualizar una devolucion anulada");
            if (isFinalResolutionState(devolution.estadoResolucion)) {
                throw new Error("No se puede actualizar una devolucion en estado final");
            }

            const updateData = {};
            Object.entries(data ?? {}).forEach(([key, value]) => {
                if (!LOCKED_FIELDS.has(key)) updateData[key] = value;
            });

            const productUpdates = PRODUCT_MUTABLE_FIELDS.reduce((acc, key) => {
                if (Object.prototype.hasOwnProperty.call(data ?? {}, key)) {
                    acc[key] = data[key];
                    delete updateData[key];
                }
                return acc;
            }, {});

            if (Object.keys(productUpdates).length > 0) {
                updateData.productos = devolution.productos.map((producto, index) =>
                    index === 0
                        ? { ...(producto.toObject?.() ?? producto), ...productUpdates }
                        : producto,
                );
            }

            const now = new Date();
            updateData.actualizadoEn = now;

            const targetProducts = updateData.productos || devolution.productos;
            const sale = await this.saleRepository.findById(devolution.saleId, session);
            if (!sale) throw new Error("Venta no encontrada");
            if (sale.estado === "ANULADA" || sale.estado === "Anulado") {
                throw new Error("No se puede actualizar una devolucion de una venta anulada");
            }

            await validateReturnQuantities({
                sale,
                devolutionRepository: this.devolutionRepository,
                saleId: devolution.saleId,
                productos: targetProducts,
                session,
                excludeDevolutionId: id,
            });

            updateData.productos = applyReembolsoRules(sale, targetProducts);

            if (
                updateData.estadoResolucion &&
                updateData.estadoResolucion !== devolution.estadoResolucion
            ) {
                if (
                    !DEVOLUTION_STATES.includes(updateData.estadoResolucion) &&
                    !DEVOLUTION_SPECIAL_STATES.includes(updateData.estadoResolucion)
                ) {
                    throw new Error("El estadoResolucion no es valido");
                }

                updateData.historialEstados = [
                    ...(devolution.historialEstados ?? []),
                    { estado: updateData.estadoResolucion, fecha: now },
                ];
            }

            const targetState = updateData.estadoResolucion ?? devolution.estadoResolucion;
            if (targetState === "RESUELTO" && !devolution.impactApplied) {
                await applyInventoryImpact(this.productRepository, updateData.productos, session);
                updateData.impactApplied = true;
                updateData.confirmadaEn = now;
            }

            const updatedDevolution = await this.devolutionRepository.update(id, updateData, session);
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
