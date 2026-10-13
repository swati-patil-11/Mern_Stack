import { useState } from "react";
import { createReview } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function ReviewForm({ turfId, onReviewAdded }) {
  const { isAuthenticated } = useAuth();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!isAuthenticated) {
      setError("Please login to submit a review.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter a comment.");
      return;
    }

    try {
      setLoading(true);

      const response = await createReview({
        turfId,
        rating: Number(rating),
        comment: comment.trim()
      });

      setSuccess(
        response.data.message ||
        "Review submitted successfully!"
      );

      setComment("");
      setRating(5);

      if (onReviewAdded) {
        onReviewAdded();
      }

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="review-login-message">
        Please login to write a review.
      </div>
    );
  }

  return (
    <div className="review-form">

      <h3>Write a Review</h3>

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

      <form onSubmit={handleSubmit}>

        <div className="form-group">

          <label>Rating</label>

          <select
            value={rating}
            onChange={(e) =>
              setRating(e.target.value)
            }
          >
            <option value="5">⭐⭐⭐⭐⭐ - 5</option>
            <option value="4">⭐⭐⭐⭐ - 4</option>
            <option value="3">⭐⭐⭐ - 3</option>
            <option value="2">⭐⭐ - 2</option>
            <option value="1">⭐ - 1</option>
          </select>

        </div>

        <div className="form-group">

          <label>Comment</label>

          <textarea
            rows="4"
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            maxLength="500"
            required
          />

        </div>

        <button
          type="submit"
          className="submit-review-btn"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : "Submit Review"}
        </button>

      </form>

    </div>
  );
}

export default ReviewForm;