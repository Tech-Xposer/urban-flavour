import express from "express";
import { signupUser } from "../controllers/auth.controller.js";

const authRoute = express.Router();

authRoute.post("/signup", signupUser);

export default authRoute;
