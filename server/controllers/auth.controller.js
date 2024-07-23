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
