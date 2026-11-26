import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { initDatabase } from './models/index.js';
import { createUploadRouter } from './routes/uploadRoutes.js';
import { createActivityRouter } from './routes/activityRoutes.js';

export function createApp({ dbOverrides = {}, uploadDir = './uploads' } = {}) {
  const models = initDatabase(dbOverrides);
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(uploadDir));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, service: 'file-management-system', status: 'ok' });
  });

  app.use('/api/uploads', createUploadRouter(models, { uploadDir }));
  app.use('/api/activity', createActivityRouter(models));

  app.use((err, _req, res, _next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.code === 'LIMIT_FILE_SIZE' ? 'File exceeds maximum allowed size.' : err.message,
      });
    }
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return { app, models };
}
