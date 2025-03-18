const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,  // FIXED: Changed from DB_USER to DB_USERNAME
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT, // Using DB_DIALECT from .env
        logging: false
    }
);

// Test database connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected successfully!'))
    .catch(err => console.error('❌ Database connection failed:', err));

module.exports = sequelize;
