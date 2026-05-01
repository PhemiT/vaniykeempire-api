require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connectDB      = require('./config/database');
const authRoutes     = require('./routes/authRoutes');
const contentRoutes  = require('./routes/contentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes  = require('./routes/paymentRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const bundlesRoutes = require('./routes/bundleRoutes');
const aboutRoutes = require('./routes/aboutRoutes')

const app = express();

// ─── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin:         process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Pre-flight requests for all routes (Express 5 / path-to-regexp v8 syntax)
app.options('/{*path}', cors());

// ─── Stripe webhook (MUST be before express.json()) ────────────────────────
// Stripe signature verification requires the raw request buffer.
app.use('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }));
app.use('/api/payments/webhook/paystack', express.raw({ type: 'application/json' }));

// ─── Body parsers ──────────────────────────────────────────────────────────
// Large enough to not interfere with multipart/form-data metadata.
// The actual file bytes are handled by multer, not these parsers.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─── Database ──────────────────────────────────────────────────────────────
connectDB();

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/content',    contentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/about',   aboutRoutes);
app.use('/api/bundles',   bundlesRoutes);
app.use('/api',           commentsRoutes);

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// ─── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  // Multer errors (file too large, wrong type, etc.)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 2GB.' });
  }

  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

const PORT   = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 30 minutes
const THIRTY_MINUTES = 30 * 60 * 1000;

server.timeout          = THIRTY_MINUTES; // total request timeout
server.keepAliveTimeout = THIRTY_MINUTES; // keep TCP connection alive
server.headersTimeout   = THIRTY_MINUTES + 60_000; // must exceed keepAliveTimeout