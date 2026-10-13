import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});


// ========================================
// ADD JWT TOKEN AUTOMATICALLY
// ========================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ========================================
// AUTH APIs
// ========================================

export const registerUser = (data) =>
  API.post("/auth/register", data);

export const loginUser = (data) =>
  API.post("/auth/login", data);

export const getCurrentUser = () =>
  API.get("/auth/me");


// ========================================
// TURF APIs
// ========================================

export const getTurfs = (params = {}) =>
  API.get("/turfs", {
    params
  });

export const getTurfById = (id) =>
  API.get(`/turfs/${id}`);

export const createTurf = (data) =>
  API.post("/turfs", data);

export const updateTurf = (id, data) =>
  API.put(`/turfs/${id}`, data);

export const deleteTurf = (id) =>
  API.delete(`/turfs/${id}`);


// ========================================
// BOOKING APIs
// ========================================

export const checkAvailability = (
  turfId,
  bookingDate
) =>
  API.get("/bookings/availability", {
    params: {
      turfId,
      bookingDate
    }
  });

export const createBooking = (data) =>
  API.post("/bookings", data);

export const getMyBookings = () =>
  API.get("/bookings/my");

export const getOwnerBookings = () =>
  API.get("/bookings/owner");

export const getBookingById = (id) =>
  API.get(`/bookings/${id}`);

export const cancelBooking = (id) =>
  API.put(`/bookings/${id}/cancel`);


// ========================================
// REVIEW APIs
// ========================================

export const getTurfReviews = (turfId) =>
  API.get(`/reviews/turf/${turfId}`);

export const createReview = (data) =>
  API.post("/reviews", data);

export const deleteReview = (id) =>
  API.delete(`/reviews/${id}`);


// ========================================
// TURF CLOSURE / HOLIDAY APIs
// ========================================

export const createTurfClosure = (data) =>
  API.post("/closures", data);

export const getTurfClosures = (turfId) =>
  API.get(`/closures/turf/${turfId}`);

export const deleteTurfClosure = (id) =>
  API.delete(`/closures/${id}`);


// ========================================
// EXPORT API INSTANCE
// ========================================

export default API;