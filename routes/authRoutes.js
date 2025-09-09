import express from "express";
import { signUp } from "../controllers/authController.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware for signUp
const signUpValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters"),
];

router.route("/signup").post(signUpValidation, signUp);

export default router;
