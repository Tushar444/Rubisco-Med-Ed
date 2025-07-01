import express from "express";
import sql from "../connect.js";
import jwtCheck from "../middlewares/auth.js";

const router = express.Router();

router.get("/", jwtCheck, async (req, res) => {
  const userId = req.auth?.payload?.sub;
  try {
    const result =
      await sql`SELECT chapter_id FROM purchases WHERE user_id = ${userId} AND status = 'success'`;

    const chapterIds = result.map((element) => element.chapter_id);

    res.json({ purchasedChapters: chapterIds });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
