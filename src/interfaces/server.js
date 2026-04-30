import "dotenv/config";
import connectDB from "../config/database.js";
import app from "../app.js";

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
});