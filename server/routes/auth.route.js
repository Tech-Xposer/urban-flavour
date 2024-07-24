import express from "express";
import { signupUser, verifyUser, loginUser } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/signup", signupUser);
authRoute.get("/verify/:verificationToken", verifyUser);
authRoute.post('/login', loginUser)
export default authRoute;
