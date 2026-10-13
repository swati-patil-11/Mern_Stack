import jwt from "jsonwebtoken";

import User from "../models/User.js";


// =========================
// PROTECT ROUTES
// =========================

export const protect = async (req, res, next) => {

  try {

    const authHeader =
      req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login."
      });
    }

    // Extract token
    const token =
      authHeader.split(" ")[1];

    // Verify token
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // Find user
    const user =
      await User.findById(decoded.id)
        .select("-password");

    if (!user) {

      return res.status(401).json({
        success: false,
        message: "User no longer exists"
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {

    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};


// =========================
// ROLE AUTHORIZATION
// =========================

export const authorize = (...roles) => {

  return (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: "Please login"
      });
    }

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({
        success: false,
        message: "You do not have permission"
      });
    }

    next();
  };
};