import User from "../models/user.model.js";
import ApiError from "../handlers/error.handler.js";
import ApiResponse from "../handlers/response.handler.js";
import Validator from "validator";
import sendEmail from '../services/email.service.js'
import {userVerificationTemplate} from '../utils/termplate.util.js'
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

    const verificationToken = newUser.generateEmailVerificationToken;
    const verificationLink = `${process.env.BASE_URL}/api/v1/auth/verify/${verificationToken}`;
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
