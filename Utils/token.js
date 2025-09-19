import jwt from "jsonwebtoken";

//Generate JWT token
export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};

// Create token, set cookie, and send response
export const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  // Convert "30" (days) to milliseconds
  const days = parseInt(process.env.JWT_EXP, 10);
  const cookieExpireMs = days * 24 * 60 * 60 * 1000;

  const options = {
    expires: new Date(Date.now() + cookieExpireMs),
    secure: process.env.NODE_ENV === "production", // Only HTTPS in production
    httpOnly: true, // Cookie not accessible by JS
  };

  res.cookie("authToken", token, options);

  // Remove password before sending
  const userSafe = user.toObject();
  delete userSafe.password;

  res.status(statusCode).json({
    status: "success",
    data: { user: userSafe },
    message,
  });
};
