export function isValidUrl(u) {
  try {
    const x = new URL(u);
    return ["http:", "https:"].includes(x.protocol);
  } catch {
    return false;
  }
}

export function isValidShortcode(s) {
  return typeof s === "string" && /^[a-zA-Z0-9_-]{4,32}$/.test(s);
}

export function minutesToExpiry(minutes) {
  const m = Number.isInteger(minutes) && minutes > 0 ? minutes : null;
  return m;
}
