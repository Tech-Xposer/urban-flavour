import mongoose from "mongoose";

// Define the ingredient subdocument schema
const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: String,
    required: true,
  },
});

// Define the recipe schema
const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: [ingredientSchema],
    instructions: {
      type: [String],
      required: true,
    },
    prepTime: {
      type: Number, // Time in minutes
      required: true,
    },
    cookTime: {
      type: Number, // Time in minutes
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
