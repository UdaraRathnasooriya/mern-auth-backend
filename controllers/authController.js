import User from "../models/UserModel.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import CustomError from "../Utils/CustomError.js";

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};

const signUp = asyncErrorHandler(async (req, res, next) => {
  // Validate input using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
      message: "Validation failed",
    });
  }

  const { name, email, password, confirmPassword } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      status: "fail",
      message: "User with this email already exists",
    });
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    confirmPassword,
  });
  // Convert to plain object and remove password
  const userSafe = user.toObject();
  delete userSafe.password;
  // Send response
  res.status(201).json({
    status: "success",
    data: {
      user: userSafe,
    },
    message: "User registered successfully",
  });
});

const signIn = asyncErrorHandler(async (req, res, next) => {
  //  Validate input using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
      message: "Validation failed",
    });
  }

  // Destructuring the request body
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    const error = new CustomError("Please provide email and password!", 400);
    return next(error);
  }
  // Find user and include password
  const user = await User.findOne({ email }).select("+password");
  // const isMatch = await user.comparePasswordInDb(password, user.password);

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError("Incorrect email or password", 400);
    return next(error);
  }

  const token = signToken(user._id);

  // Convert "30d" to milliseconds
  const days = parseInt(process.env.JWT_EXP); // "30d" → 30
  const cookieExpireMs = days * 24 * 60 * 60 * 1000; // 30 days in ms

  const options = {
    expires: new Date(Date.now() + cookieExpireMs), // Cookie expiry.Must be Date object
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true, // JS can't access cookie
  };

  res.cookie("authToken", token, options);
  // Convert to plain object and remove password
  const userSafe = user.toObject();
  delete userSafe.password;

  res.status(200).json({
    status: "success",
    data: {
      user: userSafe,
    },
    message: "Login successful",
  });
});

export { signUp, signIn };
