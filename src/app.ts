import express from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";
import { config } from "./config/config";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger-output.json";
const app = express();
app.use(
  cors({
    origin: config.frontendDomain,
  })
);

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/users", userRouter);
app.use("/api/books", bookRouter);

app.use(globalErrorHandler);

export default app;
