import express from "express";
import cors from "cors";
import productCategoryRouter from "./modules/productCategory/infrastructure/ProductCategoryRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/productCategory", productCategoryRouter);

export default app;