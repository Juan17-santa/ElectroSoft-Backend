import "dotenv/config";
import http from "http";
import connectDB from "../config/database.js";
import app from "../app.js";
import { seedDocumentTypes } from "../shared/infrastructure/seeds/DocumentTypeSeed.js";
import { seedRoles } from "../modules/roles/infrastructure/RoleSeed.js";
import { initSocket } from "../config/socket.js";
import { seedAdminUser } from "../modules/users/infrastructure/UserSeed.js";
import { validateEnvironment } from "../config/environment.js";

const PORT = process.env.PORT || 4000;

validateEnvironment();

connectDB().then(async () => {

  await seedDocumentTypes(); // primero: roles depende de esto? no, pero es buena práctica
  await seedRoles();         // segundo: depende de que la colección exista
  await seedAdminUser();     // tercero: depende de que el rol exista

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});