import mongoose from "mongoose";

const turfClosureSchema = new mongoose.Schema(
  {
    turf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      required: true
    },

    date: {
      type: String,
      required: true
    },

    reason: {
      type: String,
      default: "Turf unavailable",
      trim: true,
      maxlength: 200
    }
  },
  {
    timestamps: true
  }
);

// A turf can have only one closure for a particular date
turfClosureSchema.index(
  { turf: 1, date: 1 },
  { unique: true }
);

const TurfClosure = mongoose.model(
  "TurfClosure",
  turfClosureSchema
);

export default TurfClosure;