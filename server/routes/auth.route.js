import express from "express";
import { signupUser, verifyUser } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/signup", signupUser);
authRoute.get("/verify/:verificationToken", verifyUser);

export default authRoute;
