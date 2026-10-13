import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyBookings,
  cancelBooking
} from "../api/api.js";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyBookings();

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setCancelling(bookingId);
      setError("");
      setSuccess("");

      const response = await cancelBooking(bookingId);

      setSuccess(
        response.data.message ||
        "Booking cancelled successfully."
      );

      await fetchBookings();
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to cancel booking."
      );
    } finally {
      setCancelling("");
    }
  };

  const getStatusClass = (status) => {
    if (status === "confirmed") {
      return "status-confirmed";
    }

    if (status === "cancelled") {
      return "status-cancelled";
    }

    return "status-completed";
  };

  if (loading) {
    return (
      <div className="status-message">
        Loading your bookings...
      </div>
    );
  }

  return (
    <div className="my-bookings-page">

      <section className="bookings-header">
        <h1>My Bookings</h1>

        <p>
          View and manage your turf bookings.
        </p>
      </section>

      <section className="bookings-container">

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="empty-bookings">

            <div className="empty-icon">
              📅
            </div>

            <h2>No Bookings Yet</h2>

            <p>
              You haven't booked any turf yet.
            </p>

            <Link
              to="/turfs"
              className="browse-turfs-btn"
            >
              Browse Turfs
            </Link>

          </div>
        ) : (

          <div className="bookings-list">

            {bookings.map((booking) => (

              <div
                className="booking-item"
                key={booking._id}
              >

                <div className="booking-item-image">

                  {booking.turf?.image ? (
                    <img
                      src={booking.turf.image}
                      alt={booking.turf.name}
                    />
                  ) : (
                    <div className="booking-item-no-image">
                      ⚽
                    </div>
                  )}

                </div>

                <div className="booking-item-content">

                  <div className="booking-item-top">

                    <div>
                      <h2>
                        {booking.turf?.name ||
                          "Turf"}
                      </h2>

                      <p>
                        📍{" "}
                        {booking.turf?.location ||
                          "Location unavailable"}
                      </p>
                    </div>

                    <span
                      className={`booking-status ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>

                  </div>

                  <div className="booking-info-grid">

                    <div>
                      <span>Date</span>
                      <strong>
                        📅 {booking.bookingDate}
                      </strong>
                    </div>

                    <div>
                      <span>Time</span>
                      <strong>
                        🕐 {booking.startTime} -{" "}
                        {booking.endTime}
                      </strong>
                    </div>

                    <div>
                      <span>Amount</span>
                      <strong className="booking-amount">
                        ₹{booking.amount}
                      </strong>
                    </div>

                    <div>
                      <span>Payment</span>
                      <strong>
                        {booking.paymentStatus}
                      </strong>
                    </div>

                  </div>

                  <div className="booking-item-bottom">

                    <Link
                      to={`/turfs/${booking.turf?._id}`}
                      className="booking-view-btn"
                    >
                      View Turf
                    </Link>

                    {booking.status ===
                      "confirmed" && (
                      <button
                        className="cancel-booking-btn"
                        onClick={() =>
                          handleCancel(booking._id)
                        }
                        disabled={
                          cancelling === booking._id
                        }
                      >
                        {cancelling === booking._id
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default MyBookings;