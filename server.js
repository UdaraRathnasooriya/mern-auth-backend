import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
  path: "./config.env",
});

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught Exception occurred! Shutting down...");
  process.exit(1); // Exit the process with failure
});
import app from "./app.js";

mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.CONN_STR)
  .then(() => console.log("DB Connection Successful"))
  .catch((err) => {
    console.log(err);
    console.log("DB Connection Failed");
  });
  
// Create a Server instance
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection! Shutting down...");

  server.close(() => {
    process.exit(1); // Exit the process with failure
  });
});
