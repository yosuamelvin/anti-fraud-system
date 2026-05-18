const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: console.log,

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync();
    console.log('✅ Database synced');

  } catch (error) {
    console.error('❌ DATABASE FULL ERROR:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  syncDatabase
};