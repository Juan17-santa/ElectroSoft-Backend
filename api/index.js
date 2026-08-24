import "dotenv/config";
import connectDB from "../src/config/database.js";
import app from "../src/app.js";

let dbConnection;

const handler = async (req, res) => {
  try {
    if (!dbConnection) {
      dbConnection = connectDB();
    }

    await dbConnection;

    return app(req, res);
  } catch (error) {
    console.error("Error inicializando la API:", error);
    return res.status(500).json({
      message: "Error al inicializar el servidor",
    });
  }
};

export default handler;