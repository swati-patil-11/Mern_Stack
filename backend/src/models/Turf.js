import mongoose from "mongoose";

const turfSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    sports: [
      {
        type: String,
        trim: true
      }
    ],

    pricePerHour: {
      type: Number,
      required: true,
      min: 0
    },

    image: {
      type: String,
      default: ""
    },

    facilities: [
      {
        type: String
      }
    ],

    openingTime: {
      type: String,
      default: "06:00"
    },

    closingTime: {
      type: String,
      default: "23:00"
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    reviewCount: {
      type: Number,
      default: 0
    },

    isApproved: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Turf = mongoose.model(
  "Turf",
  turfSchema,
  "turfs"
);

export default Turf;