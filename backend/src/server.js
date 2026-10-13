import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import turfRoutes from "./routes/turfRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import turfClosureRoutes from "./routes/turfClosureRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";



connectDB();



const app = express();



app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);

app.use(express.json());




app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Turfly API",
  });
});


app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Turfly server is running",
  });
});




// Authentication
app.use(
  "/api/auth",
  authRoutes
);


// Turf APIs
app.use(
  "/api/turfs",
  turfRoutes
);


// Booking APIs
app.use(
  "/api/bookings",
  bookingRoutes
);


// Review APIs
app.use(
  "/api/reviews",
  reviewRoutes
);


// Turf closure APIs
app.use(
  "/api/closures",
  turfClosureRoutes
);


// Razorpay payment APIs
app.use(
  "/api/payments",
  paymentRoutes
);




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Turfly server running on http://localhost:${PORT}`
  );
});