import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectionUrl = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(connectionUrl, {
      dbName: "DevTinder"
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;