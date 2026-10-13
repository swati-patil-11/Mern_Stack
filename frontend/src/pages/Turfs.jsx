import { useEffect, useState } from "react";
import { getTurfs } from "../api/api.js";

function Turfs() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");

  const fetchTurfs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTurfs({
        search,
        sport,
        location
      });

      setTurfs(response.data.turfs || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load turfs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurfs();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTurfs();
  };

  return (
    <div className="turfs-page">

      <section className="turfs-header">
        <h1>Find Your Turf</h1>

        <p>
          Discover the best sports turfs
          and book your game.
        </p>
      </section>

      <section className="search-section">

        <form
          className="search-form"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            placeholder="Search turf..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={sport}
            onChange={(e) =>
              setSport(e.target.value)
            }
          >
            <option value="">
              All Sports
            </option>

            <option value="Football">
              Football
            </option>

            <option value="Cricket">
              Cricket
            </option>

            <option value="Badminton">
              Badminton
            </option>

            <option value="Basketball">
              Basketball
            </option>
          </select>

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />

          <button type="submit">
            Search
          </button>

        </form>

      </section>

      <section className="turfs-container">

        {loading && (
          <div className="status-message">
            Loading turfs...
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          turfs.length === 0 && (
            <div className="status-message">
              No turfs found.
            </div>
          )}

        {!loading &&
          turfs.length > 0 && (

          <div className="turf-grid">

            {turfs.map((turf) => (

              <div
                className="turf-card"
                key={turf._id}
              >

                <div className="turf-image">

                  {turf.image ? (
                    <img
                      src={turf.image}
                      alt={turf.name}
                    />
                  ) : (
                    <div className="no-image">
                      ⚽
                    </div>
                  )}

                </div>

                <div className="turf-content">

                  <h2>{turf.name}</h2>

                  <p className="turf-location">
                    📍 {turf.location}
                  </p>

                  <p className="turf-description">
                    {turf.description}
                  </p>

                  <div className="turf-sports">

                    {turf.sports?.map(
                      (item, index) => (
                        <span key={index}>
                          {item}
                        </span>
                      )
                    )}

                  </div>

                  <div className="turf-bottom">

                    <div>
                      <strong>
                        ₹{turf.pricePerHour}
                      </strong>

                      <span>
                        / hour
                      </span>
                    </div>

                    <div className="turf-rating">
                      ⭐ {turf.rating || 0}
                    </div>

                  </div>

                  <button
                    className="view-btn"
                    onClick={() =>
                      window.location.href =
                        `/turfs/${turf._id}`
                    }
                  >
                    View Turf
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Turfs;