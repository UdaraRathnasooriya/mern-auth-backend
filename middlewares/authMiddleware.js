import jwt from "jsonwebtoken";
import util from "util";
import User from "../models/userModel.js";
import CustomError from "../Utils/CustomError.js";
import asyncErrorHandler from "../Utils/asyncErrorHandler.js";

// Middleware to protect routes
export const protect = asyncErrorHandler(async (req, res, next) => {
  let token;
  // console.log(req.cookies);

  // 1️⃣ Get token from Authorization header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.authToken) {
    token = req.cookies.authToken; // Fallback for cookie-based auth
  }

  if (!token) {
    return next(new CustomError("Not authorized. Please log in.", 401));
  }

  // 2️⃣ Verify token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3️⃣ Check if user exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new CustomError("User no longer exists.", 401));
  }

  // 4️⃣ Check if user changed password after token issued
  // const isPasswordChanged = await currentUser.isPasswordChanged(decoded.iat);
  // if (isPasswordChanged) {
  //   return next(
  //     new CustomError("Password recently changed. Please log in again.", 401)
  //   );
  // }

  // ✅ Attach user to request object
  req.user = currentUser;
  // console.log("User authenticated:", req.user);
  next();
});
