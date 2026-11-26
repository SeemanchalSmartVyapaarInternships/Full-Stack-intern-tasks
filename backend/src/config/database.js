import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Sequelize } from 'sequelize';

export function createSequelizeInstance(overrides = {}) {
  const dialect = overrides.dialect || process.env.DB_DIALECT || 'sqlite';

  if (dialect === 'sqlite') {
    const storage = overrides.storage || process.env.DB_STORAGE || './data/medcarex.sqlite';
    if (storage !== ':memory:') {
      fs.mkdirSync(path.dirname(storage), { recursive: true });
    }
    return new Sequelize({ dialect: 'sqlite', storage, logging: false });
  }

  return new Sequelize(
    overrides.database || process.env.DB_NAME || 'medcarex_db',
    overrides.username || process.env.DB_USER || 'root',
    overrides.password ?? process.env.DB_PASSWORD ?? '',
    {
      host: overrides.host || process.env.DB_HOST || '127.0.0.1',
      port: Number(overrides.port || process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
    }
  );
}
