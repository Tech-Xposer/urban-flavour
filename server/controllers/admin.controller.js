import ApiError from "../handlers/error.handler.js";
import ApiResponse from "../handlers/response.handler.js";
import User from "../models/user.model.js";



const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      throw new ApiError(400, "user id required");
    }
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, "Invalid user id");
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new ApiError(404, "user not found");
    }
    return ApiResponse.success(res, "user deleted successfully");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export { deleteUserById };
