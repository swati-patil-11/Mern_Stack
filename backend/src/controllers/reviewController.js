import Review from "../models/Review.js";
import Turf from "../models/Turf.js";
import Booking from "../models/Booking.js";


// ==========================================
// ADD REVIEW
// ==========================================

export const createReview = async (req, res) => {
  try {
    const {
      turfId,
      rating,
      comment
    } = req.body;


    // Validate fields
    if (!turfId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message:
          "Turf, rating and comment are required"
      });
    }


    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5"
      });
    }


    // Check turf
    const turf =
      await Turf.findById(turfId);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found"
      });
    }


    // Check whether user has a booking
    const hasBooking =
      await Booking.findOne({
        user: req.user._id,
        turf: turfId,
        status: {
          $in: [
            "confirmed",
            "completed"
          ]
        }
      });


    if (!hasBooking) {
      return res.status(403).json({
        success: false,
        message:
          "You can review only a turf you have booked"
      });
    }


    // Check existing review
    const existingReview =
      await Review.findOne({
        user: req.user._id,
        turf: turfId
      });


    if (existingReview) {
      return res.status(409).json({
        success: false,
        message:
          "You have already reviewed this turf"
      });
    }


    // Create review
    const review =
      await Review.create({
        user: req.user._id,
        turf: turfId,
        rating: Number(rating),
        comment
      });


    // Recalculate turf rating
    const reviews =
      await Review.find({
        turf: turfId
      });


    const totalRating =
      reviews.reduce(
        (sum, item) =>
          sum + item.rating,
        0
      );


    const averageRating =
      totalRating / reviews.length;


    turf.rating =
      Number(averageRating.toFixed(1));

    turf.reviewCount =
      reviews.length;


    await turf.save();


    const populatedReview =
      await review.populate(
        "user",
        "name"
      );


    res.status(201).json({
      success: true,
      message:
        "Review added successfully",
      review: populatedReview
    });


  } catch (error) {

    console.error(
      "Create review error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create review"
    });
  }
};


// ==========================================
// GET TURF REVIEWS
// ==========================================

export const getTurfReviews = async (
  req,
  res
) => {
  try {

    const reviews =
      await Review.find({
        turf: req.params.turfId
      })
        .populate(
          "user",
          "name profileImage"
        )
        .sort({
          createdAt: -1
        });


    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });


  } catch (error) {

    console.error(
      "Get reviews error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch reviews"
    });
  }
};


// ==========================================
// DELETE REVIEW
// ==========================================

export const deleteReview = async (
  req,
  res
) => {
  try {

    const review =
      await Review.findById(
        req.params.id
      );


    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }


    // Only review owner or admin
    if (
      req.user.role !== "admin" &&
      review.user.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this review"
      });
    }


    const turfId =
      review.turf;


    await review.deleteOne();


    // Recalculate rating
    const reviews =
      await Review.find({
        turf: turfId
      });


    const totalRating =
      reviews.reduce(
        (sum, item) =>
          sum + item.rating,
        0
      );


    const averageRating =
      reviews.length > 0
        ? totalRating / reviews.length
        : 0;


    await Turf.findByIdAndUpdate(
      turfId,
      {
        rating:
          Number(averageRating.toFixed(1)),
        reviewCount:
          reviews.length
      }
    );


    res.status(200).json({
      success: true,
      message:
        "Review deleted successfully"
    });


  } catch (error) {

    console.error(
      "Delete review error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete review"
    });
  }
};