/**
 * Caso de uso para obtener todos los pagos de una venta específica.
 *
 * Responsabilidades:
 * - Retornar el historial de abonos de una venta.
 * - Incluir el resumen: totalPagado y saldoPendiente actuales.
 */
export default class GetPaymentsByVentaUseCase {
    constructor(paymentRepository, saleGateway) {
        this.paymentRepository = paymentRepository;
        this.saleGateway = saleGateway;
    }

    async execute(ventaId) {
        // Verificar que la venta existe
        const venta = await this.saleGateway.findSaleById(ventaId);
        if (!venta) {
            throw new Error("La venta no existe");
        }

        const pagos = await this.paymentRepository.findByVentaId(ventaId);

        const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);
        const saldoPendiente = Number(venta.total) - totalPagado;

        return {
            venta: {
                _id: venta._id,
                numeroFactura: venta.numeroFactura,
                total: venta.total,
                estado: venta.estado,
            },
            totalPagado,
            saldoPendiente,
            estadoPago: saldoPendiente <= 0 ? "PAGADA" : "PENDIENTE",
            pagos,
        };
    }
}
