import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'secret_laundry_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  KEBIJAKAN_SISA_KUOTA: process.env.KEBIJAKAN_SISA_KUOTA || 'DIGABUNG', // HANGUS atau DIGABUNG
  NODE_ENV: process.env.NODE_ENV || 'development',
};
