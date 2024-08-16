import ApiError from "../handlers/error.handler.js";
import ApiResponse from "../handlers/response.handler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const authToLoginUser = async (req, res, next) => {
  try {
    let accessToken = req.cookies?.accessToken;

    // Check if authorization header exists and is properly formatted
    if (!accessToken && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        accessToken = req.headers.authorization.split(" ")[1];
      }
    }

    if (!accessToken || accessToken.length === 0) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Check if the access token is a valid JWT before verification
    if (typeof accessToken !== "string" || !accessToken.trim()) {
      throw new ApiError(401, "Invalid Access Token");
    }
    console.log(accessToken);
    // Verify the JWT and handle possible token expiration
    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
      );
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(401, "Access Token expired");
      } else {
        throw new ApiError(401, "Invalid Access Token");
      }
    }

    const user = await User.findById(decodedAccessToken?.id).select(
      "-password -refreshToken -createdAt -__v -isVerified -updatedAt",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return ApiResponse.error(
      res,
      error?.message || "Invalid Access Token",
      error.statusCode || 500,
    );
  }
};
