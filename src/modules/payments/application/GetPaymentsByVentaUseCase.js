/**
 * Caso de uso para obtener todos los pagos de una venta específica.
 *
 * Responsabilidades:
 * - Retornar el historial de abonos de una venta.
 * - Incluir el resumen: totalPagado y saldoPendiente actuales.
 * - El saldoPendiente se calcula con el calculador canónico de ventas
 *   (incluye reembolsos de devoluciones RESUELTAS).
 */
import { getSaleSaldo } from "../../sales/infrastructure/SaleFinancialStateService.js";

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

        const saldoPendiente = await getSaleSaldo(venta);

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
