import "dotenv/config";
import connectDB from "../config/database.js";
import app from "../app.js";
import { seedDocumentTypes } from "../shared/infrastructure/seeds/DocumentTypeSeed.js";
import { seedRoles } from "../modules/roles/infrastructure/RoleSeed.js";

const PORT = process.env.PORT || 4000;

connectDB().then(async () => {

  await seedDocumentTypes(); // primero: roles depende de esto? no, pero es buena práctica
  await seedRoles();         // segundo: depende de que la colección exista

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});