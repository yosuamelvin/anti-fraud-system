const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { sequelize, syncDatabase } = require('./config/database');
const { User } = require('./models');

const authRoutes = require('./routes/authRoutes');
const caseRoutes = require('./routes/caseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

const { startEmailMonitoring } = require('./services/emailService');
const { seedUsers } = require('./seeders/userSeeder');

const app = express();

/*
|--------------------------------------------------------------------------
| CORS CONFIG
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://anti-fraud-system-rouge.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {

    // Allow Postman / mobile apps
    if (!origin) {
      return callback(null, true);
    }

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

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Anti-Fraud Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/*
|--------------------------------------------------------------------------
| ROOT ENDPOINT
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| ROUTES
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

/*
|--------------------------------------------------------------------------
| 404 HANDLER
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

/*
|--------------------------------------------------------------------------
| ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((err, req, res, next) => {

  console.error('❌ Error:', err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

/*
|--------------------------------------------------------------------------
| SERVER CONFIG
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

const startServer = async () => {

  try {

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Starting Anti-Fraud Backend');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('🌍 Environment:', process.env.NODE_ENV);

    /*
    |--------------------------------------------------------------------------
    | DATABASE CONNECTION
    |--------------------------------------------------------------------------
    */

    console.log('🔌 Connecting to database...');

    await sequelize.authenticate();

    console.log('✅ Database connected');

    /*
    |--------------------------------------------------------------------------
    | SYNC DATABASE
    |--------------------------------------------------------------------------
    */

    console.log('📦 Syncing database tables...');

    await syncDatabase();

    console.log('✅ Database synced successfully');

    /*
    |--------------------------------------------------------------------------
    | AUTO SEED USERS
    |--------------------------------------------------------------------------
    */

    console.log('🌱 Running auto seeder...');

    await seedUsers();

    console.log('✅ Seeder completed');

    /*
    |--------------------------------------------------------------------------
    | EMAIL MONITORING
    |--------------------------------------------------------------------------
    */

    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {

      console.log('📧 Starting email monitoring...');

      startEmailMonitoring();

      console.log('✅ Email monitoring started');

    } else {

      console.log('⚠️ Email monitoring disabled');

    }

    /*
    |--------------------------------------------------------------------------
    | START EXPRESS SERVER
    |--------------------------------------------------------------------------
    */

    app.listen(PORT, '0.0.0.0', () => {

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Health: /health`);
      console.log(`✅ API: /api`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    });

  } catch (error) {

    console.error('❌ Failed to start server');
    console.error(error);

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| START APP
|--------------------------------------------------------------------------
*/

startServer();

/*
|--------------------------------------------------------------------------
| HANDLE UNHANDLED REJECTION
|--------------------------------------------------------------------------
*/

process.on('unhandledRejection', (err) => {

  console.error('❌ Unhandled Promise Rejection');
  console.error(err);

  process.exit(1);
});