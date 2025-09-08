import { CONFIG } from './config.js';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export async function postLog(payload) {
  if (!CONFIG.enabled) return { skipped: true, reason: 'disabled' };
  if (!CONFIG.apiKey) throw new Error('LOG_API_KEY missing');

  const headers = {
    'Content-Type': 'application/json',
  };

  // Build auth header
  const value = CONFIG.authScheme
    ? `${CONFIG.authScheme} ${CONFIG.apiKey}`
    : CONFIG.apiKey;
  headers[CONFIG.authHeader] = value;

  // Native fetch in Node 18+; otherwise import('node-fetch')
  let attempt = 0, lastErr;
  while (attempt <= CONFIG.retries) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), CONFIG.timeoutMs);

      const res = await fetch(CONFIG.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });

      clearTimeout(t);

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { raw: text }; }

      if (!res.ok) {
        throw new Error(`Remote ${res.status}: ${text}`);
      }
      return { ok: true, data };
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt > CONFIG.retries) break;
      await sleep(200 * attempt); // tiny backoff
    }
  }
  throw lastErr;
}
