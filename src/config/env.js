import 'dotenv/config';

export const ALLOWED_ROLES = ['Admin', 'Manager', 'Employee'];

export const env = {
  port: Number(process.env.PORT) || 4001,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};
