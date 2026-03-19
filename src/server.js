require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');

const app = express();

// CORS first
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Stripe webhook ONLY — must be raw before express.json()
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Middleware
app.use(express.json());

// Database
connectDB();

// Routes — payment routes now come AFTER express.json()
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});