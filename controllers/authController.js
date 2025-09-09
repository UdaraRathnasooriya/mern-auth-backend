import User from "../models/UserModel.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import { validationResult } from "express-validator";

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

  const { name, email, password , confirmPassword } = req.body;

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
    confirmPassword
  });

  // Send response
  res.status(201).json({
    status: "success",
    data: {
      user,
    },
    message: "User registered successfully",
  });
});

export { signUp };
