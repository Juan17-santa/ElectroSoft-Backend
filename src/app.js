import express from "express";
import cors from "cors";
import productCategoryRouter from "./modules/productCategory/infrastructure/ProductCategoryRoutes.js"
import documentTypeRouter from "./shared/infrastructure/routes/DocumentTypeRoutes.js";
import providerRouter from "./modules/providers/infrastructure/ProviderRoutes.js"
import shoppingRouter from "./modules/shopping/infrastructure/Shopping.Routes.js";
import devolutionRouter from "./modules/devolutions/infrastructure/DevolutionRoutes.js";
import productRouter from "./modules/products/infrastructure/ProductRoutes.js";
import clientRouter from "./modules/clients/infrastructure/ClientRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
    req.url = req.url.replace(/(%0A|%0D|\s)+$/gi, "");
    next();
});

app.use("/api/documentTypes", documentTypeRouter);

app.use("/api/productCategory", productCategoryRouter);
app.use("/api/products", productRouter);
app.use("/api/providers", providerRouter);
app.use("/api/clients", clientRouter);
app.use("/api/shopping", shoppingRouter);
app.use("/api/devolutions", devolutionRouter);

export default app;
