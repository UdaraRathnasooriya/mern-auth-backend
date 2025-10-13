import asyncErrorHandler from "../Utils/asyncErrorHandler.js";
import User from "../models/userModel.js";
import CustomError from "../Utils/CustomError.js";
import { validationResult } from "express-validator";

// ================== UPDATE USER PROFILE ==================
export const updateProfile = asyncErrorHandler(async (req, res, next) => {
  // console.log("Incoming cookies:", req.cookies);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
      message: "Validation failed",
    });
  }
  const updates = {};
  if (req.body.name) updates.name = req.body.name;
  if (req.body.email) updates.email = req.body.email;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) return next(new CustomError("User not found", 404));

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
    message: "User data updated successfully",
  });
});
