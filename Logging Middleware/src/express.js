import { log } from './index.js';

export function expressLogger() {
  return async (req, res, next) => {
    const started = Date.now();
    // after response
    res.on('finish', () => {
      const ms = Date.now() - started;
      // informational request summary
      log('backend', 'info', 'middleware', `HTTP ${req.method} ${req.originalUrl}`, {
        status: res.statusCode, duration_ms: ms, ip: req.ip,
        ua: req.headers['user-agent'],
      }).catch(()=>{});
    });
    next();
  };
}

// Error-handling middleware factory
export function expressErrorLogger() {
  // eslint-disable-next-line no-unused-vars
  return async (err, req, res, next) => {
    const code = res.statusCode >= 400 ? res.statusCode : 500;
    await log('backend', 'error', 'handler', err.message || 'Unhandled error', {
      status: code,
      path: req.originalUrl,
      method: req.method,
      stack: err.stack,
    }).catch(()=>{});
    next(err);
  };
}
