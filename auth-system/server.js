// ============================================================
// Server Entry Point
// ============================================================
// Initialises Express, applies security middleware, mounts
// routes, connects to MySQL via Sequelize, seeds default
// admin, and starts the HTTP server.
// ============================================================

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const sequelize = require('./config/db');
const { User } = require('./models');
const { errorResponse } = require('./utils/helpers');

// ---- Route Imports ----
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');

// ---- Initialise App ----
const app = express();

// ---- Global Middleware ----

// Security headers (relaxed CSP for frontend)
const path = require('path');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors());

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/auth', authLimiter);

// ---- Serve Static Frontend ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Mount Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api', roleRoutes);

// ---- Root Redirect ----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- Health Check ----
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth System API is running.',
    timestamp: new Date().toISOString(),
  });
});

// ---- 404 Handler ----
app.use((req, res) => {
  return errorResponse(res, 404, `Route ${req.method} ${req.originalUrl} not found.`);
});

// ---- Global Error Handler ----
app.use((err, req, res, _next) => {
  console.error('Unhandled Error:', err);
  return errorResponse(
    res,
    err.status || 500,
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error.'
  );
});

// ---- Database Connection & Server Start ----

const PORT = process.env.PORT || 5000;

async function seedAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existing = await User.findOne({ where: { email: adminEmail } });
    if (!existing) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@1234',
        role: 'admin',
      });
      console.log(`✅ Default admin seeded: ${adminEmail}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    }
  } catch (err) {
    console.error('❌ Failed to seed admin:', err.message);
  }
}

async function startServer() {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronised.');

    // Seed default admin
    await seedAdmin();

    // Start listening
    app.listen(PORT, () => {
      console.log(`\n🚀 Auth System API running on http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Unable to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app; // for testing
