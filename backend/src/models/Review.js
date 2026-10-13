import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);


// One user can review a particular turf only once
reviewSchema.index(
  {
    user: 1,
    turf: 1
  },
  {
    unique: true
  }
);


const Review =
  mongoose.model("Review", reviewSchema);

export default Review;