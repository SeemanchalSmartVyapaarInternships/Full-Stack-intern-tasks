import 'dotenv/config';
import { createMedcarexApp } from './app.js';
import { seedMedcarexData } from './seed.js';

const PORT = Number(process.env.PORT) || 5001;
const { app, models } = createMedcarexApp();

models.sequelize
  .sync()
  .then(() => seedMedcarexData(models))
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MedCareX Backend API listening on http://127.0.0.1:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MedCareX backend failed to start:', err.message);
    process.exit(1);
  });
