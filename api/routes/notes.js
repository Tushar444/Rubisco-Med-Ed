import express from "express";
import path from "path";
import sql from "../connect.js";
import { google } from "googleapis";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import jwtCheck from "../middlewares/auth.js";

dotenv.config();

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

router.get("/:chapterId", jwtCheck, async (req, res) => {
  const chapterId = req.params.chapterId;
  const userId = req.auth?.payload?.sub;
  try {
    const purchase = await sql`
      SELECT 1 FROM purchases
      WHERE user_id = ${userId} AND chapter_id = ${chapterId} AND status = 'success'
      LIMIT 1;
    `;

    if (purchase.length === 0) {
      return res.status(403).send("Access denied: Chapter not purchased");
    }

    const result = await sql`
      SELECT pdf_drive_id FROM chapters WHERE id = ${chapterId};
    `;

    if (result.length === 0 || !result[0].pdf_drive_id) {
      return res.status(404).send("Chapter not found or PDF missing");
    }

    const driveId = result[0].pdf_drive_id;

    const drive = google.drive({ version: "v3", auth });

    const fileStream = await drive.files.get(
      { fileId: driveId, alt: "media" },
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="notes.pdf"`);

    fileStream.data.pipe(res);
  } catch (error) {
    console.error("Failed to serve PDF:", error.message);
    res.status(500).send("Internal server error");
  }
});

export default router;
