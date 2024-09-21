import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  database: process.env.SQLITE_DB || 'bookify_db.sqlite',
  debug: process.env.MYSQL_DEBUG === 'true' || false,
  synchronize: process.env.MYSQL_SYNCHRONIZE === 'true' || false, // turning it to true will automatically make changes to the database schema
  logging: process.env.MYSQL_LOGGING === 'true' || true,
}));
