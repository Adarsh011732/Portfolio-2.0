/**
 * Client-side mirror of the backend portfolio sanitizer (api/_lib/security.js).
 * Applied at every data ingress point (localStorage boot, backend fetch, JSON
 * import, resume apply) so a hostile payload can never reach any href.
 */

const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file|blob):/i;
const TOP_LEVEL_KEYS = ['personal', 'socials', 'projects', 'categories', 'skills', 'education', 'certifications', 'testimonials'];
const ARRAY_CAPS = {
  projects: 300, education: 100, certifications: 300,
  categories: 50, skills: 50, testimonials: 200
};
const MAX_STRING_LENGTH = 10000;
const MAX_DEPTH = 12;
const MAX_NODES = 6000;
const KEYS_PER_OBJECT = 60;

function deepSanitize(value, depth, budget) {
  if (budget.count > MAX_NODES) return null;
  budget.count++;

  if (value === null || typeof value === 'undefined') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const stripped = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
    const cleaned = stripped.length > MAX_STRING_LENGTH ? stripped.slice(0, MAX_STRING_LENGTH) : stripped;
    return DANGEROUS_SCHEMES.test(cleaned.trim()) ? '' : cleaned;
  }
  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) return [];
    return value.map(item => deepSanitize(item, depth + 1, budget));
  }
  if (typeof value === 'object') {
    if (depth >= MAX_DEPTH) return {};
    const out = {};
    let keys = 0;
    for (const [k, v] of Object.entries(value)) {
      if (keys >= KEYS_PER_OBJECT) break;
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(k)) continue;
      out[k] = deepSanitize(v, depth + 1, budget);
      keys++;
    }
    return out;
  }
  return null;
}

/** Whitelists the portfolio schema and returns a fully sanitized deep copy. */
export function sanitizePortfolio(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const budget = { count: 0 };
  const out = {};
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in payload)) continue;
    let value = deepSanitize(payload[key], 1, budget);
    if (key in ARRAY_CAPS && Array.isArray(value)) value = value.slice(0, ARRAY_CAPS[key]);
    out[key] = value;
  }
  return out;
}
