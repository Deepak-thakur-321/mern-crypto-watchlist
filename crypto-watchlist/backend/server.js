const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const connectDB = require("./src/db/db");
const { generalLimiter } = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");
const referralRoutes = require("../backend/src/routes/referralRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(helmet());

const frontendUrl = process.env.FRONTEND_URL;

const normalizeUrl = (url) => url ? url.replace(/\/+$/, "") : null;

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    normalizeUrl(frontendUrl),
    frontendUrl, 
].filter(Boolean); 

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.some(allowedOrigin => {
            const normalizedOrigin = normalizeUrl(origin);
            return normalizedOrigin === normalizeUrl(allowedOrigin);
        })) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked: ${origin}`);
            callback(new Error("Not allowed by CORS: Origin mismatch."));
        }
    },
    // REQUIRED for cross-domain cookie authentication
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    exposedHeaders: ["set-cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Parse JSON bodies and cookies
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Logging & rate limiting
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(generalLimiter);

// Test route
app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "API is running" });
});

// API routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/watchlist", require("./src/routes/watchlistRoutes"));
app.use("/api/referral", referralRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${process.env.NODE_ENV})`);
});
