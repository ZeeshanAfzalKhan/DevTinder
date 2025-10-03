import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?._id || !mongoose.Types.ObjectId.isValid(decoded?._id)) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }
    const user = await User.findById(decoded?._id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Authentication failed", error: error.message });
  }
};

export default authenticate;
