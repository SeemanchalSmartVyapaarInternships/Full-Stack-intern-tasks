import express from 'express';
import cors from 'cors';
import { initDatabase } from './models/index.js';
import { createApiRouter } from './routes/apiRoutes.js';

export function createApp(dbOverrides = {}) {
  const models = initDatabase(dbOverrides);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'database-api-layer', status: 'ok' });
  });

  app.use('/api', createApiRouter(models));

  app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  app.use((err, req, res, _next) => {
    const isValidation =
      err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError';
    const status = isValidation ? 400 : err.status || 500;
    res.status(status).json({
      success: false,
      message: isValidation ? err.errors?.[0]?.message || 'Validation error' : err.message || 'Server error',
    });
  });

  return { app, models };
}
