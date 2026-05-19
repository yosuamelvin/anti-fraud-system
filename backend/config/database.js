const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

// Production: Gunakan DATABASE_URL dari Neon
if (process.env.DATABASE_URL) {
  console.log('🌍 Using DATABASE_URL (Production)');
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Disable logging in production
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} 
// Development: Gunakan individual DB credentials
else {
  console.log('💻 Using individual DB config (Development)');
  
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log, // Enable logging in development
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

const syncDatabase = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database authenticated');

    console.log('📦 Syncing database tables...');
    
    // IMPORTANT: alter: true akan update tables tanpa hapus data
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synced successfully');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Message:', error.message);
    console.error('   Original:', error.original?.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase
};