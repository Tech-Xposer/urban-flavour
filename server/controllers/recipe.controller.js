import Recipe from "../models/recipe.model.js";
import ApiResponse from "../handlers/response.handler.js";
import ApiError from "../handlers/error.handler.js";
import mongoose from "mongoose";
import Rating from "../models/rating.model.js";
const addNewRecipe = async (req, res) => {
  const newRecipe = new Recipe({
    ...req.body,
    author: req.user?.id,
  });

  try {
    const savedRecipe = await newRecipe.save();
    return ApiResponse.created(
      res,
      "reciped created successfully",
      savedRecipe,
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find().select("-createdAt -updatedAt -__v");
    if (recipes.length === 0) {
      throw new ApiError(404, "no recipe found");
    }
    return ApiResponse.success(res, "all recipes fetched successfully", {
      length: recipes.length,
      recipes,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getRecipeByCategory = async (req, res) => {
  const { category } = req.body;
  try {
    if (!category) {
      throw new ApiError(400, "category required!");
    }
    const recipes = await Recipe.find({ category }).select(
      "-createdAt -updatedAt -__v",
    );
    if (recipes.length === 0) {
      throw new ApiError(404, "no recipe found");
    }
    return ApiResponse.success(res, "all recipes fetched successfully", {
      length: recipes.length,
      recipes,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      throw new ApiError(400, "Recipe ID is required!");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid Recipe ID");
    }

    const recipe = await Recipe.findById(id).select(
      "-createdAt -updatedAt -__v",
    );
    if (!recipe) {
      throw new ApiError(404, "Recipe not found");
    }

    const ratings = await Rating.find({ recipe: id }).select("-__v -_id");
    const totalScore = ratings.reduce((acc, curr) => acc + curr.score, 0);
    const averageRating = ratings.length ? totalScore / ratings.length : 0;

    return ApiResponse.success(res, "Recipe fetched successfully", {
      recipe,
      averageRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const deleteRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      throw new ApiError(400, "recipe id required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid recipe id");
    }
    await Rating.deleteMany({ recipe: id });

    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      throw new ApiError(404, "recipe not found");
    }
    return ApiResponse.success(res, "recipe deleted successfully");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const updateRecipeById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      throw new ApiError(400, "recipe id required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid recipe id");
    }
    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { ...req.body },
      {
        new: true,
      },
    );
    if (!recipe) {
      throw new ApiError(404, "recipe not found");
    }
    return ApiResponse.success(res, "recipe updated successfully", recipe);
  } catch (error) {
    console.log(error);
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const searchRecipe = async (req, res) => {
  const { query } = req.query;
  console.log(query);
  try {
    if (!query) {
      throw new ApiError(400, "search query required");
    }
    const recipes = await Recipe.find({
      $or: [
        { title: new RegExp(query, "i") },
        { description: new RegExp(query, "i") },
        { "ingredients.name": new RegExp(query, "i") },
      ],
    }).select("-createdAt -updatedAt -__v");
    return ApiResponse.success(res, "searched recipes", {
      length: recipes.length,
      recipes,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const recipeByUser = async (req, res) => {
  const { id } = req?.user;
  console.log(id);
  try {
    const recipes = await Recipe.find({ author: id });
    if (recipes.length === 0) {
      throw new ApiError(404, "no recipe found");
    }
    return ApiResponse.success(res, "all recipes fetched successfully", {
      length: recipes.length,
      recipes,
    });
  } catch (error) {
    console.log(error);
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const popularRecipes = async (req, res) => {
  try {
    const ratings = await Rating.aggregate([
      {
        $group: {
          _id: "$recipe",
          averageRating: { $avg: "$score" },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "_id",
          as: "recipeInfo",
        },
      },
      {
        $unwind: "$recipeInfo", // Unwind the recipeInfo array to denormalize it
      },
    ]);
    ApiResponse.success(res, "fetched successfully", ratings);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export {
  addNewRecipe,
  getAllRecipes,
  getRecipeByCategory,
  getRecipeById,
  deleteRecipeById,
  updateRecipeById,
  searchRecipe,
  recipeByUser,
  popularRecipes,
};
