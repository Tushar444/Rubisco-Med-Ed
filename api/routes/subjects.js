import express from "express";
import sql from "../connect.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { year } = req.body;
  try {
    const result = await sql`SELECT name FROM subjects WHERE year = ${year}`;
    const subjectNames = result.map((row) => row.name);
    res.status(200).json(subjectNames);
  } catch (error) {
    console.error("Subject fetch error:", error);
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
