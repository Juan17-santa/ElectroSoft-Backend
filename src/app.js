import express from "express";
import cors from "cors";
import authRouter from "./modules/auth/infrastructure/AuthRoutes.js";
import productCategoryRouter from "./modules/productCategory/infrastructure/ProductCategoryRoutes.js"
import documentTypeRouter from "./shared/infrastructure/routes/DocumentTypeRoutes.js";
import providerRouter from "./modules/providers/infrastructure/ProviderRoutes.js"
import shoppingRouter from "./modules/shopping/infrastructure/Shopping.Routes.js";
import devolutionRouter from "./modules/devolutions/infrastructure/DevolutionRoutes.js";
import productRouter from "./modules/products/infrastructure/ProductRoutes.js";
import productCharacteristicRouter from "./modules/productCharacteristic/infrastructure/ProductCharacteristicRoutes.js";
import productMeasureRouter from "./modules/productMeasure/infrastructure/ProductMeasureRoutes.js";
import clientRouter from "./modules/clients/infrastructure/ClientRoutes.js";
import userRouter from "./modules/users/infrastructure/UserRoutes.js";
import roleRouter from "./modules/roles/infrastructure/RoleRoutes.js";
import saleRouter from "./modules/sales/infrastructure/SaleRoutes.js";
import paymentRouter from "./modules/payments/infrastructure/PaymentRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, _res, next) => {
    req.url = req.url.replace(/(%0A|%0D|\s)+$/gi, "");
    next();
});

app.use("/api/documentTypes", documentTypeRouter);


app.use("/api/auth", authRouter);
app.use("/api/productCategory", productCategoryRouter);
app.use("/api/products", productRouter);
app.use("/api/productCharacteristics", productCharacteristicRouter);
app.use("/api/productMeasures", productMeasureRouter);
app.use("/api/providers", providerRouter);
app.use("/api/clients", clientRouter);
app.use("/api/shopping", shoppingRouter);
app.use("/api/devolutions", devolutionRouter);
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);
app.use("/api/sales", saleRouter);
app.use("/api/payments", paymentRouter);

export default app;