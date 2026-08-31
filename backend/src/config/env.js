const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

if (isProduction && !process.env.JWT_SECRET) throw new Error('JWT_SECRET is required in production.');

module.exports = {
  PORT: Number(process.env.PORT || 3001),
  JWT_SECRET: process.env.JWT_SECRET || 'fincontrol-local-secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '',
};
