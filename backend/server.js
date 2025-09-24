import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables loaded:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Initialize Supabase client
import { initializeSupabase } from './config/database.js';

try {
    initializeSupabase();
    console.log('✅ Supabase initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Supabase:', error.message);
    process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
import donationRoutes from './routes/donations.js';
import requestRoutes from './routes/requests.js';
import volunteerRoutes from './routes/volunteers.js';
import matchingRoutes from './routes/matching.js';
import deliveryRoutes from './routes/deliveries.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';
// Removed unused routes: ai.js, aiRouting.js, aiNotifications.js, simpleRouting.js, simpleNotifications.js
// aiService.ts in frontend calls smythos directly, bypassing these backend routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/chat', chatRoutes);
// Removed unused route mounts - frontend uses aiService.ts for direct smythos integration

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'jonoshongjog-backend'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Jonoshongjog Backend running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;