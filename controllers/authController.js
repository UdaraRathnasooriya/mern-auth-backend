import User from "../models/UserModel.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import { validationResult } from "express-validator";
import CustomError from "../Utils/CustomError.js";
import { createSendToken } from "../Utils/token.js";

// ================== SIGN UP ==================
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

  //  Enforce password only for manual signup
  if (!password || !confirmPassword) {
    return res.status(400).json({
      status: "fail",
      message: "Password and confirmPassword are required for manual signup",
    });
  }

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

// ================== SIGN IN ==================
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

  if (!user) {
    const error = new CustomError("User not found with this Email", 400);
    return next(error);
  }

  // 🚫 Block password login for Google-only users
  if (user.authProvider === "google" && !user.password) {
    return next(
      new CustomError(
        "This account was created using Google. Please log in using Google or set a password first.",
        400
      )
    );
  }

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError("Incorrect email or password", 400);
    return next(error);
  }

  createSendToken(user, 200, res, "Login successful");
});

// ================== GOOGLE SIGN IN ==================
const googleSignIn = asyncErrorHandler(async (req, res, next) => {
  const { name, email, avatar } = req.body;

  if (!email) {
    const error = new CustomError("Email is required for Google login", 400);
    return next(error);
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      avatar,
      password: null,
      authProvider: "google",
    });
  } else {
    // If user signed up locally earlier, mark them as multi-provider
    if (user.authProvider === "local") {
      user.authProvider = "local"; // or "google" or ["local","google"] if array-based
      await user.save();
    }
  }

  createSendToken(user, 200, res, "Login successful");
});

// ================== SET PASSWORD (For Google Users) ==================
//✅ New Feature: Set Password for Google Users - Not Complete Implemented
const setPassword = asyncErrorHandler(async (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return next(
      new CustomError("Email, password, and confirmPassword are required", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomError("User not found", 400));
  }

  if (user.authProvider !== "google") {
    return next(
      new CustomError(
        "This feature is only for Google-authenticated users",
        400
      )
    );
  }

  user.password = password;
  user.confirmPassword = confirmPassword;
  user.authProvider = "local"; // ✅ Now they can log in normally
  await user.save();

  createSendToken(user, 200, res, "Password set successfully");
});

export { signUp, signIn, googleSignIn };
