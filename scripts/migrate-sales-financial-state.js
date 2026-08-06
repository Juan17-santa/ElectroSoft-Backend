/**
 * Migración: normaliza el estado financiero de las ventas existentes.
 *
 * Recalcula para cada venta NO anulada:
 * - montoPorPagar: saldo real (total - pago base - pagos no anulados
 *   - reembolsos de devoluciones RESUELTAS activas).
 * - estado: derivado de la tanda de devoluciones contable y del saldo:
 *   "Devuelto" / "Devolución Parcial" con tanda activa; "Vigente" (saldo > 0)
 *   o "Finalizado" (saldo = 0) sin ella. Las ventas "ACTIVA" pasan a
 *   Vigente/Finalizado (el estado ACTIVA quedó en desuso).
 *
 * Uso:
 *   node scripts/migrate-sales-financial-state.js          # aplica cambios
 *   node scripts/migrate-sales-financial-state.js --dry-run # solo reporta
 */
import "dotenv/config";
import mongoose from "mongoose";
import { saleModel } from "../src/modules/sales/infrastructure/SaleModel.js";
import {
    computeSaleEstado,
    getSaleSaldo,
} from "../src/modules/sales/infrastructure/SaleFinancialStateService.js";

const DRY_RUN = process.argv.includes("--dry-run");

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);

    const sales = await saleModel
        .find({ estado: { $nin: ["ANULADA", "Anulado"] } })
        .lean();

    console.log(`Ventas a revisar: ${sales.length}${DRY_RUN ? " (DRY-RUN, no se modifica nada)" : ""}`);

    let cambiadas = 0;
    let activasConvertidas = 0;

    for (const sale of sales) {
        const [saldo, estado] = await Promise.all([
            getSaleSaldo(sale),
            computeSaleEstado(sale),
        ]);

        const estadoActual = sale.estado;
        const cambios = {};
        if (estado !== estadoActual) cambios.estado = estado;
        if (Number(sale.montoPorPagar ?? 0) !== saldo) cambios.montoPorPagar = saldo;

        if (estadoActual === "ACTIVA" && !("estado" in cambios)) {
            cambios.estado = estado;
        }

        if (Object.keys(cambios).length === 0) continue;

        cambiadas += 1;
        if (estadoActual === "ACTIVA") activasConvertidas += 1;

        console.log(
            `  Venta ${String(sale.numeroFactura).padStart(2, "0")} ` +
            `(${estadoActual} -> ${cambios.estado ?? estadoActual}, ` +
            `montoPorPagar ${sale.montoPorPagar ?? 0} -> ${saldo})`,
        );

        if (!DRY_RUN) {
            await saleModel.updateOne(
                { _id: sale._id },
                { $set: cambios },
            );
        }
    }

    console.log(`Resumen: ${cambiadas} ventas actualizadas, ${activasConvertidas} con estado ACTIVA migrado.`);

    await mongoose.disconnect();
}

migrate().catch((error) => {
    console.error("Error en la migración:", error);
    process.exit(1);
});
