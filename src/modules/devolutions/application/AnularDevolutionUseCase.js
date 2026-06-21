export default class AnularDevolutionUseCase {
    constructor(devolutionRepository, transactionManager, productRepository) {
        this.devolutionRepository = devolutionRepository;
        this.transactionManager = transactionManager;
        this.productRepository = productRepository;
    }

    async execute(id) {
        const session = await this.transactionManager.startSession();

        try {
            session.startTransaction();

            const devolution = await this.devolutionRepository.findById(id, session);
            if (!devolution) throw new Error("Devolucion no encontrada");
            if (devolution.anulada) throw new Error("La devolucion ya esta anulada");

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

            // Revertir lógica de stock si la devolución estaba en estado RESUELTO y el impacto fue aplicado
            if (devolution.estadoResolucion === "RESUELTO" && devolution.impactApplied) {
                for (const prod of devolution.productos) {
                    const condicion = prod.condicionProducto;
                    const gestion = prod.gestion;

                    if (gestion === "REEMBOLSO_TOTAL" || gestion === "REEMBOLSO_PARCIAL" || gestion === "OTRO_PRODUCTO") {
                        if (condicion === "BUEN_ESTADO") {
                            const updatedProduct = await this.productRepository.updateStock(prod.productoId, -prod.cantidad, session);
                            if (!updatedProduct) throw new Error(`Producto no encontrado: ${prod.productoId}`);
                        }
                    } else if (gestion === "MISMO_PRODUCTO") {
                        if (condicion === "MAL_ESTADO" || condicion === "NO_FUNCIONAL") {
                            const updatedProduct = await this.productRepository.updateStock(prod.productoId, prod.cantidad, session);
                            if (!updatedProduct) throw new Error(`Producto no encontrado: ${prod.productoId}`);
                        }
                    }
                }
            }

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
