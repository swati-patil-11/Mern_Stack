import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOwnerBookings } from "../../api/api.js";

function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOwnerBookings();

      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load owner bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="owner-bookings-page">

      <section className="owner-bookings-header">

        <div>
          <h1>Owner Bookings</h1>

          <p>
            View bookings made for your turfs.
          </p>
        </div>

        <Link
          to="/owner/dashboard"
          className="back-dashboard-btn"
        >
          ← Dashboard
        </Link>

      </section>


      <section className="owner-bookings-container">

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (

          <div className="owner-empty">

            <div className="empty-icon">
              📅
            </div>

            <h2>No Bookings Yet</h2>

            <p>
              No users have booked your turfs yet.
            </p>

          </div>

        ) : (

          <div className="owner-bookings-table-wrapper">

            <table className="owner-bookings-table">

              <thead>
                <tr>
                  <th>Turf</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {bookings.map((booking) => (

                  <tr key={booking._id}>

                    <td>
                      <strong>
                        {booking.turf?.name ||
                          "Turf"}
                      </strong>

                      <small>
                        {booking.turf?.location ||
                          ""}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {booking.user?.name ||
                          "User"}
                      </strong>

                      <small>
                        {booking.user?.email ||
                          ""}
                      </small>
                    </td>

                    <td>
                      {booking.bookingDate}
                    </td>

                    <td>
                      {booking.startTime}
                      {" - "}
                      {booking.endTime}
                    </td>

                    <td className="owner-booking-amount">
                      ₹{booking.amount}
                    </td>

                    <td>
                      <span className="payment-status">
                        {booking.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`booking-status ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default OwnerBookings;