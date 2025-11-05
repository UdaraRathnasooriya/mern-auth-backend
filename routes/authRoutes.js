import express from "express";
import { signUp, signIn, googleSignIn , logout } from "../controllers/authController.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware for signUp
const signUpValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Invalid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const signInValidation = [
  body("email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ✅ Auth routes
router.route("/signup").post(signUpValidation, signUp);
router.route("/signin").post(signInValidation, signIn);

// ✅ Google sign-in route (no validation needed for now)
router.route("/google").post(googleSignIn);

// logout function
router.route("/signout").post(logout)

export default router;
