import express from "express";
import sql from "../connect.js";

const router = express.Router();

router.get("/:subjectName", async (req, res) => {
  const { subjectName } = req.params;

  try {
    const chapters =
      await sql`SELECT c.id, c.chapter_name, c.price FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE s.name = ${subjectName};`;

    res.status(200).json(chapters);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
