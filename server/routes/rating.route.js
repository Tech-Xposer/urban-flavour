import express from "express";
import { authToLoginUser } from "../middlewares/auth.middleware.js";
import { deleteRating, newRating } from "../controllers/rating.controller.js";

const ratingRoute = express.Router();

ratingRoute
  .route("/:id")
  .post(authToLoginUser, newRating)
  .delete(authToLoginUser, deleteRating);

export default ratingRoute;
