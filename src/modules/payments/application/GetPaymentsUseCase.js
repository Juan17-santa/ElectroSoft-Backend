/**
 * Caso de uso para obtener todos los pagos.
 *
 * Responsabilidades:
 * - Retornar todos los pagos registrados en el sistema.
 * - Ordenados por fechaPago descendente.
 */
export default class GetPaymentsUseCase {
    constructor(paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    async execute(options = {}) {
        return await this.paymentRepository.findAll(options);
    }
}