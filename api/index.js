import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import notesRoutes from "./routes/notes.js";
import paymentRoutes from "./routes/payment.js";
import userRoutes from "./routes/user.js";
import subjectsRoutes from "./routes/subjects.js";
import chaptersRoutes from "./routes/chapters.js";
import purchasesRoutes from "./routes/purchases.js";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = 3000;

// health check route for render
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.set("trust proxy", 1);

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP, please try again later.",
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Allow preflight responses too
app.options(/.*/, cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/", apiLimiter);
app.use("/api/notes", notesRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/subjects", subjectsRoutes);
app.use("/api/chapters", chaptersRoutes);
app.use("/api/purchases", purchasesRoutes);

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
