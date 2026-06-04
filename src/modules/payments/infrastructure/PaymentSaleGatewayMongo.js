/**
 * Gateway de pagos hacia el módulo Sales.
 *
 * Responsabilidades:
 * - Consultar ventas desde el módulo de Sales sin acoplar
 *   directamente el caso de uso a la infraestructura de Sales.
 * - Permite que el caso de uso (application) no conozca Mongoose.
 *
 * Accede al modelo de Sales directamente para obtener la información
 * de la venta que se está pagando.
 */
import { saleModel } from "../../sales/infrastructure/SaleModel.js";

export default class PaymentSaleGatewayMongo {
    async findSaleById(ventaId) {
        return await saleModel
            .findById(ventaId)
            .populate("clienteId", "firstName lastName documentNumber");
    }
}
