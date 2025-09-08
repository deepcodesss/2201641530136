import { validate } from './validator.js';
import { postLog } from './transport.js';
import { CONFIG } from './config.js';

/**
 * Log significant events
 * @param {'backend'|'frontend'} stack
 * @param {'debug'|'info'|'warn'|'error'|'fatal'} level
 * @param {string} pkg  // see allowed by stack
 * @param {string} message
 * @param {object} [meta] // optional context (serialized)
 */
export async function log(stack, level, pkg, message, meta = undefined) {
  const v = validate({ stack, level, pkg });
  if (!v.ok) {
    // do not throw — developers want to keep running; send a single validation log locally
    return { ok: false, errors: v.errors };
  }

  const body = {
    stack: v.stack,
    level: v.level,
    package: v.pkg,
    message: String(message),
  };

  // attach helpful context (not required by API, but good for future)
  if (meta && typeof meta === 'object') {
    body.meta = meta; // server may ignore; still useful if they accept
  }
  body.app = CONFIG.appName;
  body.ts = new Date().toISOString();

  return await postLog(body);
}

export { CONFIG } from './config.js';
