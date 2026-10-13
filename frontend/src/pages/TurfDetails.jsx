import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getTurfById,
  getTurfReviews
} from "../api/api.js";
import ReviewForm from "../components/ReviewForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function TurfDetails() {
  const { id } = useParams();

  const { user } = useAuth();

  const [turf, setTurf] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTurfDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const turfResponse = await getTurfById(id);

        setTurf(turfResponse.data.turf);

        try {
          const reviewResponse =
            await getTurfReviews(id);

          setReviews(
            reviewResponse.data.reviews || []
          );
        } catch (reviewError) {
          console.error(
            "Failed to load reviews:",
            reviewError
          );
        }

      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
          "Failed to load turf details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTurfDetails();
  }, [id]);

  const refreshReviews = async () => {
  try {
    const response = await getTurfReviews(id);

    setReviews(
      response.data.reviews || []
    );

    const turfResponse =
      await getTurfById(id);

    setTurf(turfResponse.data.turf);

  } catch (error) {
    console.error(error);
  }
};

  if (loading) {
    return (
      <div className="status-message">
        Loading turf details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-message">
        <div className="error-message">
          {error}
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

  if (!turf) {
    return (
      <div className="status-message">
        Turf not found.
      </div>
    );
  }

  return (
    <div className="turf-details-page">

      {/* Hero Image */}

      <section className="details-image">

        {turf.image ? (
          <img
            src={turf.image}
            alt={turf.name}
          />
        ) : (
          <div className="details-no-image">
            ⚽
          </div>
        )}

      </section>


      {/* Main Details */}

      <section className="details-container">

        <div className="details-main">

          <div className="details-header">

            <div>

              <h1>{turf.name}</h1>

              <p className="details-location">
                📍 {turf.location}
              </p>

            </div>

            <div className="details-rating">
              ⭐ {turf.rating || 0}

              <span>
                ({turf.reviewCount || 0} reviews)
              </span>
            </div>

          </div>


          {/* Description */}

          <div className="details-section">

            <h2>About This Turf</h2>

            <p>
              {turf.description ||
                "No description available."}
            </p>

          </div>


          {/* Sports */}

          <div className="details-section">

            <h2>Sports Available</h2>

            <div className="details-tags">

              {turf.sports?.map(
                (sport, index) => (
                  <span key={index}>
                    ⚽ {sport}
                  </span>
                )
              )}

            </div>

          </div>


          {/* Facilities */}

          <div className="details-section">

            <h2>Facilities</h2>

            <div className="facilities-grid">

              {turf.facilities?.length > 0 ? (
                turf.facilities.map(
                  (facility, index) => (
                    <div
                      className="facility-item"
                      key={index}
                    >
                      ✓ {facility}
                    </div>
                  )
                )
              ) : (
                <p>
                  No facilities listed.
                </p>
              )}

            </div>

          </div>


          {/* Timing */}

          <div className="details-section">

            <h2>Available Timing</h2>

            <div className="timing-box">

              <div>
                <span>Opening Time</span>
                <strong>
                  {turf.openingTime}
                </strong>
              </div>

              <div>
                <span>Closing Time</span>
                <strong>
                  {turf.closingTime}
                </strong>
              </div>

            </div>

          </div>


          {/* Reviews */}

         <div className="details-section">

  <h2>
    Reviews ({reviews.length})
  </h2>

  {reviews.length === 0 ? (
    <p className="no-reviews">
      No reviews yet.
    </p>
  ) : (
    <div className="reviews-list">

      {reviews.map((review) => (

        <div
          className="review-card"
          key={review._id}
        >

          <div className="review-header">

            <strong>
              {review.user?.name || "User"}
            </strong>

            <span>
              ⭐ {review.rating}/5
            </span>

          </div>

          <p>
            {review.comment}
          </p>

        </div>

      ))}

    </div>
  )}

  <ReviewForm
    turfId={id}
    onReviewAdded={refreshReviews}
  />

</div>

        </div>


        {/* Booking Card */}

        <aside className="booking-card">

          <h2>Book This Turf</h2>

          <div className="booking-price">

            <strong>
              ₹{turf.pricePerHour}
            </strong>

            <span>
              / hour
            </span>

          </div>

          <p>
            Select your preferred date
            and time slot.
          </p>

         
{!user ? (
  <Link
    to="/login"
    className="book-now-btn"
  >
    Login to Book
  </Link>
) : user.role === "user" ? (
  <Link
    to={`/booking/${turf._id}`}
    className="book-now-btn"
  >
    Book Now
  </Link>
) : null}
          <Link
            to="/turfs"
            className="back-link"
          >
            ← Back to Turfs
          </Link>

        </aside>

      </section>

    </div>
  );
}

export default TurfDetails;