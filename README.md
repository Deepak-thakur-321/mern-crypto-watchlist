Crypto Watchlist Dashboard

A robust, full-stack web application demonstrating secure authentication and real-time data management capabilities, suitable for a production environment.

🌐 Live Deployment

Frontend (Client): https://mern-crypto-watchlist.vercel.app/
Backend (API Base URL): https://crypto-watchlist-api-r6ro.onrender.com

🛠️ Tech Stack & Dependencies

The project is built using the MERN stack with a focus on modern tooling and security:

Client-Side

Framework: React.js

Styling: TailwindCSS

Routing & Forms: React Router, React Hook Form

Server-Side

Runtime/Core: Node.js, Express.js

Database: MongoDB via Mongoose ODM

Security: JWT, bcrypt, Cookie-Parser

Deployment: Render (Backend), Vercel (Frontend)

🔑 Core Architectural Decisions

This project emphasizes security and clear separation of concerns, achieving production readiness through the following decisions:

Secure Stateless Authentication: Utilizes JWT (JSON Web Tokens) stored exclusively in HttpOnly, Secure, SameSite=None cookies. This prevents XSS attacks and ensures secure cross-origin (Vercel $\leftrightarrow$ Render) authentication.

Protected Routes: All critical API endpoints (e.g., /users/profile, /watchlist) are shielded by the authMiddleware, guaranteeing only verified users with valid tokens can access resources.

Modular API Structure: The backend is organized into clear Controllers, Models, Routes, and dedicated Middleware, ensuring easy maintenance and scalability.

Robust CORS Handling: Implemented explicit whitelisting of Vercel and local development domains to ensure cross-origin request integrity across the deployment environment.

✨ Key Features

User Authentication

Full Lifecycle: Register, Login, and Logout functionality.

Secure Sessions: Managed entirely via HttpOnly JWT cookies.

Profile Management: Fetches and displays the current user profile from a protected API route.

Watchlist Dashboard

CRUD Operations: Create, Read, Update, and Delete actions for watchlist items.

Data Validation: Ensures all watchlist inputs meet required schemas before database interaction.

Responsive UI: Designed with TailwindCSS to provide an optimal experience across all device sizes.

⚙️ Setup & Installation

To run the project locally, ensure you have Node.js and MongoDB installed.

1. Backend (API)

cd backend
npm install
# Set up your .env file with JWT_SECRET and MONGODB_URI
npm run dev # Runs on http://localhost:5000


2. Frontend (Client)

cd frontend
npm install
# Set the VITE_BACKEND_URL environment variable to http://localhost:5000/api
npm run dev # Runs on http://localhost:5173


📖 API Reference

All protected routes require an authenticated JWT cookie.

POST /auth/register: Registers a new user.

POST /auth/login: Authenticates user and sets JWT cookie.

POST /auth/logout: Clears the JWT cookie.

GET /users/profile: Fetches the authenticated user's details. (Protected)

GET /watchlist: Retrieves the full watchlist for the authenticated user. (Protected)

POST /watchlist: Adds a new item to the user's watchlist. (Protected)

PUT /watchlist/:id: Updates a specific watchlist item. (Protected)

DELETE /watchlist/:id: Deletes a specific watchlist item. (Protected)

📈 Future Improvements

Implement JWT refresh tokens for enhanced security and session longevity.

Integrate a third-party crypto data API to fetch live price updates and market data.

Add a visual component (charts/graphs) for performance analytics.

Introduce robust server-side caching for watchlist data to improve read performance.

🙋 Author / Contact

Deepak Thakur

Email: deepakthakur.codr@gmail.com

LinkedIn: http://www.linkedin.com/in/deepakthakur22

GitHub: https://github.com/Deepak-thakur-321
