import Booking from "../models/Booking.js";
import Turf from "../models/Turf.js";
import TurfClosure from "../models/TurfClosure.js";

// ==========================================
// CREATE BOOKING
// ==========================================

export const createBooking = async (
  req,
  res
) => {
  try {
    const {
      turfId,
      bookingDate,
      startTime,
      endTime,
      paymentId,
      orderId,
      paymentStatus
    } = req.body;

    // ==========================================
    // VALIDATE BASIC BOOKING DETAILS
    // ==========================================

    if (
      !turfId ||
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Turf, date, start time and end time are required"
      });
    }

    // ==========================================
    // VALIDATE PAYMENT DETAILS
    // ==========================================

    if (
      !paymentId ||
      !orderId ||
      paymentStatus !== "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid payment information is required"
      });
    }

    // ==========================================
    // FIND TURF
    // ==========================================

    const turf =
      await Turf.findById(turfId);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found"
      });
    }

    // ==========================================
    // CHECK TURF CLOSURE
    // ==========================================

    const closure =
      await TurfClosure.findOne({
        turf: turfId,
        date: bookingDate
      });

    if (closure) {
      return res.status(400).json({
        success: false,
        message:
          `This turf is unavailable on ${bookingDate}.`,
        reason: closure.reason
      });
    }

    // ==========================================
    // CONVERT TIME TO MINUTES
    // ==========================================

    const start =
      convertTimeToMinutes(startTime);

    const end =
      convertTimeToMinutes(endTime);

    // ==========================================
    // VALIDATE TIME
    // ==========================================

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time"
      });
    }

    // ==========================================
    // CHECK SLOT OVERLAP
    // ==========================================

    const existingBookings =
      await Booking.find({
        turf: turfId,
        bookingDate,
        status: {
          $in: [
            "pending",
            "confirmed",
            "completed"
          ]
        }
      });

    const conflict =
      existingBookings.some(
        (booking) => {
          const existingStart =
            convertTimeToMinutes(
              booking.startTime
            );

          const existingEnd =
            convertTimeToMinutes(
              booking.endTime
            );

          return (
            start < existingEnd &&
            end > existingStart
          );
        }
      );

    if (conflict) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked"
      });
    }

    // ==========================================
    // CALCULATE AMOUNT ON SERVER
    // ==========================================

    const duration =
      (end - start) / 60;

    const amount =
      Math.round(
        duration * turf.pricePerHour
      );

    // ==========================================
    // CREATE BOOKING
    // ==========================================

    const booking =
      await Booking.create({
        user: req.user._id,

        turf: turfId,

        bookingDate,

        startTime,

        endTime,

        amount,

        status: "confirmed",

        paymentStatus: "paid",

        paymentId,

        orderId
      });

    // ==========================================
    // POPULATE BOOKING
    // ==========================================

    const populatedBooking =
      await booking.populate([
        {
          path: "user",
          select:
            "name email phone"
        },
        {
          path: "turf",
          select:
            "name location pricePerHour image"
        }
      ]);

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking: populatedBooking
    });

  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create booking"
    });
  }
};

// ==========================================
// GET MY BOOKINGS
// ==========================================

export const getMyBookings = async (
  req,
  res
) => {
  try {
    const bookings =
      await Booking.find({
        user: req.user._id
      })
        .populate(
          "turf",
          "name location image pricePerHour"
        )
        .sort({
          bookingDate: -1,
          startTime: -1
        });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error(
      "Get bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch bookings"
    });
  }
};

// ==========================================
// GET SINGLE BOOKING
// ==========================================

export const getBookingById = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      )
        .populate(
          "turf",
          "name location image pricePerHour"
        )
        .populate(
          "user",
          "name email phone"
        );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Only booking owner or admin
    // can view booking
    if (
      req.user.role !== "admin" &&
      booking.user._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this booking"
      });
    }

    return res.status(200).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error(
      "Get booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch booking"
    });
  }
};

// ==========================================
// CANCEL BOOKING
// ==========================================

export const cancelBooking = async (
  req,
  res
) => {
  try {
    const booking =
      await Booking.findById(
        req.params.id
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Only booking owner or admin
    if (
      req.user.role !== "admin" &&
      booking.user.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to cancel this booking"
      });
    }

    if (
      booking.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled"
      });
    }

    booking.status = "cancelled";

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking
    });

  } catch (error) {
    console.error(
      "Cancel booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel booking"
    });
  }
};

// ==========================================
// CHECK SLOT AVAILABILITY
// ==========================================

export const checkAvailability = async (
  req,
  res
) => {
  try {
    const {
      turfId,
      bookingDate
    } = req.query;

    // ==========================================
    // VALIDATE FIELDS
    // ==========================================

    if (!turfId || !bookingDate) {
      return res.status(400).json({
        success: false,
        message:
          "Turf ID and booking date are required"
      });
    }

    // ==========================================
    // FIND TURF
    // ==========================================

    const turf =
      await Turf.findById(turfId);

    if (!turf) {
      return res.status(404).json({
        success: false,
        message: "Turf not found"
      });
    }

    // ==========================================
    // CHECK TURF CLOSURE
    // ==========================================

    const closure =
      await TurfClosure.findOne({
        turf: turfId,
        date: bookingDate
      });

    if (closure) {
      return res.status(200).json({
        success: true,

        isClosed: true,

        closure: {
          date: closure.date,
          reason: closure.reason
        },

        turf: {
          id: turf._id,
          name: turf.name,
          openingTime: turf.openingTime,
          closingTime: turf.closingTime,
          pricePerHour:
            turf.pricePerHour
        },

        bookedSlots: []
      });
    }

    // ==========================================
    // FIND BOOKED SLOTS
    // ==========================================

    const bookings =
      await Booking.find({
        turf: turfId,
        bookingDate,
        status: {
          $in: [
            "confirmed",
            "completed"
          ]
        }
      }).select(
        "startTime endTime status"
      );

    // ==========================================
    // RETURN AVAILABILITY
    // ==========================================

    return res.status(200).json({
      success: true,

      isClosed: false,

      closure: null,

      turf: {
        id: turf._id,
        name: turf.name,
        openingTime: turf.openingTime,
        closingTime: turf.closingTime,
        pricePerHour:
          turf.pricePerHour
      },

      bookedSlots: bookings
    });

  } catch (error) {
    console.error(
      "Availability error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to check availability"
    });
  }
};

// ==========================================
// GET OWNER BOOKINGS
// ==========================================

export const getOwnerBookings = async (
  req,
  res
) => {
  try {
    // Find owner's turfs
    const turfs =
      await Turf.find({
        owner: req.user._id
      }).select("_id");

    const turfIds =
      turfs.map(
        (turf) => turf._id
      );

    const bookings =
      await Booking.find({
        turf: {
          $in: turfIds
        }
      })
        .populate(
          "user",
          "name email phone"
        )
        .populate(
          "turf",
          "name location"
        )
        .sort({
          bookingDate: -1
        });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    console.error(
      "Owner bookings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch bookings"
    });
  }
};

// ==========================================
// TIME CONVERTER
// ==========================================

const convertTimeToMinutes = (
  time
) => {
  const [
    hours,
    minutes
  ] = time.split(":").map(Number);

  return (
    hours * 60 +
    minutes
  );
};