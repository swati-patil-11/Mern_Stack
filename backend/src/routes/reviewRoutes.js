import express from "express";

import {
  createReview,
  getTurfReviews,
  deleteReview
} from "../controllers/reviewController.js";

import {
  protect
} from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// GET REVIEWS FOR TURF
// ==========================================

// GET /api/reviews/turf/:turfId
router.get(
  "/turf/:turfId",
  getTurfReviews
);


// ==========================================
// CREATE REVIEW
// ==========================================

// POST /api/reviews
router.post(
  "/",
  protect,
  createReview
);


// ==========================================
// DELETE REVIEW
// ==========================================

// DELETE /api/reviews/:id
router.delete(
  "/:id",
  protect,
  deleteReview
);


export default router;