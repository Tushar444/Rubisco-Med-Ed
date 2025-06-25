import express from "express";
import sql from "../connect.js";
import jwtCheck from "../middlewares/auth.js";

const router = express.Router();

router.post("/", jwtCheck, async (req, res) => {
  const user_id = req.auth?.payload?.sub;
  const email = req.auth?.payload.email;

  if (!user_id || !email) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid token payload" });
  }

  try {
    const result =
      await sql`SELECT * FROM users WHERE email = ${email} AND user_id = ${user_id}`;

    if (result.length === 0) {
      await sql`INSERT INTO users (email, user_id) VALUES (${email}, ${user_id})`;
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("User insert error:", error);
    res.status(500).json({ success: false, error: "DB error" });
  }
});

export default router;
