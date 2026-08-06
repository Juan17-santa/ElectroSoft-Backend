/**
 * Caso de uso para anular un pago (abono).
 *
 * Responsabilidades:
 * - Verificar que el pago exista y no esté ya anulado.
 * - Cambiar el estado del pago a "ANULADO".
 * - Recalcular el saldo y el estado de la venta con el calculador canónico.
 */
import {
    computeSaleEstado,
    getSaleSaldo,
} from "../../sales/infrastructure/SaleFinancialStateService.js";

export default class CancelPaymentUseCase {
    constructor(paymentRepository, saleGateway = null) {
        this.paymentRepository = paymentRepository;
        this.saleGateway = saleGateway;
    }

    async execute(paymentId) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw new Error("El pago no existe");
        }

        if (payment.estado === "ANULADO") {
            throw new Error("Este pago ya fue anulado");
        }

        const cancelled = await this.paymentRepository.cancel(paymentId);

        // Recalcular saldo y estado de la venta asociada
        const ventaId = payment.ventaId?._id ?? payment.ventaId;
        if (this.saleGateway && ventaId) {
            const venta = await this.saleGateway.findSaleById(ventaId);
            if (venta && venta.estado !== "ANULADA" && venta.estado !== "Anulado") {
                const [nuevoSaldo, nuevoEstadoVenta] = await Promise.all([
                    getSaleSaldo(venta),
                    computeSaleEstado(venta),
                ]);

                const saleUpdate = { montoPorPagar: nuevoSaldo };
                if (nuevoEstadoVenta !== venta.estado) {
                    saleUpdate.estado = nuevoEstadoVenta;
                }
                await this.saleGateway.updateSale(ventaId, saleUpdate);
            }
        }

        return cancelled;
    }
}
