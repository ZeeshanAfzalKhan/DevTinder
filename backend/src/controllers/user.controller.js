import mongoose from "mongoose";
import User from "../models/user.model.js";
import Connection from "../models/connection.model.js";

const signUpUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if ([firstName, email, password].some((field) => field?.trim === "")) {
      res
        .status(400)
        .json({ message: "First name, email and password are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email is already in use. Please use another email or log in.",
      });
    }
    const newUser = await User.create({ firstName, lastName, email, password });

    const createdUser = await User.findById(newUser._id).select("-password");

    if (!createdUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering the user." });
    }

    const token = newUser.generateAuthToken();

    const options = {
      httOnly: true,
      secure: true,
    };

    res
      .status(201)
      .cookie("token", token, options)
      .json({ message: "User registered successfully", user: createdUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim === "")) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = user.generateAuthToken();

    const loggedInUser = await User.findById(user._id).select("-password");
    if (!loggedInUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while logging in the user." });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ message: "Login successful", user: loggedInUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("token", options)
      .json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    res
      .status(200)
      .json({ message: "User fetched successfully", user: req.user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || !oldPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }

    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password cannot be same." });
    }

    const user = await User.findById(req.user._id);

    const isOldPasswordValid = await user.isPasswordCorrect(oldPassword);

    if (!isOldPasswordValid) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {}
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      gender,
      bio,
      interests,
      profilePicture,
    } = req.body;

    const updatedData = {
      firstName: firstName,
      lastName: lastName,
      age: age,
      gender: gender,
      bio: bio,
      interests: interests,
      profilePicture: profilePicture,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while updating profile." });
    }
    res
      .status(200)
      .json({ message: "Profile updated successfully.", user: updatedUser });
  } catch (error) {}
};

const deleteUserAccount = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user._id);
    if (!deletedUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while deleting account." });
    }
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all connections involving the current user
    const connections = await Connection.find({
      $or: [
        { SenderId: currentUserId },
        { ReceiverId: currentUserId },
      ],
    });

    // Collect all users that should be hidden (already connected)
    const hideUsers = connections.flatMap(conn => [
      conn.SenderId.toString(),
      conn.ReceiverId.toString(),
    ]);

    // Also hide the current user
    hideUsers.push(currentUserId.toString());

    // Fetch users not in hideUsers
    const users = await User.find({ _id: { $nin: hideUsers } })
      .select("-password")
      .skip(skip)
      .limit(limit);

    // Count total remaining users for pagination
    const totalUsers = await User.countDocuments({ _id: { $nin: hideUsers } });
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      page,
      totalPages,
      totalUsers,
      users,
      message: "User feed fetched successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export {
  signUpUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserPassword,
  updateUserProfile,
  deleteUserAccount,
  getFeed
};
