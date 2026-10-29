const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');

const corsOptions = require('./config/cors');
const { connectDB } = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const roiRoutes = require('./routes/roiRoutes');
const referralRoutes = require('./routes/referralRoutes');
const walletRoutes = require('./routes/walletRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
app.use(helmet());
app.use(cors(corsOptions));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use('/api', apiLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ------------------------------ Ensure Database Connection (Serverless) ------------------------------
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState < 1) {
    try {
      await connectDB();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// ------------------------------ Health Check ------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    service: 'TierFlow API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ------------------------------ API Routes ------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roi-history', roiRoutes);
app.use('/api/roi', roiRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);

// ------------------------------ Error Handling ------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
