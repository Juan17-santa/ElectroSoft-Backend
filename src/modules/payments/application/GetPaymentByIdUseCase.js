/**
 * Caso de uso para obtener un pago por ID.
 *
 * Responsabilidades:
 * - Buscar un pago específico en el repositorio.
 * - Lanzar error de negocio si el pago no existe.
 */
export default class GetPaymentByIdUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute(id) {
        const payment = await this.paymentRepository.findById(id);

        if (!payment) {
            throw new Error("Pago no encontrado");
        }

        return payment;
    }
}
