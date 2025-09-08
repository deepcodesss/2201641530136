const STACK = ['backend', 'frontend'];

const LEVEL = ['debug', 'info', 'warn', 'error', 'fatal'];

// Per the screenshot:
// Backend-only
const PKG_BACK = [
  'cache','controller','cron_job','db','domain','handler','repository','route','service'
];
// Frontend-only
const PKG_FRONT = ['api'];
// Both sides (shared)
const PKG_BOTH = ['auth','config','middleware','utils'];

export function validate({ stack, level, pkg }) {
  const errors = [];
  const s = `${stack}`.toLowerCase();
  const l = `${level}`.toLowerCase();
  const p = `${pkg}`.toLowerCase();

  if (!STACK.includes(s)) errors.push(`stack must be one of ${STACK.join(', ')}`);
  if (!LEVEL.includes(l)) errors.push(`level must be one of ${LEVEL.join(', ')}`);

  // compute allowed packages by stack:
  const allowed = s === 'backend'
    ? [...PKG_BACK, ...PKG_BOTH]
    : [...PKG_FRONT, ...PKG_BOTH];

  if (!allowed.includes(p)) {
    errors.push(
      `package '${p}' not allowed for stack '${s}'. Allowed: ${allowed.join(', ')}`
    );
  }

  return { ok: errors.length === 0, errors, stack: s, level: l, pkg: p };
}
