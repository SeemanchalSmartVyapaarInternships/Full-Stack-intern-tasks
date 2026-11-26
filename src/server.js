import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`Auth & RBAC API listening on http://127.0.0.1:${env.port}`);
});
