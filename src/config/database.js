import 'dotenv/config';
import { Sequelize } from 'sequelize';

export function createSequelizeInstance(overrides = {}) {
  const dialect = overrides.dialect || process.env.DB_DIALECT || 'mysql';

  if (dialect === 'sqlite') {
    return new Sequelize({
      dialect: 'sqlite',
      storage: overrides.storage || process.env.DB_STORAGE || ':memory:',
      logging: false,
    });
  }

  return new Sequelize(
    overrides.database || process.env.DB_NAME || 'ssc_intern_db',
    overrides.username || process.env.DB_USER || 'root',
    overrides.password ?? process.env.DB_PASSWORD ?? '',
    {
      host: overrides.host || process.env.DB_HOST || '127.0.0.1',
      port: Number(overrides.port || process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    }
  );
}
