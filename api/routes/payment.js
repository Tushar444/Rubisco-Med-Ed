import express from "express";
import crypto from "crypto";
import { instance } from "../index.js";
import sql from "../connect.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };

  try {
    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Order creation failed:", error.message);
    res.status(500).json({ success: false, error: "Order creation failed" });
  }
});

router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    user_id,
    chapter_id,
  } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    try {
      await sql`
        INSERT INTO purchases (
          user_id,
          chapter_id,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          status,
          created_at
        ) VALUES (
          ${user_id},
          ${chapter_id},
          ${razorpay_order_id},
          ${razorpay_payment_id},
          ${razorpay_signature},
          'success',
          NOW()
        )
        ON CONFLICT (user_id, chapter_id) DO UPDATE
        SET status = 'success', razorpay_payment_id = ${razorpay_payment_id}, razorpay_signature = ${razorpay_signature}, created_at = NOW();
      `;

      return res.json({ status: "success" });
    } catch (error) {
      console.error("DB insert error:", error.message);
      return res
        .status(500)
        .json({ status: "error", error: "DB insert failed" });
    }
  } else {
    return res
      .status(400)
      .json({ status: "failure", error: "Invalid signature" });
  }
});

export default router;
