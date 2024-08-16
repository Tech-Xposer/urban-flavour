import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    refreshToken: [refreshTokenSchema],
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
  }
);

// Ensure unique email at schema level
userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const payload = { id: this._id };
  const verificationToken = jwt.sign(payload, process.env.EMAIL_VERIFICATION_TOKEN_SECRET, {
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
  this.refreshToken.push({ token: refreshToken });
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
  const token = jwt.sign(payload, process.env.PASSWORD_RESET_TOKEN_SECRET, {
    expiresIn: "30m",
  });
  return token;
};

const User = mongoose.model("User", userSchema);

export default User;
