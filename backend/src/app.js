import express from 'express';
import cors from 'cors';
import { initMedcarexModels } from './models/index.js';
import { createMedcarexRouter } from './routes/index.js';

export function createMedcarexApp(dbOverrides = {}) {
  const models = initMedcarexModels(dbOverrides);
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, service: 'medcarex-healthcare-api', status: 'ok' });
  });

  app.use('/api', createMedcarexRouter(models));

  app.use((err, _req, res, _next) => {
    const isValidation =
      err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError';
    res.status(isValidation ? 400 : err.status || 500).json({
      success: false,
      message: isValidation ? err.errors?.[0]?.message || 'Validation error' : err.message || 'Server error',
    });
  });

  return { app, models };
}
