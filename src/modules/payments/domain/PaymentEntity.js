/**
 * Entidad de dominio para Pagos / Abonos.
 *
 * Representa la lógica de negocio de un pago sobre una venta.
 * Sin dependencias de librerías externas.
 *
 * Validaciones:
 * - El ventaId es obligatorio.
 * - El monto es obligatorio y debe ser mayor a 0.
 * - El monto no puede superar el saldo pendiente de la venta.
 * - El método de pago debe ser uno de los valores permitidos.
 * - No se puede abonar a una venta ya PAGADA.
 */
export default class PaymentEntity {
    static METODOS_PAGO_VALIDOS = ["EFECTIVO", "TRANSFERENCIA", "TARJETA"];

    constructor({
        ventaId,
        monto,
        metodoPago,
        totalPagado,
        saldoPendiente,
        estado,
        fechaPago = new Date(),
        notas = "",
    }) {
        // VALIDACIÓN: VENTA
        if (!ventaId) {
            throw new Error("El ventaId es obligatorio");
        }

        // VALIDACIÓN: MONTO
        if (monto === undefined || monto === null || monto === "") {
            throw new Error("El monto es obligatorio");
        }

        const montoNum = Number(monto);

        if (!Number.isFinite(montoNum) || montoNum <= 0) {
            throw new Error("El monto debe ser mayor a 0");
        }

        // VALIDACIÓN: MÉTODO DE PAGO
        if (!metodoPago) {
            throw new Error("El método de pago es obligatorio");
        }

        if (!PaymentEntity.METODOS_PAGO_VALIDOS.includes(metodoPago)) {
            throw new Error(
                `El método de pago debe ser uno de: ${PaymentEntity.METODOS_PAGO_VALIDOS.join(", ")}`
            );
        }

        // ASIGNACIÓN
        this.ventaId = ventaId;
        this.monto = montoNum;
        this.metodoPago = metodoPago;
        this.totalPagado = Number(totalPagado) || 0;
        this.saldoPendiente = Number(saldoPendiente) || 0;
        this.estado = estado || "PENDIENTE";
        this.fechaPago = fechaPago;
        this.notas = notas ? String(notas).trim() : "";
    }
}