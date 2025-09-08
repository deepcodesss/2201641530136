import 'dotenv/config';

export const CONFIG = {
  url: process.env.LOG_API_URL || 'http://20.244.56.144/evaluation-service/logs',
  apiKey: process.env.LOG_API_KEY,
  authHeader: process.env.LOG_AUTH_HEADER || 'Authorization',
  authScheme: (process.env.LOG_AUTH_SCHEME ?? 'Bearer').trim(),
  appName: process.env.LOG_APP_NAME || 'app',
  enabled: (process.env.LOG_ENABLE ?? 'true').toLowerCase() !== 'false',
  timeoutMs: 2500,
  retries: 2,
};
