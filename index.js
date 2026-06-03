import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { initSocket } from "./realtime/socket.js";
import { globalMiddleWare } from "./middleware/globalMiddleWare.js";
import authRouter from "./route/auth.route.js";
import userRouter from "./route/user.route.js";
import categoryRouter from "./route/category.router.js";
import activityRouter from "./route/activity.route.js";
import reviewRouter from "./route/review.routes.js";
import voucherRouter from "./route/voucher.route.js";
import gemRouter from "./route/gem.route.js";
import { createOnlineSession } from "./controllers/auth.controller.js";
import ratingRouter from "./route/rating.route.js";
import contactRouter from "./route/contactUs.route.js";
import aiRouter from "./route/ai.route.js";
import wishlistRouter from "./route/wishlist.route.js";
import transactionRouter from "./route/transaction.route.js";

dotenv.config();

const app = express();

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.DB_URL, { 
      serverSelectionTimeoutMS: 30000,
      bufferCommands: false
    });
    isConnected = true;
    console.log("✅ DB Connected");
  } catch (err) {
    console.error("❌ DB Connection Failed:", err);
    return;
  }
};

// CORS settings - مهم جداً!
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://gemsy-frontend.vercel.app/',
  'https://gemsy-frontend.vercel.app',
  process.env.FRONTEND_URL, // حط الـ frontend URL هنا
].filter(Boolean);

app.use(cors({ 
  origin: (origin, cb) => {
    // السماح بالـ requests من Postman أو بدون origin
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      console.log("Blocked by CORS:", origin); 
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // ده أهم حاجة للـ cookies!
}));

app.use(cookieParser());

app.post("/webhook", 
  express.raw({ type: "application/json" }), 
  createOnlineSession
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/auth", authRouter);
app.use("/activity", activityRouter);
app.use("/review", reviewRouter);
app.use("/users", userRouter);
app.use("/categories", categoryRouter);
app.use("/gems", gemRouter);
app.use("/vouchers", voucherRouter);
app.use("/ratings", ratingRouter);
app.use("/contactus", contactRouter);
app.use("/ai", aiRouter);
app.use("/wishlist", wishlistRouter);
app.use("/transaction", transactionRouter);

app.use(globalMiddleWare);


export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}

// Only start the HTTP server when running locally
if (process.env.NODE_ENV !== 'production') {
  await connectDB();
  const port = process.env.PORT || 3000;
  const server = http.createServer(app);
  initSocket(server);
  server.listen(port, "0.0.0.0", () => console.log(`🚀 Local server running on port ${port}`));
}
