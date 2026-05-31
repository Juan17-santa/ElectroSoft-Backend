/**
 * Caso de uso para registrar un pago o abono a una venta.
 *
 * Responsabilidades:
 * - Validar que la venta exista y esté en estado ACTIVA.
 * - Calcular el totalPagado sumando todos los abonos previos.
 * - Validar que el monto no supere el saldo pendiente.
 * - Calcular el saldoPendiente y determinar el estado del pago.
 * - Crear la entidad PaymentEntity con validaciones de dominio.
 * - Guardar el pago en el repositorio.
 *
 * Flujo de cálculo:
 *   totalPagadoAnterior = suma de todos los pagos previos para esta venta
 *   nuevoTotalPagado    = totalPagadoAnterior + monto
 *   nuevoSaldo          = totalVenta - nuevoTotalPagado
 *   estado              = nuevoSaldo === 0 ? 'PAGADA' : 'PENDIENTE'
 */
import mongoose from "mongoose";
import PaymentEntity from "../domain/PaymentEntity.js";

function isValidObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    return new mongoose.Types.ObjectId(id).toString() === String(id);
}

export default class CreatePaymentUseCase {
    constructor(paymentRepository, saleGateway) {
        this.paymentRepository = paymentRepository;
        this.saleGateway = saleGateway;
    }

    async execute(paymentData) {
        const { ventaId, monto, metodoPago, notas } = paymentData;

        // Validar que el ventaId sea un ObjectId válido
        if (!isValidObjectId(ventaId)) {
            throw new Error("El ventaId no es un ObjectId válido");
        }

        // Buscar la venta en el módulo de Sales
        const venta = await this.saleGateway.findSaleById(ventaId);
        if (!venta) {
            throw new Error("La venta asociada al pago no existe");
        }

        if (venta.estado !== "ACTIVA") {
            throw new Error("Solo se pueden registrar pagos en ventas activas");
        }

        // Calcular el total ya pagado (suma de todos los pagos anteriores)
        const pagosAnteriores = await this.paymentRepository.findByVentaId(ventaId);
        const totalPagadoAnterior = pagosAnteriores.reduce(
            (acc, p) => acc + Number(p.monto),
            0
        );

        const totalVenta = Number(venta.total);
        const saldoActual = totalVenta - totalPagadoAnterior;

        // Validar que ya no esté pagada
        if (saldoActual <= 0) {
            throw new Error("Esta venta ya ha sido pagada en su totalidad");
        }

        const montoNum = Number(monto);

        // Validar que el monto no supere el saldo
        if (montoNum > saldoActual) {
            throw new Error(
                `El monto (${montoNum}) supera el saldo pendiente de la venta (${saldoActual})`
            );
        }

        // Calcular nuevos valores
        const nuevoTotalPagado = totalPagadoAnterior + montoNum;
        const nuevoSaldoPendiente = totalVenta - nuevoTotalPagado;
        const nuevoEstado = nuevoSaldoPendiente === 0 ? "PAGADA" : "PENDIENTE";

        // Crear entidad con validaciones de dominio
        const payment = new PaymentEntity({
            ventaId,
            monto: montoNum,
            metodoPago,
            totalPagado: nuevoTotalPagado,
            saldoPendiente: nuevoSaldoPendiente,
            estado: nuevoEstado,
            fechaPago: new Date(),
            notas: notas || "",
        });

        return await this.paymentRepository.create(payment);
    }
}
