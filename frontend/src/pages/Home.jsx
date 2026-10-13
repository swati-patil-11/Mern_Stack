import {
  Link
} from "react-router-dom";

function Home() {

  return (

    <div className="home">

      {/* Hero Section */}

      <section className="hero">

        <div className="hero-content">

          <h1>
            Book Your Perfect
            <span> Turf </span>
            Anytime
          </h1>

          <p>
            Find nearby sports turfs,
            check available slots and
            book your game in just a
            few clicks.
          </p>

          <Link
            to="/turfs"
            className="hero-btn"
          >
            Find a Turf
          </Link>

        </div>

      </section>


      {/* Features */}

      <section className="features">

        <h2>
          Why Choose Turfly?
        </h2>

        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon">
              📍
            </div>

            <h3>
              Find Nearby Turfs
            </h3>

            <p>
              Discover sports turfs
              around your location.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🕐
            </div>

            <h3>
              Check Availability
            </h3>

            <p>
              View available time slots
              before booking.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📅
            </div>

            <h3>
              Easy Booking
            </h3>

            <p>
              Book your preferred turf
              quickly and easily.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              ⭐
            </div>

            <h3>
              Ratings & Reviews
            </h3>

            <p>
              Choose turfs based on
              ratings and reviews.
            </p>

          </div>

        </div>

      </section>

    </div>

  );
}

export default Home;