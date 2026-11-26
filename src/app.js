import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, service: 'auth-rbac-system', status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
