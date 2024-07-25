import express from "express";
import {
  signupUser,
  verifyUser,
  loginUser,
  userLogout,
  refreshAccessToken,
  currentUser,
} from "../controllers/auth.controller.js";
import { authToLoginUser } from "../middlewares/auth.middleware.js";

const authRoute = express.Router();

authRoute.post("/signup", signupUser);
authRoute.get("/verify/:verificationToken", verifyUser);
authRoute.post("/login", loginUser);

//Secured Routes
authRoute.post("/logout",authToLoginUser, userLogout);
authRoute.post("/refresh-token",authToLoginUser, refreshAccessToken);
authRoute.get("/current-user", authToLoginUser, currentUser);
export default authRoute;
