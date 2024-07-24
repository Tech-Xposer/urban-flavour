import express from "express";
import {
  signupUser,
  verifyUser,
  loginUser,
  userLogout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import { currentUser } from "../index.js";

const authRoute = express.Router();

authRoute.post("/signup", signupUser);
authRoute.get("/verify/:verificationToken", verifyUser);
authRoute.post("/login", loginUser);
authRoute.post("/logout", userLogout);
authRoute.post("/refresh-token", refreshAccessToken);
authRoute.get("/current-user", currentUser);
export default authRoute;
