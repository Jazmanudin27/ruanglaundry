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

// Pengaturan CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === ENV.CORS_ORIGIN || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Akses diblokir oleh kebijakan CORS'));
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
