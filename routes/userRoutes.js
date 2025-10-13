import express from "express";
import { body } from "express-validator";
import { updateProfile } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Validation for updateProfile
const updateProfileValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Invalid email address"),
  // body("password")
  //   .isLength({ min: 4 })
  //   .withMessage("Password must be at least 4 characters"),
];

router.patch("/profile/update", updateProfileValidation, updateProfile);

export default router;
