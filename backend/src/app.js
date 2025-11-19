import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import locationRoutes from './routes/locations.js';
import organizationRoutes from './routes/organizations.js';
import approvalRoutes from './routes/approvals.js';
import hospitalRoutes from './routes/hospitals.js';
import volunteerRoutes from './routes/volunteers.js';
import adminRoutes from './routes/admin.js';
import './config/database.js'; // Initialize database connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - MUST be first middleware
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware - MUST be before logging to see req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  console.log('🌐 Origin:', req.headers.origin);
  console.log('📦 Body:', req.method === 'POST' || req.method === 'PUT' ? req.body : 'N/A');
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);
// etc.

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

