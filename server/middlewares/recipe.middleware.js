import Joi from "joi";
import ApiResponse from "../handlers/response.handler.js";

const recipeSchema = Joi.object({
  title: Joi.string().trim().required(),
  description: Joi.string().required(),
  ingredients: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.string().required(),
      }),
    )
    .required(),
  instructions: Joi.array().items(Joi.string().required()).required(),
  prepTime: Joi.number().integer().required(),
  cookTime: Joi.number().integer().required(),
  servings: Joi.number().integer().required(),
  category: Joi.string().required(),
  author: Joi.string().optional(),
  imageUrl: Joi.string().optional().allow(""),
});

// Middleware to validate the request body
const validateRecipe = (req, res, next) => {
  const { error } = recipeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return ApiResponse.badRequest(res, {
      errors: error.details.map((detail) => detail.message),
    });
  }
  next();
};

export default validateRecipe;
