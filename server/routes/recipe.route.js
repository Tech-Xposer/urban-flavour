import express from "express";
import {
  addNewRecipe,
  getAllRecipes,
  deleteRecipeById,
  getRecipeById,
  updateRecipeById,
  searchRecipe,
  recipeByUser,
  popularRecipes,
} from "../controllers/recipe.controller.js";
import { authToLoginUser } from "../middlewares/auth.middleware.js";
import validateRecipe from "../middlewares/recipe.middleware.js";
import upload from "../services/multer.service.js";

const recipeRoute = express.Router();

//public routes
recipeRoute.get("/", getAllRecipes);

recipeRoute.get("/search", searchRecipe);

recipeRoute.get("/popular", popularRecipes);
//protected routes
recipeRoute.route("/my-recipe").get(authToLoginUser, recipeByUser);

recipeRoute.post("/new", authToLoginUser, upload.single('imageUrl'), validateRecipe, addNewRecipe);

recipeRoute
  .route("/:id")
  .get(getRecipeById)
  .patch(authToLoginUser, updateRecipeById)
  .delete(authToLoginUser, deleteRecipeById);

export default recipeRoute;
