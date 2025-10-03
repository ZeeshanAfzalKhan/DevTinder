import express from "express";
const router = express.Router();

import authenticate  from "../middlewares/auth.middleware.js";
import { signUpUser, loginUser, logoutUser, getUserProfile, updateUserPassword, updateUserProfile, deleteUserAccount } from "../controllers/user.controller.js";
import { signUpValidator, loginValidator } from "../middlewares/validate.middleware.js";

router.post("/signup",signUpValidator, signUpUser);

router.post("/login", loginValidator, loginUser);

router.post("/logout", logoutUser);

router.get("/profile", authenticate, getUserProfile);

router.patch("/update-password", authenticate, updateUserPassword);

router.patch("/update-profile", authenticate, updateUserProfile);

router.delete("/delete-account", authenticate, deleteUserAccount);

export default router;