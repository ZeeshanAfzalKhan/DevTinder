import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/database.js";

const PORT = process.env.PORT || 7777;

const app = express();

app.use(express.json());
app.use(cookieParser());

// Route imports
import userRoutes from "./src/routes/user.routes.js";

// Use Routes
app.use("/api/v1", userRoutes);


// middlewares for error handling
app.use((err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    const errors = {};
    err.error.details.forEach(detail => {
      const key = detail.path[0]; // field name
      // Customize the message if you want
      errors[key] = detail.message.replace(/["]/g, '');
    });

    return res.status(400).json({
      status: "fail",
      errors
    });
  }

  // fallback for other errors
  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Something went wrong"
  });
});



connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
