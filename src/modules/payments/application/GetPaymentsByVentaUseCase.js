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

        const pagoInicial = (venta.tipoVenta === 'Mixto') ? (Number(venta.montoContado) || 0) : 0;
        const totalAbonos = pagos
            .filter(p => p.estado !== "ANULADO")
            .reduce((acc, p) => acc + Number(p.monto), 0);
        const totalPagado = pagoInicial + totalAbonos;
        
        const baseDeuda = (venta.tipoVenta === 'Mixto') ? (Number(venta.montoCredito) || 0) : Number(venta.total);
        const saldoPendiente = Math.max(0, baseDeuda - totalAbonos);

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
