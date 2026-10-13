import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Register
router.post(
  "/register",
  registerUser
);


// Login
router.post(
  "/login",
  loginUser
);


// Current logged-in user
router.get(
  "/me",
  protect,
  getCurrentUser
);


export default router;