import express from "express";

import {
  createClosure,
  getTurfClosures,
  deleteClosure
} from "../controllers/turfClosureController.js";

import {
  protect,
  authorize
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Turf closure routes are working"
  });
});

router.post(
  "/",
  protect,
  authorize("owner", "admin"),
  createClosure
);

router.get(
  "/turf/:turfId",
  protect,
  getTurfClosures
);

router.delete(
  "/:id",
  protect,
  authorize("owner", "admin"),
  deleteClosure
);

export default router;