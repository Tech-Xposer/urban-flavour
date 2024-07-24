import User from "../models/user.model.js";
import ApiError from "../handlers/error.handler.js";
import ApiResponse from "../handlers/response.handler.js";
import Validator from "validator";
import sendEmail from "../services/email.service.js";
import { userVerificationTemplate } from "../utils/termplate.util.js";
import { decodeToken } from "../utils/token.util.js";
import jwt from "jsonwebtoken";
import BlackList from "../models/blacklist.model.js";

export const signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      throw new ApiError(400, "All fields required!");
    }
    if (name.length < 2) {
      throw new ApiError(400);
    }
    if (!Validator.isEmail(email)) {
      throw new ApiError(400);
    }
    if (!Validator.isMobilePhone(phone)) {
      throw new ApiError(400, "Invalid Mobile Number");
    }

    if (!Validator.isStrongPassword(password)) {
      throw new ApiError(
        400,
        "Your password is too weak. It should be at least 8 characters long and include a combination of uppercase letters, lowercase letters, numbers, and special characters.",
      );
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(409, "User already registered");
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      password,
    });

    const verificationToken = newUser.generateEmailVerificationToken();
    const verificationLink = `${process.env.BASE_URL}/api/v1/auth/verify/${verificationToken}`;
    console.log(verificationLink);
    const checkMail = await sendEmail(
      email,
      userVerificationTemplate(name, verificationLink),
    );

    ApiResponse.success(res, 201, "User created successfully", newUser);
  } catch (error) {
    console.log(error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export const verifyUser = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    //if token in blacklisted
    const isTokenBlackListed = await BlackList.findOne({
      token: verificationToken,
    });
    if (isTokenBlackListed) {
      throw new ApiError(400, "Invalid or expired verification link");
    }
    const { id } = jwt.verify(verificationToken, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.isVerified) {
      throw new ApiError(400, "User already verified");
    }
    user.isVerified = true;

    await user.save();
    await BlackList.create({
      token: verificationToken,
    });
    ApiResponse.success(res, 200, "User verified successfully");
  } catch (error) {
    console.log(error);
    ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export const loginUser = async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    signed:true
  };
  try {
    const { email, password } = req.body;

    if (!Validator.isEmail(email)) {
      throw new ApiError(400, "Please enter a valid email!");
    }
    if (!Validator.isStrongPassword(password)) {
      throw new ApiError(400, "Password must be at least 8 characters long");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      throw new ApiError(400, "Invalid password");
    }

    const { accessToken, refreshToken } =
      await user.generateRefreshTokenandAccessToken();

    // assigning cookies
    res.cookie("accessToken", accessToken, {
      ...options,
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie("refreshToken", refreshToken, {
      ...options,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });

    ApiResponse.success(res, 200, "Login successful");
  } catch (error) {
    console.log(error);
    ApiResponse.error(
      res,
      error.message || "An internal server error occurred",
      error.statusCode || 500,
    );
  }
};

export const userLogout = async (req, res) => {
  try {
    const { refreshToken, accessToken } = req.signedCookies;
    if (
      !accessToken &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    }
    if (accessToken || refreshToken) {
      if (accessToken) {
        await BlackList.create({ token: accessToken });
        res.clearCookie("accessToken");
      }
      if (refreshToken) {
        await BlackList.create({ token: refreshToken });
        res.clearCookie("refreshToken");
        const user = await User.findOne({ refreshToken });
        if (user) {
          user.refreshToken = user.refreshToken.filter(
            (token) => token !== refreshToken,
          );
          await user.save();
        }
      }
      return ApiResponse.success(res,200, "Logged out successfully");
    }

    throw new ApiError(404, "Token not found");
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    let { accessToken, refreshToken } = req.signedCookies;

    if (!accessToken && !refreshToken) {
      throw new ApiError(404, "Token not found");
    }

    
    if (accessToken) {
      await BlackList.create({ token: accessToken });
      res.clearCookie("accessToken");
    }

    if (refreshToken) {
      await BlackList.create({ token: refreshToken });
      res.clearCookie("refreshToken");

      const user = await User.findOne({ refreshToken }); 
      if (user) {
        
        user.refreshToken = user.refreshToken.filter(
          (token) => token !== refreshToken
        );
        await user.save();

        // Generate new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await user.generateRefreshTokenandAccessToken();

        // assigning cookies
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24, // 1 day
        });
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        });

        return ApiResponse.success(res, 200, "Tokens refreshed successfully");
      } else {
        throw new ApiError(404, "User not found");
      }
    }

  } catch (error) {
    console.log(error);
    return ApiResponse.error(res, error.message, error.statusCode || 500);
  }
};


export const currentUser = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user.id).select(
			"-password -isVerified  -updatedAt -__v -createdAt"
		);
		if (!currentUser) throw new ApiError(404, "User Not Found");
		return ApiResponse.ok(res, 200, "User Found", currentUser);
	} catch (error) {
		return ApiResponse.error(res, error.message, error.statusCode || 500);
	}
};