import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getTurfs,
  deleteTurf,
  getOwnerBookings
} from "../../api/api.js";

import { useAuth } from "../../context/AuthContext.jsx";

function OwnerDashboard() {
  const { user } = useAuth();

const [turfs, setTurfs] = useState([]);
const [bookings, setBookings] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

  const fetchMyTurfs = async () => {
  try {
    setLoading(true);
    setError("");

    const [turfResponse, bookingResponse] =
      await Promise.all([
        getTurfs(),
        getOwnerBookings()
      ]);

    const allTurfs =
      turfResponse.data.turfs || [];

    const myTurfs = allTurfs.filter(
      (turf) =>
        turf.owner?._id === user?._id ||
        turf.owner === user?._id
    );

    setTurfs(myTurfs);

    setBookings(
      bookingResponse.data.bookings || []
    );

  } catch (error) {
    console.error(error);

    setError(
      error.response?.data?.message ||
      "Failed to load dashboard data."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (user) {
      fetchMyTurfs();
    }
  }, [user]);

  const handleDelete = async (turfId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this turf?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteTurf(turfId);

      setSuccess(
        "Turf deleted successfully."
      );

      setTurfs((previousTurfs) =>
        previousTurfs.filter(
          (turf) => turf._id !== turfId
        )
      );

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to delete turf."
      );
    }
  };

  const confirmedBookings =
  bookings.filter(
    (booking) => booking.status === "confirmed"
  );

const pendingPayments =
  bookings.filter(
    (booking) =>
      booking.paymentStatus === "pending"
  );

const totalRevenue =
  bookings
    .filter(
      (booking) =>
        booking.paymentStatus === "paid" &&
        booking.status !== "cancelled"
    )
    .reduce(
      (total, booking) =>
        total + (booking.amount || 0),
      0
    );

  if (loading) {
    return (
      <div className="status-message">
        Loading owner dashboard...
      </div>
    );
  }

  return (
    <div className="owner-dashboard">

      {/* Header */}

      <section className="owner-header">

  <div>
    <h1>Owner Dashboard</h1>

    <p>
      Welcome, {user?.name}
    </p>
  </div>

  <div className="owner-header-actions">

    <Link
  to="/owner/holidays"
  className="owner-holidays-btn"
>
  📅 Holidays
</Link>

    <Link
      to="/owner/bookings"
      className="owner-bookings-btn"
    >
      📅 Bookings
    </Link>

    <Link
      to="/owner/add-turf"
      className="add-turf-btn"
    >
      + Add New Turf
    </Link>

  </div>

</section>


      {/* Statistics */}
<section className="owner-stats">

  <div className="owner-stat-card">
    <div className="owner-stat-icon">
      ⚽
    </div>

    <div>
      <span>Total Turfs</span>

      <strong>
        {turfs.length}
      </strong>
    </div>
  </div>


  <div className="owner-stat-card">
    <div className="owner-stat-icon">
      📅
    </div>

    <div>
      <span>Total Bookings</span>

      <strong>
        {bookings.length}
      </strong>
    </div>
  </div>


  <div className="owner-stat-card">
    <div className="owner-stat-icon">
      ✅
    </div>

    <div>
      <span>Confirmed</span>

      <strong>
        {confirmedBookings.length}
      </strong>
    </div>
  </div>


  <div className="owner-stat-card">
    <div className="owner-stat-icon">
      💰
    </div>

    <div>
      <span>Total Revenue</span>

      <strong>
        ₹{totalRevenue}
      </strong>
    </div>
  </div>


  <div className="owner-stat-card">
    <div className="owner-stat-icon">
      ⏳
    </div>

    <div>
      <span>Pending Payments</span>

      <strong>
        {pendingPayments.length}
      </strong>
    </div>
  </div>

</section>


      {/* Messages */}

      <section className="owner-content">

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


        {/* Turf list */}

        <div className="owner-section-header">

          <div>
            <h2>My Turfs</h2>

            <p>
              Manage your registered sports turfs.
            </p>
          </div>

          <Link
            to="/owner/add-turf"
            className="add-turf-small-btn"
          >
            + Add Turf
          </Link>

        </div>


        {turfs.length === 0 ? (

          <div className="owner-empty">

            <div className="empty-icon">
              ⚽
            </div>

            <h2>No Turfs Yet</h2>

            <p>
              Add your first turf to start
              accepting bookings.
            </p>

            <Link
              to="/owner/add-turf"
              className="add-turf-btn"
            >
              Add Your First Turf
            </Link>

          </div>

        ) : (

          <div className="owner-turf-grid">

            {turfs.map((turf) => (

              <div
                className="owner-turf-card"
                key={turf._id}
              >

                <div className="owner-turf-image">

                  {turf.image ? (
                    <img
                      src={turf.image}
                      alt={turf.name}
                    />
                  ) : (
                    <div className="owner-no-image">
                      ⚽
                    </div>
                  )}

                </div>

                <div className="owner-turf-content">

                  <div className="owner-turf-title">

                    <h3>
                      {turf.name}
                    </h3>

                    <span>
                      ⭐ {turf.rating || 0}
                    </span>

                  </div>

                  <p>
                    📍 {turf.location}
                  </p>

                  <p>
                    ₹{turf.pricePerHour} / hour
                  </p>

                  <div className="owner-turf-actions">

                    <Link
                      to={`/turfs/${turf._id}`}
                      className="owner-view-btn"
                    >
                      View
                    </Link>

                    <Link
                      to={`/owner/edit-turf/${turf._id}`}
                      className="owner-edit-btn"
                    >
                      Edit
                    </Link>

                    <button
                      className="owner-delete-btn"
                      onClick={() =>
                        handleDelete(turf._id)
                      }
                    >
                      Delete
                    </button>

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

export default OwnerDashboard;