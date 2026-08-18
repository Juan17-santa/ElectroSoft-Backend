/**
 * Migración: normaliza la fecha de factura de las compras existentes.
 *
 * Agrega el campo `purchaseDateIso` (Date) a los documentos de Shopping que no
 * lo tienen, parseando `purchaseDate` (formato DD/MM/YYYY o YYYY-MM-DD).
 * Es idempotente: los documentos que ya tienen `purchaseDateIso` se omiten.
 *
 * Uso:
 *   node scripts/migrate-shopping-purchase-date.js          # aplica cambios
 *   node scripts/migrate-shopping-purchase-date.js --dry-run # solo reporta
 */
import "dotenv/config";
import mongoose from "mongoose";
import { shoppingModel } from "../src/modules/shopping/infrastructure/ShoppingModel.js";

const DRY_RUN = process.argv.includes("--dry-run");

function parsePurchaseDateToIso(purchaseDate) {
    if (!purchaseDate || typeof purchaseDate !== "string") return null;

    let year;
    let month;
    let day;

    if (/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
        [year, month, day] = purchaseDate.split("-").map(Number);
    } else {
        const parts = purchaseDate.split("/");
        if (parts.length !== 3) return null;
        [day, month, year] = parts.map(Number);
    }

    const parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

    if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate;
}

async function migrate() {
    await mongoose.connect(process.env.MONGODB_URI);

    const pending = await shoppingModel
        .find({ purchaseDateIso: { $exists: false }, purchaseDate: { $ne: "" } })
        .lean();

    console.log(
        `Compras a migrar: ${pending.length}${DRY_RUN ? " (DRY-RUN, no se modifica nada)" : ""}`,
    );

    let migradas = 0;
    let omitidas = 0;

    for (const shopping of pending) {
        const parsed = parsePurchaseDateToIso(shopping.purchaseDate);

        if (!parsed) {
            omitidas += 1;
            console.log(`  Compra ${shopping.invoiceNumber} -> fecha invalida, omitida`);
            continue;
        }

        migradas += 1;
        console.log(
            `  Compra ${shopping.invoiceNumber} (${shopping.purchaseDate}) -> ${parsed.toISOString()}`,
        );

        if (!DRY_RUN) {
            await shoppingModel.updateOne(
                { _id: shopping._id },
                { $set: { purchaseDateIso: parsed } },
            );
        }
    }

    console.log(
        `Resumen: ${migradas} compras actualizadas, ${omitidas} omitidas por fecha invalida.`,
    );

    await mongoose.disconnect();
}

migrate().catch((error) => {
    console.error("Error en la migración:", error);
    process.exit(1);
});