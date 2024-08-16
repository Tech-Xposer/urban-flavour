import ApiError from "../handlers/error.handler.js";
import mongoose from "mongoose";
import Rating from "../models/rating.model.js";
import ApiResponse from "../handlers/response.handler.js";
import Recipe from "../models/recipe.model.js";
const newRating = async (req, res) => {
  const { id } = req.params;
  const { score, review } = req.body;
  console.log(req.body);
  try {
    if (!id) {
      throw new ApiError(400, "recipe id required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid recipe id");
    }
    if (score == null || review == null) {
      throw new ApiError(400, "score and review are required");
    }
    const checkIsRecipeExists = await Recipe.findById(id);
    if (!checkIsRecipeExists) {
      throw new ApiError(404, "Recipe not found");
    }
    const rating = await Rating.create({
      user: req.user.id,
      recipe: id,
      score,
      review,
    });

    return ApiResponse.success(res, "Rating created successfully");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const deleteRating = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    if (!id) {
      throw new ApiError(400, "Rating id required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid rating id");
    }

    const rating = await Rating.findById(id);
    if (!rating) {
      throw new ApiError(404, "Rating not found");
    }

    // Check if the requesting user is the author of the rating
    if (rating.author.toString() !== userId) {
      throw new ApiError(
        403,
        "You do not have permission to delete this rating",
      );
    }

    await Rating.findByIdAndDelete(id);
    return ApiResponse.success(res, "Rating deleted successfully");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export { newRating, deleteRating };
