import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // ==========================================
    // TURF
    // ==========================================

    turf: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Turf",
      required: true
    },

    // ==========================================
    // BOOKING DATE
    // ==========================================

    bookingDate: {
      type: String,
      required: true
    },

    // ==========================================
    // START TIME
    // ==========================================

    startTime: {
      type: String,
      required: true
    },

    // ==========================================
    // END TIME
    // ==========================================

    endTime: {
      type: String,
      required: true
    },

    // ==========================================
    // AMOUNT
    // ==========================================

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    // ==========================================
    // BOOKING STATUS
    // ==========================================

    status: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed"
      ],

      default: "pending"
    },

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "failed"
      ],

      default: "pending"
    },

    // ==========================================
    // RAZORPAY PAYMENT ID
    // ==========================================

    paymentId: {
      type: String,
      default: ""
    },

    // ==========================================
    // RAZORPAY ORDER ID
    // ==========================================

    orderId: {
      type: String,
      default: ""
    }
  },

  {
    timestamps: true
  }
);

// ==========================================
// INDEX
// ==========================================

bookingSchema.index({
  turf: 1,
  bookingDate: 1,
  startTime: 1,
  status: 1
});

// ==========================================
// MODEL
// ==========================================

const Booking =
  mongoose.model(
    "Booking",
    bookingSchema
  );

export default Booking;