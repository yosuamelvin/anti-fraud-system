const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, syncDatabase } = require('./config/database');
const { User } = require('./models');
const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { startEmailMonitoring } = require('./services/emailService');

// Load environment variables
dotenv.config();

const app = express();

// CORS Configuration - Support multiple origins for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://anti-fraud-system-rouge.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
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

// Health check endpoint (IMPORTANT for Render.com)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Anti-Fraud Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
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
  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Server Port
const PORT = process.env.PORT || 5000;

// Auto Seeder Function
const autoSeedAdmin = async () => {
  try {
    const { User } = require('./models');
    const bcrypt = require('bcryptjs');

    const existingAdmin = await User.findOne({
      where: {
        email: 'admin@antifraud.com'
      }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await User.create({
        nama_lengkap: 'Super Admin',
        email: 'admin@antifraud.com',
        password: hashedPassword,
        role: 'kepala_divisi',
        is_active: true
      });

      console.log('✅ Default admin created');
      console.log('📧 Email: admin@antifraud.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️ Default admin already exists');
    }
  } catch (error) {
    console.error('❌ Error auto seeding admin:', error.message);
  }
};

// Start Server Function
const startServer = async () => {
  try {
    console.log('Starting Anti-Fraud Backend Server...');
    console.log('Environment:', process.env.NODE_ENV || 'development');

    // Test database connection
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync database
    await syncDatabase();
    console.log('✅ Database synced successfully!');

    // Auto create default admin if not exists
    try {
      const existingAdmin = await User.findOne({
        where: {
          email: 'admin@antifraud.com'
        }
    });

    if (!existingAdmin) {
      await User.create({
        nama_lengkap: 'Super Admin',
        email: 'admin@antifraud.com',
        password: 'admin123',
        role: 'superuser',
        is_active: true
      });

      console.log('✅ Default admin created');
    } else {
      console.log('ℹ️ Default admin already exists');
    }
  } catch (seedError) {
    console.error('❌ Error auto seeding admin:', seedError.message);
  }

    // Auto seed admin
    await autoSeedAdmin();

    // Start email monitoring (only in production with valid email config)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('Starting email monitoring service...');
      startEmailMonitoring();
      console.log('✅ Email monitoring started!');
    } else {
      console.log('⚠️ Email monitoring disabled (missing EMAIL credentials)');
    }

    // Start Express server - Listen on 0.0.0.0 for cloud deployment
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
      console.log(`✅ API endpoint: http://localhost:${PORT}/api`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});