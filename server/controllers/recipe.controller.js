import Recipe from "../models/recipe.model.js";
import ApiResponse from "../handlers/response.handler.js";
import ApiError from "../handlers/error.handler.js";
import mongoose from "mongoose";
import Rating from "../models/rating.model.js";
import slugify from "slugify";
import uploadImageToCloudinary from "../services/cloudinary.service.js";
const addNewRecipe = async (req, res) => {
  try {
    console.log(req.file.filename);
    const result = await uploadImageToCloudinary(req.file.filename);
    const newRecipe = new Recipe({
      ...req.body,
      slug: slugify(req.body.title, { lower: true, strict: true }),
      author: req.user?.id,
      imageUrl: result?.secure_url || null,
    });

    const savedRecipe = await newRecipe.save();
    console.log(savedRecipe);
    return ApiResponse.created(
      res,
      "reciped created successfully",
      savedRecipe,
    );
  } catch (error) {
    console.log(error);
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .select(" -updatedAt -__v")
      .populate({
        path: "author",
        select: "name email",
      })
      .populate({
        path: "category",
        select: "name",
      });
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

    // Fetch the recipe, excluding fields that are not needed
    const recipe = await Recipe.findById(id)
      .select("-updatedAt -__v")
      .populate({
        path: "author",
        select: "name email",
      });
    if (!recipe) {
      throw new ApiError(404, "Recipe not found");
    }
    recipe.visitCount += 1;
    await recipe.save();

    // Fetch ratings and only include user's name and email
    const ratings = await Rating.find({ recipe: id })
      .select("-__v -_id") // Exclude fields you don't want to return
      .populate({
        path: "user",
        select: "name email", // Include only name and email fields
      });

    const totalScore = ratings.reduce((acc, curr) => acc + curr.score, 0);
    const averageRating = ratings.length ? totalScore / ratings.length : 0;

    return ApiResponse.success(res, "Recipe fetched successfully", {
      recipe,
      averageRating,
      totalRatings: ratings.length,
      comments: ratings, // The populated user details will now include only name and email
    });
  } catch (error) {
    console.log(error);
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
      throw new ApiError(400, "Recipe ID required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid recipe ID");
    }
    const { ingredients, instructions, ...rest } = req.body;

    const parsedIngredients =
      typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const parsedInstructions =
      typeof instructions === "string"
        ? JSON.parse(instructions)
        : instructions;

    // Prepare the update object
    const updateData = {
      ...rest,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
    };

    if (req.file) {
      console.log(req.file);
      updateData.imageUrl = `${req.file.filename}`;
    }

    const recipe = await Recipe.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!recipe) {
      throw new ApiError(404, "Recipe not found");
    }

    return ApiResponse.success(res, "Recipe updated successfully", recipe);
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
    const { limit } = req.query;
    const ratings = await Rating.aggregate([
      {
        $group: {
          _id: "$recipe",
          averageRating: { $avg: "$score" },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) || 10 },
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
    console.log(error);
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const getrecipeBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    if (!slug) {
      throw new ApiError(400, "slug is required!");
    }
    // Fetch the recipe, excluding fields that are not needed
    const recipe = await Recipe.findOne({ slug })
      .select("-updatedAt -__v")
      .populate({
        path: "author",
        select: "name email",
      });
    if (!recipe) {
      throw new ApiError(404, "Recipe not found");
    }

    // Fetch ratings and only include user's name and email
    const ratings = await Rating.find({ recipe: recipe._id })
      .select("-__v -_id") // Exclude fields you don't want to return
      .populate({
        path: "user",
        select: "name email", // Include only name and email fields
      });

    const totalScore = ratings.reduce((acc, curr) => acc + curr.score, 0);
    const averageRating = ratings.length ? totalScore / ratings.length : 0;

    return ApiResponse.success(res, "Recipe fetched successfully", {
      recipe,
      averageRating,
      totalRatings: ratings.length,
      comments: ratings, // The populated user details will now include only name and email
    });
  } catch (error) {
    console.log(error);
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
  getrecipeBySlug,
};
