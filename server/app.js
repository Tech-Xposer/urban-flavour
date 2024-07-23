import express from "express";
import router from "./routes/routes.js";
import cors from "cors";
import morgan from "morgan";

import cookieParser from "cookie-parser";
const app = express();

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(morgan('dev'))

app.use("/api/v1", router);

export default app;