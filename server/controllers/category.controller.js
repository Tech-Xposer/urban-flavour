import ApiError from "../handlers/error.handler.js";
import ApiResponse from "../handlers/response.handler.js";
import Category from "../models/category.model.js"; // Adjust the import path as needed

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return ApiResponse.success(
      res,
      "categories fetched successfully",
      categories,
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

const addNewCategory = async (req, res) => {
  const { category } = req.body;
  try {
    if (!category) {
      throw new ApiError(400, "category required!");
    }
    const addNewCategory = await Category.create({ name: category });
    return ApiResponse.success(
      res,
      "category added successfully",
      addNewCategory,
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export { getAllCategories, addNewCategory };
