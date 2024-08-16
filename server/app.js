import express from "express";
import router from "./routes/routes.js";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();
const {COOKIE_SECRET, CORS_ORIGIN} = process.env;
console.log(COOKIE_SECRET, CORS_ORIGIN)
app.use(
  cors({
    origin: [CORS_ORIGIN, "http://localhost:3000"],
    credentials: true,
  }),
);

//public folder
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser(COOKIE_SECRET));

app.use("/api/v1", router);

export default app;
