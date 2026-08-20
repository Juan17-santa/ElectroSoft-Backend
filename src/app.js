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
import orderRouter from "./modules/orders/infrastructure/OrderRoutes.js";
import userRouter from "./modules/users/infrastructure/UserRoutes.js";
import roleRouter from "./modules/roles/infrastructure/RoleRoutes.js";
import saleRouter from "./modules/sales/infrastructure/SaleRoutes.js";
import paymentRouter from "./modules/payments/infrastructure/PaymentRoutes.js";
import notificationRouter from "./modules/notifications/infrastructure/NotificationRoutes.js";
import { errorHandler } from "./infrastructure/middlewares/errorHandler.js";

const app = express();

const configuredOrigins = process.env.CLIENT_ORIGIN
    ?.split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: configuredOrigins?.length ? configuredOrigins : true,
}));
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
app.use("/api/orders", orderRouter);
app.use("/api/shopping", shoppingRouter);
app.use("/api/devolutions", devolutionRouter);
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);
app.use("/api/sales", saleRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/notifications", notificationRouter);

app.use(errorHandler);

export default app;