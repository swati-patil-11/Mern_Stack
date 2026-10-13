import express from "express";

import {
  getAllTurfs,
  getTurfById,
  createTurf,
  updateTurf,
  deleteTurf
} from "../controllers/turfController.js";

import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get all turfs
// GET /api/turfs
router.get(
  "/",
  getAllTurfs
);


// Get single turf
// GET /api/turfs/:id
router.get(
  "/:id",
  getTurfById
);


// ==========================================
// OWNER / ADMIN ROUTES
// ==========================================

// Create turf
// POST /api/turfs
router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  createTurf
);


// Update turf
// PUT /api/turfs/:id
router.put(
  "/:id",
  protect,
  authorize("owner", "admin"),
  updateTurf
);


// Delete turf
// DELETE /api/turfs/:id
router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteTurf
);


export default router;