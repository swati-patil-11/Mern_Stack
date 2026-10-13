import ManageClosures from "./pages/owner/ManageClosures.jsx";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Turfs from "./pages/Turfs.jsx";
import TurfDetails from "./pages/TurfDetails.jsx";
import Booking from "./pages/Booking.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import OwnerDashboard from "./pages/owner/OwnerDashboard.jsx";
import AddTurf from "./pages/owner/AddTurf.jsx";
import EditTurf from "./pages/owner/EditTurf.jsx";
import OwnerBookings from "./pages/owner/OwnerBookings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
         path="/turfs"
         element={<Turfs />}
        />

        <Route
         path="/turfs/:id"
         element={<TurfDetails />}
        />

    <Route
  path="/booking/:id"
  element={
    <ProtectedRoute>
      <Booking />
    </ProtectedRoute>
  }
/>
      <Route
  path="/my-bookings"
  element={
    <ProtectedRoute>
      <MyBookings />
    </ProtectedRoute>
  }
/>

        <Route
          path="/owner/dashboard"
          element={
          <ProtectedRoute allowedRoles={["owner", "admin"]}>
          <OwnerDashboard />
        </ProtectedRoute>
  }
/>

        <Route
  path="/owner/add-turf"
  element={
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <AddTurf />
    </ProtectedRoute>
  }
/>
<Route
  path="/owner/edit-turf/:id"
  element={
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <EditTurf />
    </ProtectedRoute>
  }
/>

        <Route
  path="/owner/bookings"
  element={
    <ProtectedRoute allowedRoles={["owner", "admin"]}>
      <OwnerBookings />
    </ProtectedRoute>
  }
/>

<Route
  path="/owner/holidays"
  element={
    <ProtectedRoute
      allowedRoles={["owner", "admin"]}
    >
      <ManageClosures />
    </ProtectedRoute>
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;