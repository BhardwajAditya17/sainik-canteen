// backend/src/routes/webhook.routes.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

router.post("/razorpay", (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  const generatedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (generatedSignature === signature) {
    console.log("Webhook verified:", req.body.event);

    // TODO: update order status in DB
    res.status(200).json({ message: "ok" });
  } else {
    res.status(400).json({ message: "Invalid signature" });
  }
});

export default router;
