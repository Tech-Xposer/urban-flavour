import mongoose from "mongoose";
import bcrypt from "bcrypt"; // For hashing passwords
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone:{
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const payload = { id: this._id };
  const verificationToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
  return verificationToken;
};

userSchema.methods.generateAccessToken = function () {
  const payload = { id: this._id };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

userSchema.methods.generateRefreshToken = async function () {
  const payload = { id: this._id };
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  this.refreshToken = refreshToken;
  await this.save();
  return refreshToken;
};

userSchema.methods.generateRefreshTokenandAccessToken = async function () {
  const refreshToken = await this.generateRefreshToken();
  const accessToken = this.generateAccessToken();
  return { accessToken, refreshToken };
};

userSchema.methods.generatePasswordResetToken = function () {
  const payload = { id: this._id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30m",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
