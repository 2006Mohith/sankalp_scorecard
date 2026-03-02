# KESHAV MEMORIAL COLLEGE OF ENGINEERING – SANKALP Sports Fest Live Scoreboard

A full-stack web application designed for the official sports fest conducted by KESHAV MEMORIAL COLLEGE OF ENGINEERING under the club SANKALP.

## Features
- **Public Website:** Live scores, upcoming and completed match tracking.
- **Admin Portal:** Secure interface for managing sports, teams, matches, and real-time score updates.
- **Real-Time Data:** Instant socket-based updates.
- **Responsive & Modern Design:** Tailored with Tailwind CSS including dark mode support.

## Tech Stack
- MongoDB (Mongoose)
- Express.js
- React.js (Vite + JSX)
- Node.js
- Socket.io
- Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB server running locally (or remote URI)

### Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update `.env` (already configured to local MongoDB).
4. Run the seed script to populate initial data and create the admin user:
   ```bash
   npm run seed
   ```
   **Admin Credentials:**
   Username: `admin`
   Password: `password123`
5. Start the server:
   ```bash
   npm start
   ```
   *(Running on port 5000 by default)*

### Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Production Deployment
- **Backend:** Deploy on Render/Heroku. Ensure `MONGO_URI` and `JWT_SECRET` are set in the environment variables.
- **Frontend:** Build with `npm run build` and deploy the `dist` folder on Vercel/Netlify. Configure `.env` variables `VITE_API_URL` and `VITE_SOCKET_URL` to point to your live backend.

## Authors
Developed for SANKALP Club. © 2026 KESHAV MEMORIAL COLLEGE OF ENGINEERING.
