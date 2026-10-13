import express from "express";

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  checkAvailability,
  getOwnerBookings
} from "../controllers/bookingController.js";

import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// CHECK AVAILABILITY
// ==========================================

// GET /api/bookings/availability
router.get(
  "/availability",
  protect,
  checkAvailability
);


// ==========================================
// CREATE BOOKING
// ==========================================

// POST /api/bookings
router.post(
  "/",
  protect,
  authorize("user"),
  createBooking
);


// ==========================================
// MY BOOKINGS
// ==========================================

// GET /api/bookings/my
router.get(
  "/my",
  protect,
  getMyBookings
);


// ==========================================
// OWNER BOOKINGS
// ==========================================

// GET /api/bookings/owner
router.get(
  "/owner",
  protect,
  authorize("owner", "admin"),
  getOwnerBookings
);


// ==========================================
// SINGLE BOOKING
// ==========================================

// GET /api/bookings/:id
router.get(
  "/:id",
  protect,
  getBookingById
);


// ==========================================
// CANCEL BOOKING
// ==========================================

// PUT /api/bookings/:id/cancel
router.put(
  "/:id/cancel",
  protect,
  cancelBooking
);


export default router;