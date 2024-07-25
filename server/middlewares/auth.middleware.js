import ApiError from "../handlers/error.handler.js";
import ApiResponse from "../handlers/response.handler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const authToLoginUser = async (req, res, next) => {
  try {
    const accessToken =
      req.signedCookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
    );
    const user = await User.findById(decodedAccessToken?.id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return ApiResponse.error(
      res,
      error?.message || "Invalid Access Token",
      error.statusCode || 500,
    );
  }
};
