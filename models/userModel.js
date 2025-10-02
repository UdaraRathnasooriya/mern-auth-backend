import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      // required: [true, "Password is required"],
      minlength: [4, "Password must be at least 4 characters"], // Updated to match route validation
      select: false,
    },
    confirmPassword: {
      type: String,
      // required: [true, "Please confirm your password"],
      validate: {
        validator: function (val) {
          // ✅ Only validate when the user signs up locally (password exists)
          return this.password ? val === this.password : true;
        },
        message: "Passwords are not the same!",
      },
      select: false, // not persisted
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/dzcmadjl1/image/upload/v1696117083/avatar/avatar_c9c0wl.png",
    },
    // This is track how user register to the system
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
  },
  { timestamps: true }
);

// pre-save document middleware to hash the password **** this - current document
// Hash password *only if* it exists (skip for Google users)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    // if password is not modified, skip the next middleware
    return next();
  }
  // if password is modified, hash the password before saving
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined; // remove confirmPassword from the document
  next(); // call the next middleware
});

//Those are instance methods, they are available on the document instance
userSchema.methods.comparePasswordInDb = async function (
  candidatePassword,
  userPassword
) {
  // Compare the candidate password with the hashed password
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
