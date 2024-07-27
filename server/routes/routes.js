import express from "express";
import authRoute from "./auth.route.js";
import recipeRoute from "./recipe.route.js";
import categoryRoute from "./category.route.js";
import ratingRoute from "./rating.route.js";

const router = express.Router();
router.use("/auth", authRoute);
router.use("/recipes", recipeRoute);
router.use("/category", categoryRoute);
router.use("/rating", ratingRoute);

export default router;
