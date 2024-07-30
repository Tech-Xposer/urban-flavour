import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET;

export const generateToken = (payload, expiresIn) => {
  try {
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: expiresIn });
    return token;
  } catch (error) {
    return error.message;
  }
};

export const decodeToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};
