import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secure-secret-blood-donation',
    expires_in: process.env.JWT_EXPIRES_IN || '15m',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'super-secure-refresh-secret',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  client_url: process.env.CLIENT_URL || 'http://localhost:3000',
};
