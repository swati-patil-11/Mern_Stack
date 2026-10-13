import "dotenv/config";

import Razorpay from "razorpay";
import crypto from "crypto";




if (!process.env.RAZORPAY_KEY_ID) {
  console.error(
    "ERROR: RAZORPAY_KEY_ID is missing from backend/.env"
  );
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error(
    "ERROR: RAZORPAY_KEY_SECRET is missing from backend/.env"
  );
}



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});



export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required."
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order =
      await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error(
      "Razorpay Create Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create Razorpay order.",
      error: error.message
    });
  }
};



export const verifyPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validate payment details
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment details are missing."
      });
    }

    // Create signature body
    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    // Generate expected signature
    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    // Compare signatures
    if (
      expectedSignature !==
      razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment signature."
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment verified successfully."
    });

  } catch (error) {
    console.error(
      "Razorpay Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Payment verification failed."
    });
  }
};