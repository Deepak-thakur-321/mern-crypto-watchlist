const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const watchlistRoutes = require('../backend/src/routes/watchlistRoutes');
const morgan = require('morgan'); const cookieParser = require('cookie-parser');

const connectDB = require('../backend/src/db/db');
const { generalLimiter, authLimiter } = require('../backend/src/middleware/rateLimiter');
const errorHandler = require('../backend/src/middleware/errorHandler');

// Route Import
const authRoutes = require('../backend/src/routes/authRoutes');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();


// Initialize App
const app = express();

// Global Middlewares (Security, Logging, Body Parser)
app.use(helmet());
app.use(express.json());
app.use(cookieParser()); // required to read cookies
app.use('/api/watchlist', watchlistRoutes);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(generalLimiter);

// === Routes ===
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Crypto Watchlist API is running...' });
});

// Auth Routes
app.use('/api/auth', authRoutes);



// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Central Error Handler
app.use(errorHandler);


// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}. Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});