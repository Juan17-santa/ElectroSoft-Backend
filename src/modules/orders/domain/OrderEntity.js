/**
 * Entidad de pedido.
 * 
 * Representa la lógica de negocio de un pedido.
 * Aquí se aplican las validaciones principales antes de crear.
 * 
 * Validaciones:
 * - El documento es obligatorio, solo puede contener números y debe tener entre 8 y 12 dígitos.
 * - El cliente es obligatorio y debe ser un objeto válido.
 * - La forma de pago es obligatoria y debe ser "Contado" o "Credito".
 * - Debe haber al menos un producto en el pedido, cada producto debe tener una cantidad válida.
 */

export default class OrderEntity {
    constructor({ id, documentNumber, client, orderDate, dueDate, products, paymentMethod, requestedCredit = 0, subtotal, iva, total, status }) {

        // VALIDACIÓN: NÚMERO DE DOCUMENTO
        if (!documentNumber) {
            throw new Error("El número de documento es obligatorio");
        }

        const onlyNumbers = /^[0-9]+$/;
        if (!onlyNumbers.test(documentNumber)) {
            throw new Error("El documento solo puede contener números");
        }

        if (documentNumber.length < 8 || documentNumber.length > 12) {
            throw new Error("El documento debe tener entre 8 y 12 dígitos");
        }

        // VALIDACION: CLIENTE
        if (!client) {
            throw new Error("Cliente no encontrado");
        }

        // VALIDACIÓN: FORMA DE PAGO
        if (!paymentMethod) {
            throw new Error("La forma de pago es obligatoria");
        }

        const validPaymentMethods = ["Contado", "Credito", "Mixto"];

        if (!validPaymentMethods.includes(paymentMethod)) {
            throw new Error("Forma de pago inválida");
        }

        // VALIDACIÓN: PRODUCTOS
        if (!products || !Array.isArray(products) || products.length === 0) {
            throw new Error("Debe agregar al menos un producto");
        }

        // VALIDACIÓN: ESTADO
        const validStatus = ["Pendiente", "Anulado"];

        if (status && !validStatus.includes(status)) {
            throw new Error("Estado inválido");
        }

        products.forEach((product, index) => {
            if (!product.product) {
                throw new Error(`El producto #${index + 1} es inválido`);
            }

            if (!product.name || typeof product.name !== "string") {
                throw new Error(`Nombre inválido en el producto #${index + 1}`);
            }

            if (typeof product.price !== "number" || product.price < 0) {
                throw new Error(`Precio inválido en el producto #${index + 1}`);
            }

            if (!product.quantity || product.quantity < 1) {
                throw new Error(`Cantidad inválida en el producto #${index + 1}`);
            }

            if (typeof product.lineTotal !== "number" || product.lineTotal < 0) {
                throw new Error(`Total inválido en el producto #${index + 1}`);
            }
        });

        if (typeof subtotal !== "number" || subtotal < 0) {
            throw new Error("Subtotal inválido");
        }

        if (typeof iva !== "number" || iva < 0) {
            throw new Error("IVA inválido");
        }

        if (typeof total !== "number" || total < 0) {
            throw new Error("Total inválido");
        }

        // VALIDACIÓN: CRÉDITO SOLICITADO
        const requestedCreditValue = Number(requestedCredit || 0);

        if (!Number.isFinite(requestedCreditValue) || requestedCreditValue < 0) {
            throw new Error("El crédito solicitado es inválido.");
        }

        if (requestedCreditValue > total) {
            throw new Error("El crédito solicitado no puede superar el total del pedido.");
        }

        this.id = id;
        this.documentNumber = documentNumber;
        this.client = client;
        this.orderDate = orderDate || new Date();
        this.dueDate = dueDate;
        this.products = products;
        this.paymentMethod = paymentMethod;
        this.requestedCredit = requestedCreditValue;
        this.subtotal = subtotal;
        this.iva = iva;
        this.total = total;
        this.status = status || "Pendiente";
    }
}