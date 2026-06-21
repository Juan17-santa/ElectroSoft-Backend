import { DEVOLUTION_SPECIAL_STATES, DEVOLUTION_STATES } from "../domain/DevolutionEntity.js";

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
];

export default class UpdateDevolutionUseCase {
    constructor(devolutionRepository, transactionManager, productRepository) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
        this.productRepository = productRepository;
    }

    async execute(id, data) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const devolution = await this.devolutionRepository.findById(id, session);
            if (!devolution) throw new Error("Devolucion no encontrada");
            if (devolution.anulada) throw new Error("No se puede actualizar una devolucion anulada");

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

            // Aplicar logica de stock si cambia a RESUELTO y no se ha aplicado antes.
            // El estado previo valida el flag para cubrir devoluciones antiguas creadas
            // con impactApplied=true sin haber impactado inventario.
            const stockImpactAlreadyApplied =
                devolution.estadoResolucion === "RESUELTO" && devolution.impactApplied;

            if (updateData.estadoResolucion === "RESUELTO" && !stockImpactAlreadyApplied) {
                const productosAProcesar = updateData.productos || devolution.productos;
                for (const prod of productosAProcesar) {
                    const condicion = prod.condicionProducto;
                    const gestion = prod.gestion;

                    if (gestion === "REEMBOLSO_TOTAL" || gestion === "REEMBOLSO_PARCIAL" || gestion === "OTRO_PRODUCTO") {
                        if (condicion === "BUEN_ESTADO") {
                            const updatedProduct = await this.productRepository.updateStock(prod.productoId, prod.cantidad, session);
                            if (!updatedProduct) throw new Error(`Producto no encontrado: ${prod.productoId}`);
                        }
                    } else if (gestion === "MISMO_PRODUCTO") {
                        if (condicion === "MAL_ESTADO" || condicion === "NO_FUNCIONAL") {
                            const updatedProduct = await this.productRepository.updateStock(prod.productoId, -prod.cantidad, session);
                            if (!updatedProduct) throw new Error(`Producto no encontrado: ${prod.productoId}`);
                        }
                    }
                }
                updateData.impactApplied = true;
            }

            const updatedDevolution = await this.devolutionRepository.update(id, updateData, session);

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
