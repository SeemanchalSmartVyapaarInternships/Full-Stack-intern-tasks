import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 4003;
const { app, models } = createApp();

models.sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`File Management & Activity API listening on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database startup failed:', err.message);
    process.exit(1);
  });
