const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const connectDB = require("./src/db/db");
const { generalLimiter } = require("./src/middleware/rateLimiter");
const errorHandler = require("./src/middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// ⭐ CORS CONFIGURATION - FIRST
// server.js - Update CORS section

const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

const allowedOrigins = [
    'http://localhost:5173',      // Vite dev server
    'http://127.0.0.1:5173',      // Alternative localhost
    'http://localhost:5000',      // ⭐ Backend itself (for proxy)
    frontendUrl,
].filter(Boolean);

console.log('\n🌐 CORS Configuration:');
console.log('   Environment:', process.env.NODE_ENV);
console.log('   Allowed Origins:', allowedOrigins);

// server.js - Update CORS section

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`❌ Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"], // ⭐ Important
    optionsSuccessStatus: 204,
    preflightContinue: false,
}));


// ⭐ COOKIE PARSER - BEFORE ROUTES
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, 
}));

// Logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Rate limiting
app.use(generalLimiter);

// ⭐ DEBUG MIDDLEWARE (Remove after testing)
app.use((req, res, next) => {
    if (req.path.includes('/auth/')) {
        console.log("\n--- 🔍 AUTH REQUEST ---");
        console.log("Path:", req.path);
        console.log("Method:", req.method);
        console.log("Cookies:", req.cookies);
    }
    next();
});

// Health check
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running",
        environment: process.env.NODE_ENV,
    });
});

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/watchlist", require("./src/routes/watchlistRoutes"));
app.use("/api/referral", require("./src/routes/referralRoutes"));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${frontendUrl || 'Not set'}`);
    console.log(`\n📝 Cookie Settings:`);
    console.log(`   - httpOnly: true`);
    console.log(`   - secure: ${isProduction}`);
    console.log(`   - sameSite: ${isProduction ? 'None' : 'Lax'}\n`);
});