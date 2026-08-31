const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: Number(process.env.PORT || 3001),
  JWT_SECRET: process.env.JWT_SECRET || 'fincontrol-local-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DB_PATH: process.env.DB_PATH || require('path').join(__dirname, '../../data/fincontrol.db'),
};
