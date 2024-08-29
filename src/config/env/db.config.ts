import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3307,
  username: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DB || 'cefalo_calender_db',
  debug: process.env.MYSQL_DEBUG === 'true' || false,
  synchronize: process.env.MYSQL_SYNCHRONIZE === 'true' || false, // turning it to true will automatically make changes to the database schema
  logging: process.env.MYSQL_LOGGING === 'true' || true,
}));
