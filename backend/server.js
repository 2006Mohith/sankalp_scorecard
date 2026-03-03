import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import cricketRoutes from './routes/cricket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// --- SECURITY SHIELD ENFORCEMENT ---

// 1. Cross-Origin Resource Sharing (CORS) - Restrict to Frontend URL in Production
app.use(cors({
    origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://192.168.29.84:5173'], // Restrict access in production
    credentials: true
}));

// 2. Set Secure HTTP Headers (Helmet)
app.use(helmet());

// 3. Brute Force & DDoS Protection (Rate Limiting)
const globalLimiter = rateLimit({
    max: 200, // Limit each IP to 200 requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes window
    message: { error: 'Too many requests from this IP, please try again in 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', globalLimiter); // Apply to all API routes

// 4. Body size limits strictly enforced at 10kb to prevent oversized payload crashes
app.use(express.json({ limit: '10kb' }));

// 5. Data Sanitization against NoSQL Query Injection (e.g., {"$gt": ""})
app.use(mongoSanitize());

// 6. Data Sanitization against Cross-Site Scripting (XSS) Attacks
app.use(xss());

// 7. Prevent HTTP Parameter Pollution (duplicating req.query params)
app.use(hpp());

// --- END SECURITY SHIELD ---
// Routes
app.use('/api', apiRoutes);
app.use('/api/cricket', cricketRoutes);

// Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Pass io to routes so they can emit events
app.set('io', io);

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sankalp_scoreboard';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        // --- SLOWLORIS ATTACK MITIGATION ---
        // Node.js by default waits a while for headers. Setting explicit timeouts prevents
        // attackers from holding connections open slowly forever and exhausting server threads.
        server.keepAliveTimeout = 65000; // 65 seconds
        server.headersTimeout = 66000;   // Keep strictly larger than keepAliveTimeout

        server.listen(PORT, '0.0.0.0', () => console.log(`Server running - Shield Active on port ${PORT}`));
    })
    .catch(err => console.error('MongoDB connection error:', err));
