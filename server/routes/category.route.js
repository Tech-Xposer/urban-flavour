import express from "express";
import {
  addNewCategory,
  getAllCategories,
} from "../controllers/category.controller.js";

const categoryRoute = express.Router();

categoryRoute.route("/").get(getAllCategories).post(addNewCategory);

export default categoryRoute;
