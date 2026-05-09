import express from "express";
import cors from "cors";
import clientRoutes from "./modules/clients/infrastructure/ClientRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/clients", clientRoutes);

export default app;