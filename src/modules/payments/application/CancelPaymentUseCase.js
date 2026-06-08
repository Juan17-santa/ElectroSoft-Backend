/**
 * Caso de uso para anular un pago (abono).
 *
 * Responsabilidades:
 * - Verificar que el pago exista y no esté ya anulado.
 * - Cambiar el estado del pago a "ANULADO".
 * - No recalcula saldos: eso lo hace el frontend al leer los pagos activos.
 */
export default class CancelPaymentUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute(paymentId) {
        const payment = await this.paymentRepository.findById(paymentId);
        if (!payment) {
            throw new Error("El pago no existe");
        }

        if (payment.estado === "ANULADO") {
            throw new Error("Este pago ya fue anulado");
        }

        return await this.paymentRepository.cancel(paymentId);
    }
}
