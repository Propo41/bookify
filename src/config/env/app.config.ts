import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  appPort: parseInt(process.env.APP_PORT) || 3000,
  environment: process.env.NODE_ENV || 'development',
  logsDir: process.env.LOGS_DIR || 'logs',

  jwtSecret: process.env.JWT_SECRET || 'ZZZ',

  oAuthClientSecret: process.env.OAUTH_CLIENT_SECRET,
  oAuthClientId: process.env.OAUTH_CLIENT_ID,
  oAuthRedirectUrl: process.env.OAUTH_REDIRECT_URL,
}));
