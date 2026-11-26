import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 4002;
const { app, models } = createApp();

models.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Database & API Layer listening on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
