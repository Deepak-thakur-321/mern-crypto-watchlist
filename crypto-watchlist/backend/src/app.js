const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

// Rate limiters
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

// Error handler
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ================= Middleware =================

// Body parser
app.use(express.json());

// Cookie parser (needed for JWT in cookies)
app.use(cookieParser());

app.use(helmet());
app.use(cors({
   origin: process.env.FRONTEND_URL || "http://localhost:5173",
   credentials: true,
}));

// Enable CORS
// app.use(cors({
//    origin: process.env.FRONTEND_URL || "*", // replace with frontend URL in prod
//    credentials: true,
// }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV === "development") {
   app.use(morgan("dev"));
}

// ================= Rate Limiting =================

// General rate limiter (applied globally)
app.use(generalLimiter);

// Auth-specific limiter (login/register)
app.use("/api/auth", authLimiter);

// ================= Routes =================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);

// ================= 404 Handler =================
app.use((req, res, next) => {
   res.status(404);
   const error = new Error(`Route not found: ${req.originalUrl}`);
   next(error);
});

// ================= Global Error Handler =================
app.use(errorHandler);

module.exports = app;
