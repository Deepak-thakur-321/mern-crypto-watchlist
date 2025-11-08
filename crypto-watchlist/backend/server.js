const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const connectDB = require("./src/db/db");
const { generalLimiter } = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");
const referralRoutes = require("./src/routes/referralRoutes");

dotenv.config();
connectDB();

const app = express();

// Helmet for security headers
app.use(helmet());

// CORS Configuration - PRODUCTION READY
const frontendUrl = process.env.FRONTEND_URL;

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    frontendUrl,
    'https://mern-crypto-watchlist.vercel.app',
].filter(Boolean); // Remove undefined values

// CORS middleware with proper origin validation
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // 24 hours
}));

// Parse JSON bodies and cookies
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Logging (dev only)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate limiting
app.use(generalLimiter);

// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/watchlist", require("./src/routes/watchlistRoutes"));
app.use("/api/referral", referralRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Allowed Origins:`, allowedOrigins);
});