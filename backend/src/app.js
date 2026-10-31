import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { checkSubscriptionGuard } from './middlewares/authMiddleware.js';

import authRoutes from './routes/authRoutes.js';
import paketRoutes from './routes/paketRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import transaksiRoutes from './routes/transaksiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import perpanjanganRoutes from './routes/perpanjanganRoutes.js';
import perusahaanRoutes from './routes/perusahaanRoutes.js';

const app = express();

// Keamanan dengan Helmet
app.use(helmet());

// Pengaturan CORS Fleksibel (Mendukung Multi-Domain Comma-Separated & Reverse Proxy)
const allowedOrigins = ENV.CORS_ORIGIN
  ? ENV.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan jika request tanpa origin (mobile app, curl, server proxy lokal)
      if (!origin) return callback(null, true);

      // Izinkan jika origin ada dalam daftar .env, localhost, atau domain ruangtech
      const isAllowed =
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin.endsWith('.ruangtech.com') ||
        origin === 'https://laundry.ruangtech.com';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`Akses diblokir oleh kebijakan CORS untuk origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Parsing JSON & URL-encoded body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Sistem Member Laundry NFC SaaS Multi-Tenant Backend',
    timestamp: new Date().toISOString(),
  });
});

// Route Utama (prefix /api)
app.use('/api/auth', authRoutes);
app.use('/api/perusahaan', perusahaanRoutes);
app.use('/api/perpanjangan', perpanjanganRoutes);

// Rute operasional dengan guard lisensi langganan perusahaan
app.use('/api/paket', checkSubscriptionGuard, paketRoutes);
app.use('/api/pakets', checkSubscriptionGuard, paketRoutes);
app.use('/api/members', checkSubscriptionGuard, memberRoutes);
app.use('/api/transaksi', checkSubscriptionGuard, transaksiRoutes);
app.use('/api/dashboard', checkSubscriptionGuard, dashboardRoutes);

// Error Handler terpusat
app.use(errorHandler);

export default app;
