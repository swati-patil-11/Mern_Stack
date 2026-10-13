import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const {
    user,
    isAuthenticated,
    logout
  } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">

      <div className="navbar-container">

        {/* Logo */}

        <Link
          to="/"
          className="logo"
        >
          ⚽ Turfly
        </Link>


        {/* Navigation */}

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/turfs">
            Turfs
          </Link>

          {isAuthenticated && (
            <Link to="/my-bookings">
              My Bookings
            </Link>
          )}

          {/* Owner Dashboard */}

          {isAuthenticated &&
            user?.role === "owner" && (
              <Link to="/owner/dashboard">
                Owner Dashboard
              </Link>
            )}

        </div>


        {/* User section */}

        <div className="nav-user">

          {isAuthenticated ? (
            <>
              <span>
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-btn"
              >
                Register
              </Link>
            </>
          )}

        </div>

      </div>

    </nav>
  );
}

export default Navbar;