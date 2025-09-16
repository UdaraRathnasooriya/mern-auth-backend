import express from "express";
const app = express();
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";

//Error Handling
import CustomError from "./Utils/CustomError.js";
import globalErrorHandler from "././middlewares/globalErrorHandler.js";

app.use(express.json());

// CORS (for dev)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// routes
app.use("/api/v1/auth/", authRouter);
app.use("/api/v1/user/", userRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the authentication system.",
  });
});

// Default route
app.all(/.*/, (req, res, next) => {
  const error = new CustomError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
