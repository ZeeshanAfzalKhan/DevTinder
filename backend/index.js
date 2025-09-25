import express from "express";
import dotenv from "dotenv";
dotenv.config();
import User from "./models/user.js";

import connectDB from "./config/database.js";

const PORT = process.env.PORT || 7777;

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/api/user/signup", async (req, res) => {
  const user = req.body;

  try {
    const newUser = new User(user);
    await newUser.save();

    res.status(201).json({message: "User Created Successfully", user: newUser});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
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
