import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createTurf } from "../../api/api.js";

function AddTurf() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    sports: "",
    pricePerHour: "",
    image: "",
    facilities: "",
    openingTime: "06:00",
    closingTime: "23:00"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Please enter turf name.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter turf location.");
      return;
    }

    if (!formData.pricePerHour) {
      setError("Please enter price per hour.");
      return;
    }

    try {
      setLoading(true);

      const turfData = {
        name: formData.name.trim(),

        description: formData.description.trim(),

        location: formData.location.trim(),

        sports: formData.sports
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        pricePerHour: Number(
          formData.pricePerHour
        ),

        image: formData.image.trim(),

        facilities: formData.facilities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        openingTime: formData.openingTime,

        closingTime: formData.closingTime
      };

      await createTurf(turfData);

      navigate("/owner/dashboard");

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to create turf."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-form-page">

      <div className="owner-form-container">

        <div className="owner-form-header">

          <div>
            <h1>Add New Turf</h1>

            <p>
              Add your sports turf to Turfly.
            </p>
          </div>

          <Link
            to="/owner/dashboard"
            className="back-dashboard-btn"
          >
            ← Dashboard
          </Link>

        </div>


        {error && (
          <div className="error-message">
            {error}
          </div>
        )}


        <form
          className="owner-form-card"
          onSubmit={handleSubmit}
        >

          {/* Turf Name */}

          <div className="form-group">

            <label>Turf Name *</label>

            <input
              type="text"
              name="name"
              placeholder="e.g. Kolhapur Football Arena"
              value={formData.name}
              onChange={handleChange}
              required
            />

          </div>


          {/* Description */}

          <div className="form-group">

            <label>Description</label>

            <textarea
              name="description"
              rows="4"
              placeholder="Describe your turf..."
              value={formData.description}
              onChange={handleChange}
            />

          </div>


          {/* Location */}

          <div className="form-group">

            <label>Location *</label>

            <input
              type="text"
              name="location"
              placeholder="e.g. Rajarampuri, Kolhapur"
              value={formData.location}
              onChange={handleChange}
              required
            />

          </div>


          {/* Sports */}

          <div className="form-group">

            <label>
              Sports
            </label>

            <input
              type="text"
              name="sports"
              placeholder="Football, Cricket, Basketball"
              value={formData.sports}
              onChange={handleChange}
            />

            <small>
              Separate multiple sports using commas.
            </small>

          </div>


          {/* Price */}

          <div className="form-group">

            <label>
              Price Per Hour (₹) *
            </label>

            <input
              type="number"
              name="pricePerHour"
              placeholder="800"
              min="0"
              value={formData.pricePerHour}
              onChange={handleChange}
              required
            />

          </div>


          {/* Image */}

          <div className="form-group">

            <label>
              Turf Image URL
            </label>

            <input
              type="url"
              name="image"
              placeholder="https://example.com/turf.jpg"
              value={formData.image}
              onChange={handleChange}
            />

          </div>


          {/* Facilities */}

          <div className="form-group">

            <label>
              Facilities
            </label>

            <input
              type="text"
              name="facilities"
              placeholder="Flood Lights, Parking, Changing Room"
              value={formData.facilities}
              onChange={handleChange}
            />

            <small>
              Separate multiple facilities using commas.
            </small>

          </div>


          {/* Timing */}

          <div className="time-inputs">

            <div className="form-group">

              <label>
                Opening Time
              </label>

              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                Closing Time
              </label>

              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
              />

            </div>

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="create-turf-btn"
            disabled={loading}
          >
            {loading
              ? "Adding Turf..."
              : "Add Turf"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default AddTurf;