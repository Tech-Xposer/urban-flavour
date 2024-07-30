import express from "express";
import { deleteUserById } from "../controllers/admin.controller.js";

const adminRoute = express.Router();

adminRoute.delete("/user/:id", deleteUserById);

export default adminRoute;
