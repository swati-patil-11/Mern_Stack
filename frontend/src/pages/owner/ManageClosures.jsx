import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getTurfs,
  createTurfClosure,
  getTurfClosures,
  deleteTurfClosure
} from "../../api/api.js";

import { useAuth } from "../../context/AuthContext.jsx";

function ManageClosures() {

  const { user } = useAuth();

  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState("");

  const [closures, setClosures] = useState([]);

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // Load owner's turfs
  const fetchTurfs = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await getTurfs();

      const allTurfs =
        response.data.turfs || [];

      const myTurfs =
        allTurfs.filter(
          (turf) =>
            turf.owner?._id === user?._id ||
            turf.owner === user?._id
        );

      setTurfs(myTurfs);

      if (myTurfs.length > 0) {
        setSelectedTurf(myTurfs[0]._id);
      }

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load your turfs."
      );

    } finally {

      setLoading(false);

    }
  };


  // Load closures for selected turf
  const fetchClosures = async (turfId) => {

    if (!turfId) {
      setClosures([]);
      return;
    }

    try {

      setError("");

      const response =
        await getTurfClosures(turfId);

      setClosures(
        response.data.closures || []
      );

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load holidays."
      );

    }
  };


  useEffect(() => {

    if (user) {
      fetchTurfs();
    }

  }, [user]);


  useEffect(() => {

    if (selectedTurf) {
      fetchClosures(selectedTurf);
    }

  }, [selectedTurf]);


  // Add closure
  const handleAddClosure = async (event) => {

    event.preventDefault();

    if (!selectedTurf) {
      setError("Please select a turf.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    try {

      setSaving(true);
      setError("");
      setSuccess("");

      await createTurfClosure({
        turfId: selectedTurf,
        date,
        reason:
          reason.trim() ||
          "Turf unavailable"
      });

      setSuccess(
        "Turf holiday added successfully."
      );

      setDate("");
      setReason("");

      await fetchClosures(selectedTurf);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to add holiday."
      );

    } finally {

      setSaving(false);

    }
  };


  // Delete closure
  const handleDeleteClosure = async (closureId) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to remove this holiday?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      await deleteTurfClosure(
        closureId
      );

      setSuccess(
        "Holiday removed successfully."
      );

      await fetchClosures(selectedTurf);

    } catch (error) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to remove holiday."
      );

    }
  };


  if (loading) {

    return (
      <div className="status-message">
        Loading holidays...
      </div>
    );

  }


  return (
    <div className="manage-closures-page">

      {/* Header */}

      <section className="manage-closures-header">

        <div>

          <h1>
            Manage Holidays
          </h1>

          <p>
            Mark dates when your turf is unavailable.
          </p>

        </div>

        <Link
          to="/owner/dashboard"
          className="back-dashboard-btn"
        >
          ← Dashboard
        </Link>

      </section>


      {/* Messages */}

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


      <div className="manage-closures-content">

        {/* Add Holiday */}

        <section className="closure-form-card">

          <h2>
            Add Holiday
          </h2>

          <p>
            Select a turf and mark a date as unavailable.
          </p>


          <form
            onSubmit={handleAddClosure}
          >

            <div className="form-group">

              <label>
                Select Turf
              </label>

              <select
                value={selectedTurf}
                onChange={(event) =>
                  setSelectedTurf(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select a turf
                </option>

                {turfs.map((turf) => (

                  <option
                    key={turf._id}
                    value={turf._id}
                  >
                    {turf.name}
                  </option>

                ))}

              </select>

            </div>


            <div className="form-group">

              <label>
                Holiday Date
              </label>

              <input
                type="date"
                value={date}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
              />

            </div>


            <div className="form-group">

              <label>
                Reason
              </label>

              <input
                type="text"
                placeholder="Example: Maintenance"
                value={reason}
                maxLength={200}
                onChange={(event) =>
                  setReason(
                    event.target.value
                  )
                }
              />

            </div>


            <button
              type="submit"
              className="add-closure-btn"
              disabled={saving}
            >
              {saving
                ? "Adding..."
                : "Mark as Unavailable"}
            </button>

          </form>

        </section>


        {/* Existing Holidays */}

        <section className="closures-list-card">

          <div className="closures-list-header">

            <div>

              <h2>
                Upcoming Holidays
              </h2>

              <p>
                Dates when your turf will be unavailable.
              </p>

            </div>

          </div>


          {closures.length === 0 ? (

            <div className="closure-empty">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No Holidays
              </h3>

              <p>
                No holidays have been added for this turf.
              </p>

            </div>

          ) : (

            <div className="closures-list">

              {closures.map((closure) => (

                <div
                  className="closure-item"
                  key={closure._id}
                >

                  <div className="closure-date">

                    <span>
                      📅
                    </span>

                    <strong>
                      {closure.date}
                    </strong>

                  </div>


                  <div className="closure-reason">

                    <span>
                      Reason
                    </span>

                    <strong>
                      {closure.reason}
                    </strong>

                  </div>


                  <button
                    className="delete-closure-btn"
                    onClick={() =>
                      handleDeleteClosure(
                        closure._id
                      )
                    }
                  >
                    Remove
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </div>

    </div>
  );
}

export default ManageClosures;