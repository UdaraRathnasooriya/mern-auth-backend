// This error handler middleware captures errors thrown in the application
// and sends a JSON response with the error status and message.

import CustomError from "./../Utils/CustomError.js";

const developmentErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const castErrorHandler = (error) => {
  const message = `Invalid value for ${error.path} : ${error.value}`;
  return new CustomError(message, 400);
};

const handleDuplicateKeyError = (error) => {
  const message = `Duplicate field value: ${error.keyValue.name}. Please use another value!`;
  return new CustomError(message, 400);
};

const handleValidationError = (error) => {
  const message = Object.values(error.errors)
    .map((el) => el.message)
    .join(". ");
  return new CustomError(message, 400);
};

const handleExpiredJWT = (error) => {
  const message = "Your token has expired! Please log in again.";
  return new CustomError(message, 401);
};

const handleInvalidJWT = (error) => {
  const message = "Invalid token! Please log in again.";
  return new CustomError(message, 401);
};

const productionErrors = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "Error",
      message: "Something went wrong!Please try again later",
    });
  }
};

const globalErrorHandler = (error, req, res, next) => {
  // Set default values for error properties
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  // Set the environment-specific error message structure
  if (process.env.NODE_ENV === "development") {
    developmentErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    // Handle specific error types - Invalid ObjectId Error
    if (error.name === "CastError") {
      error = castErrorHandler(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateKeyError(error);
    }
    if (error.name === "ValidationError") {
      error = handleValidationError(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleExpiredJWT(error);
    }
    if (error.name === "JsonWebTokenError") {
      error = handleInvalidJWT(error);
    }
    productionErrors(res, error);
  }
};

export default globalErrorHandler;
