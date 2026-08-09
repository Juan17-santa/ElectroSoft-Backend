/**
 * Backup lógico de MongoDB (Atlas).
 *
 * Vuelca todas las colecciones de la base conectada a archivos JSON dentro de
 * backups/backup-<fecha>. Alternativa ligera a mongodump (no requiere instalar
 * MongoDB Database Tools).
 *
 * Uso:
 *   node scripts/backup-database.js              # genera backups/backup-<timestamp>/
 *   node scripts/backup-database.js <carpeta>    # vuelca a una carpeta concreta
 */
import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function backup() {
    const outDir = process.argv[2]
        || path.resolve(process.cwd(), "..", "..", "backups", `backup-${timestamp()}`);

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const dbName = db.databaseName;

    const collections = await db.listCollections().toArray();
    fs.mkdirSync(outDir, { recursive: true });

    const manifest = [];
    for (const c of collections) {
        const name = c.name;
        const docs = await db.collection(name).find({}).toArray();
        fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(docs, null, 2));
        manifest.push({ collection: name, documents: docs.length });
        console.log(`${name}: ${docs.length} documentos`);
    }

    fs.writeFileSync(
        path.join(outDir, "manifest.json"),
        JSON.stringify({ dbName, fecha: new Date().toISOString(), collections: manifest }, null, 2),
    );

    await mongoose.disconnect();
    console.log(`\nBackup OK -> ${outDir} (db: ${dbName})`);
}

backup().catch((error) => {
    console.error("Error en el backup:", error);
    process.exit(1);
});
