require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const schemeRoutes = require('./routes/schemeRoutes');

// Import models to ensure they are registered with Mongoose
require('./models/User');
require('./models/Scheme');
require('./models/Partner');

const app = express();

// Initialize MongoDB connection
connectDB();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Base Route
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Loan Saathi (SIH26092) - Backend API',
    status: 'online',
    phase: 'Phase 1 - Infrastructure & Database Setup',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    uptime: process.uptime(),
    server: 'healthy',
    database: dbStatus,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Loan Saathi Backend server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;

