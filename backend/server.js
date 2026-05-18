const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize, syncDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { startEmailMonitoring } = require('./services/emailService');
const { seedUsers } = require('./seeders/userSeeder');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://anti-fraud-system-rouge.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman/curl/mobile apps
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Anti-Fraud Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Anti-Fraud Investigation API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      cases: '/api/cases',
      notifications: '/api/notifications',
      reports: '/api/reports'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Anti-Fraud Backend');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

    // Test DB Connection
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync Tables
    console.log('📦 Syncing database tables...');
    await syncDatabase();
    console.log('✅ Database synced');

    // Auto Seed Users
    console.log('🌱 Running database seeders...');
    await seedUsers();
    console.log('✅ Seeder completed');

    // Email Monitoring
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('📧 Starting email monitoring...');
      startEmailMonitoring();
      console.log('✅ Email monitoring started');
    } else {
      console.log('⚠️ Email monitoring disabled');
    }

    // Start Express Server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ API: http://localhost:${PORT}/api`);
      console.log(`✅ Health: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Unhandled Promise Rejection
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});