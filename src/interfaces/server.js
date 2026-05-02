import "dotenv/config";
import connectDB from "../config/database.js";
import app from "../app.js";
import { seedDocumentTypes } from "../shared/infrastructure/seeds/DocumentTypeSeed.js";

const PORT = process.env.PORT || 4000;

connectDB().then(async () => {

  // Asegura que los tipos de documento estén disponibles antes de iniciar el servidor
  await seedDocumentTypes();

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});