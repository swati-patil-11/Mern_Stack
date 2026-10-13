import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { loadRazorpay } from "../utils/razorpay";

import {
  getTurfById,
  checkAvailability,
  createBooking
} from "../api/api.js";

import { useAuth } from "../context/AuthContext.jsx";

function Booking() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [turf, setTurf] = useState(null);

  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [available, setAvailable] = useState(null);

  const [isClosed, setIsClosed] = useState(false);
  const [closureReason, setClosureReason] = useState("");

  const [amount, setAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // LOAD TURF DETAILS
  // ==========================================

  useEffect(() => {
    const fetchTurf = async () => {
      try {
        const response = await getTurfById(id);

        setTurf(response.data.turf);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load turf."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTurf();
  }, [id]);

  // ==========================================
  // TIME CONVERTER
  // ==========================================

  const timeToMinutes = (time) => {
    const [hours, minutes] = time
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  };

  // ==========================================
  // CALCULATE AMOUNT
  // ==========================================

  useEffect(() => {
    if (!startTime || !endTime || !turf) {
      setAmount(0);
      return;
    }

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end > start) {
      const duration = (end - start) / 60;

      setAmount(
        Math.round(
          duration * turf.pricePerHour
        )
      );
    } else {
      setAmount(0);
    }
  }, [startTime, endTime, turf]);

  // ==========================================
  // HANDLE DATE CHANGE
  // ==========================================

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    setBookingDate(selectedDate);

    setAvailable(null);
    setIsClosed(false);
    setClosureReason("");

    setError("");
    setSuccess("");
  };

  // ==========================================
  // HANDLE START TIME CHANGE
  // ==========================================

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);

    setAvailable(null);

    setError("");
    setSuccess("");
  };

  // ==========================================
  // HANDLE END TIME CHANGE
  // ==========================================

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);

    setAvailable(null);

    setError("");
    setSuccess("");
  };

  // ==========================================
  // CHECK AVAILABILITY
  // ==========================================

  const handleCheckAvailability = async () => {
    setError("");
    setSuccess("");
    setAvailable(null);

    setIsClosed(false);
    setClosureReason("");

    if (!bookingDate) {
      setError(
        "Please select a booking date."
      );
      return;
    }

    if (!startTime || !endTime) {
      setError(
        "Please select start and end time."
      );
      return;
    }

    if (
      timeToMinutes(endTime) <=
      timeToMinutes(startTime)
    ) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    try {
      setChecking(true);

      const response =
        await checkAvailability(
          id,
          bookingDate
        );

      // ==========================================
      // CHECK TURF CLOSURE
      // ==========================================

      if (response.data.isClosed) {
        setIsClosed(true);

        setClosureReason(
          response.data.closure?.reason ||
            "Turf unavailable"
        );

        setAvailable(false);

        return;
      }

      // ==========================================
      // GET BOOKED SLOTS
      // ==========================================

      const existingBookings =
        response.data.bookedSlots || [];

      const requestedStart =
        timeToMinutes(startTime);

      const requestedEnd =
        timeToMinutes(endTime);

      // ==========================================
      // CHECK TIME OVERLAP
      // ==========================================

      const conflict =
        existingBookings.some(
          (booking) => {
            const existingStart =
              timeToMinutes(
                booking.startTime
              );

            const existingEnd =
              timeToMinutes(
                booking.endTime
              );

            return (
              requestedStart <
                existingEnd &&
              requestedEnd >
                existingStart
            );
          }
        );

      if (conflict) {
        setAvailable(false);

        setError(
          "This time slot is already booked."
        );
      } else {
        setAvailable(true);

        setSuccess(
          "This time slot is available!"
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Could not check availability."
      );
    } finally {
      setChecking(false);
    }
  };

  // ==========================================
  // HANDLE PAYMENT
  // ==========================================

  const handlePayment = async () => {
    try {
      setError("");
      setSuccess("");

      // ==========================================
      // LOAD RAZORPAY SDK
      // ==========================================

      const isLoaded =
        await loadRazorpay();

      if (!isLoaded) {
        setError(
          "Razorpay SDK failed to load."
        );

        setBooking(false);
        return;
      }

      // ==========================================
      // VALIDATE AMOUNT
      // ==========================================

      if (!amount || amount <= 0) {
        setError(
          "Invalid booking amount."
        );

        setBooking(false);
        return;
      }

      // ==========================================
      // CHECK FRONTEND RAZORPAY KEY
      // ==========================================

      const razorpayKey =
        import.meta.env
          .VITE_RAZORPAY_KEY_ID;

      console.log(
        "Razorpay Key:",
        razorpayKey
      );

      if (!razorpayKey) {
        setError(
          "Razorpay Key ID is missing. Check frontend/.env and restart Vite."
        );

        setBooking(false);
        return;
      }

      // ==========================================
      // CREATE RAZORPAY ORDER
      // ==========================================

      const response = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            amount: amount
          })
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Failed to create payment order."
        );

        setBooking(false);
        return;
      }

      // ==========================================
      // RAZORPAY OPTIONS
      // ==========================================

      const options = {
        key: razorpayKey,

        amount:
          data.order.amount,

        currency:
          data.order.currency,

        name: "Turfly",

        description:
          `Turf Booking - ${turf.name}`,

        order_id:
          data.order.id,

        // ==========================================
        // PAYMENT SUCCESS
        // ==========================================

        handler:
          async function (
            paymentResponse
          ) {
            try {
              console.log(
                "Payment Response:",
                paymentResponse
              );

              // ==========================================
              // VERIFY PAYMENT
              // ==========================================

              const verifyResponse =
                await fetch(
                  "http://localhost:5000/api/payments/verify-payment",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json"
                    },

                    body:
                      JSON.stringify(
                        paymentResponse
                      )
                  }
                );

              const verifyData =
                await verifyResponse.json();

              if (
                !verifyResponse.ok ||
                !verifyData.success
              ) {
                setError(
                  verifyData.message ||
                    "Payment verification failed."
                );

                setBooking(false);
                return;
              }

              // ==========================================
              // PAYMENT VERIFIED
              // ==========================================

              setSuccess(
                "Payment successful! Creating booking..."
              );

              // ==========================================
              // CREATE BOOKING
              // ==========================================

              const bookingResponse =
                await createBooking({
                  turfId: id,

                  bookingDate:
                    bookingDate,

                  startTime:
                    startTime,

                  endTime:
                    endTime,

                  paymentId:
                    paymentResponse
                      .razorpay_payment_id,

                  orderId:
                    paymentResponse
                      .razorpay_order_id,

                  paymentStatus: "paid"
                });

              if (
                !bookingResponse.data.success
              ) {
                setError(
                  "Payment completed but booking could not be created."
                );

                setBooking(false);
                return;
              }

              // ==========================================
              // SUCCESS
              // ==========================================

              setSuccess(
                "Payment successful! Booking confirmed."
              );

              setTimeout(() => {
                navigate(
                  "/my-bookings"
                );
              }, 1500);

            } catch (error) {
              console.error(
                "Booking creation error:",
                error
              );

              setError(
                error.response?.data
                  ?.message ||
                  "Payment was successful, but booking creation failed."
              );

              setBooking(false);
            }
          },

        // ==========================================
        // PREFILL
        // ==========================================

        prefill: {
          name: "Test User",

          email: "test@example.com",

          contact: "9999999999"
        },

        // ==========================================
        // THEME
        // ==========================================

        theme: {
          color: "#3399cc"
        },

        // ==========================================
        // MODAL
        // ==========================================

        modal: {
          ondismiss: function () {
            setBooking(false);

            setError(
              "Payment cancelled."
            );
          }
        }
      };

      // ==========================================
      // CREATE RAZORPAY INSTANCE
      // ==========================================

      const razorpay =
        new window.Razorpay(options);

      // ==========================================
      // PAYMENT FAILED
      // ==========================================

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          setBooking(false);

          setError(
            response.error
              ?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      // ==========================================
      // OPEN RAZORPAY
      // ==========================================

      razorpay.open();

    } catch (error) {
      console.error(
        "Payment Error:",
        error
      );

      setBooking(false);

      setError(
        error.message ||
          "Something went wrong with payment."
      );
    }
  };

  // ==========================================
  // HANDLE BOOKING
  // ==========================================

  const handleBooking = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isClosed) {
      setError(
        `This turf is unavailable on ${bookingDate}.`
      );
      return;
    }

    if (
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      setError(
        "Please select date, start time and end time."
      );
      return;
    }

    if (
      timeToMinutes(endTime) <=
      timeToMinutes(startTime)
    ) {
      setError(
        "End time must be later than start time."
      );
      return;
    }

    if (available !== true) {
      setError(
        "Please check availability before booking."
      );
      return;
    }

    if (!amount || amount <= 0) {
      setError(
        "Invalid booking amount."
      );
      return;
    }

    try {
      setBooking(true);

      await handlePayment();
    } catch (error) {
      console.error(
        "Booking Error:",
        error
      );

      setBooking(false);

      setError(
        error.message ||
          "Unable to process booking."
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="status-message">
        Loading booking page...
      </div>
    );
  }

  // ==========================================
  // TURF NOT FOUND
  // ==========================================

  if (!turf) {
    return (
      <div className="status-message">
        <div className="error-message">
          {error || "Turf not found."}
        </div>

        <Link
          to="/turfs"
          className="back-link"
        >
          ← Back to Turfs
        </Link>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="booking-page">

      {/* HEADER */}

      <section className="booking-header">
        <h1>
          Book Your Turf
        </h1>

        <p>
          Select your preferred date and time.
        </p>
      </section>

      {/* MAIN CONTAINER */}

      <section className="booking-container">

        {/* TURF INFORMATION */}

        <div className="booking-turf-card">

          <div className="booking-turf-image">

            {turf.image ? (
              <img
                src={turf.image}
                alt={turf.name}
              />
            ) : (
              <div className="booking-no-image">
                ⚽
              </div>
            )}

          </div>

          <div className="booking-turf-content">

            <h2>
              {turf.name}
            </h2>

            <p>
              📍 {turf.location}
            </p>

            <div className="booking-price-info">

              <strong>
                ₹{turf.pricePerHour}
              </strong>

              <span>
                / hour
              </span>

            </div>

            <p className="booking-timing">
              🕐 {turf.openingTime} -{" "}
              {turf.closingTime}
            </p>

          </div>

        </div>

        {/* BOOKING FORM */}

        <div className="booking-form-card">

          <h2>
            Select Date & Time
          </h2>

          {/* ERROR */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          {/* HOLIDAY MESSAGE */}

          {isClosed && (
            <div className="closure-message">

              <div className="closure-message-icon">
                📅
              </div>

              <div>

                <strong>
                  Turf Unavailable
                </strong>

                <p>
                  This turf is unavailable on{" "}
                  <strong>
                    {bookingDate}
                  </strong>.
                </p>

                <p>
                  Reason:{" "}
                  <strong>
                    {closureReason}
                  </strong>
                </p>

              </div>

            </div>
          )}

          <form onSubmit={handleBooking}>

            {/* DATE */}

            <div className="form-group">

              <label>
                Booking Date
              </label>

              <input
                type="date"
                value={bookingDate}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={
                  handleDateChange
                }
                required
              />

            </div>

            {/* TIME */}

            <div className="time-inputs">

              <div className="form-group">

                <label>
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  min={turf.openingTime}
                  max={turf.closingTime}
                  onChange={
                    handleStartTimeChange
                  }
                  disabled={isClosed}
                  required
                />

              </div>

              <div className="form-group">

                <label>
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  min={turf.openingTime}
                  max={turf.closingTime}
                  onChange={
                    handleEndTimeChange
                  }
                  disabled={isClosed}
                  required
                />

              </div>

            </div>

            {/* CHECK AVAILABILITY */}

            <button
              type="button"
              className="availability-btn"
              onClick={
                handleCheckAvailability
              }
              disabled={
                checking ||
                isClosed
              }
            >
              {checking
                ? "Checking..."
                : "Check Availability"}
            </button>

            {/* CLOSED STATUS */}

            {isClosed && (
              <div className="unavailable-box">
                ✕ Turf Unavailable
              </div>
            )}

            {/* AVAILABLE STATUS */}

            {!isClosed &&
              available === true && (
                <div className="available-box">
                  ✓ Slot Available
                </div>
              )}

            {/* SLOT NOT AVAILABLE */}

            {!isClosed &&
              available === false && (
                <div className="unavailable-box">
                  ✕ Slot Not Available
                </div>
              )}

            {/* AMOUNT */}

            <div className="amount-box">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{amount}
              </strong>

            </div>

            {/* CONFIRM BOOKING */}

            <button
              type="submit"
              className="confirm-booking-btn"
              disabled={
                booking ||
                isClosed ||
                available !== true ||
                amount <= 0
              }
            >
              {booking
                ? "Processing Payment..."
                : "Confirm Booking"}
            </button>

          </form>

          {/* BACK TO TURF */}

          <Link
            to={`/turfs/${id}`}
            className="back-link"
          >
            ← Back to Turf
          </Link>

        </div>

      </section>

    </div>
  );
}

export default Booking;