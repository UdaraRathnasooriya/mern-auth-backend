import express from "express";
const app = express();

//Error Handling
import CustomError from "./Utils/CustomError.js";
import globalErrorHandler from "././middlewares/globalErrorHandler.js";

app.use(express.json());


// app.use("/api/v1/auth/", authRouter);
// app.use("/api/v1/user/", userRouter);

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
