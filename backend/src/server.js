import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Prisma
import prisma from "./config/prisma.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../backend.env") });

const app = express();
const PORT = process.env.PORT || 5001;

console.log("Environment Variables:");
console.log("CLIENT_URL:", process.env.CLIENT_URL || "http://localhost:3000");
console.log("PORT:", PORT);
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

// Allowed Origins
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:5173",
  "http://127.0.0.1:5174"
];
const uniqueOrigins = [...new Set(allowedOrigins.filter(Boolean))];
console.log("✅ Allowed Origins:", uniqueOrigins);

// ----------------------
// CORS Middleware
// ----------------------
app.use((req, res, next) => {
  console.log("CORS middleware hit"); // Debug log

  const origin = req.headers.origin;
  if (origin && uniqueOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie, Set-Cookie"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    return res.status(200).end();
  }

  next();
});

// ----------------------
// Middlewares
// ----------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// ----------------------
// Rate Limiting
// ----------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, try later."
});
app.use("/api", limiter);

// ----------------------
// Log Requests Middleware
// ----------------------
app.use((req, res, next) => {
  console.log("Request received in general log"); // Debug log
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ----------------------
// Test Routes
// ----------------------
app.get("/", (req, res) => {
  res.json({
    message: "Backend running",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

// ----------------------
// Main API Routes
// ----------------------
app.use("/api/auth", authRoutes);

console.log("Before productRoutes");
app.use("/api/products", productRoutes);
console.log("After productRoutes");

app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/admin", adminRoutes);

// ----------------------
// 404 Handler
// ----------------------
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`
  });
});

// ----------------------
// Error Handler
// ----------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

// ----------------------
// Start Server
// ----------------------
async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
