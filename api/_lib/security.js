/**
 * ============================================================================
 * Security Core — Zero-Dependency Hardening Layer (Portfolio 2.0)
 * ============================================================================
 *  1. escapeHtml                    -> contact-form email HTML injection kill switch
 *  2. sanitizeExternalUrl           -> javascript:/data: href kill switch
 *  3. sanitizePortfolioPayload      -> mass-assignment / stored-XSS kill switch
 *  4. HMAC-signed session tokens    -> replaces the guessable owner_token
 *  5. CSRF double-submit            -> pairs session cookie with header token
 *  6. Rate-limit evaluation         -> pure window logic (state stored in Mongo)
 *  7. Username validators          -> path-segment injection into upstream APIs
 * All helpers are pure and unit-testable without a database or network.
 * ============================================================================
 */

import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'portfolio_owner_session';
export const CSRF_COOKIE_NAME = 'portfolio_owner_csrf';
export const CSRF_HEADER_NAME = 'x-portfolio-csrf';
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

// ---------------------------------------------------------------------------
// 1. HTML ESCAPING (contact email body)
// ---------------------------------------------------------------------------
export function escapeHtml(value) {
  // Entity strings are written with \u0026 escape sequences so that the
  // literal '&' cannot be mangled by any transport/editor layer.
  return String(value ?? '')
    .replace(/&/g, '\u0026amp;')
    .replace(/</g, '\u0026lt;')
    .replace(/>/g, '\u0026gt;')
    .replace(/"/g, '\u0026quot;')
    .replace(/'/g, '\u0026#39;');
}

// ---------------------------------------------------------------------------
// 2. EXTERNAL URL SANITIZATION
// ---------------------------------------------------------------------------
const MAX_URL_LENGTH = 800;
const DANGEROUS_SCHEMES = /^(javascript|data|vbscript|file|blob):/i;

export function sanitizeExternalUrl(raw) {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value || value.length > MAX_URL_LENGTH) return null;
  if (/[\u0000-\u001f\u007f<>]/.test(value)) return null;
  if (DANGEROUS_SCHEMES.test(value)) return null;
  if (/^mailto:/i.test(value)) return value; // socials.email uses mailto:
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (!parsed.hostname) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 3. PORTFOLIO PAYLOAD SANITIZER (whitelist + deep walk)
// ---------------------------------------------------------------------------
const TOP_LEVEL_KEYS = ['personal', 'socials', 'projects', 'categories', 'skills', 'education', 'certifications', 'testimonials'];
const ARRAY_CAPS = {
  projects: 300, education: 100, certifications: 300,
  categories: 50, skills: 50, testimonials: 200
};
const MAX_STRING_LENGTH = 10000;
const MAX_DEPTH = 12;
const MAX_NODES = 6000;
const KEYS_PER_OBJECT = 60;

function clampString(value) {
  if (typeof value !== 'string') return value;
  const stripped = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  if (stripped.length > MAX_STRING_LENGTH) return stripped.slice(0, MAX_STRING_LENGTH);
  return stripped;
}

/**
 * Deep-walks a value: strips control characters from every string, nulls any
 * string that begins with a dangerous scheme (stored-XSS via href), clamps
 * string lengths, caps array sizes / object keys / depth / total nodes.
 */
function deepSanitize(value, depth, budget) {
  if (budget.count > MAX_NODES) return null;
  budget.count++;

  if (value === null || typeof value === 'undefined') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const cleaned = clampString(value);
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
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(k)) continue; // drop hostile/prototype-ish keys
      out[k] = deepSanitize(v, depth + 1, budget);
      keys++;
    }
    return out;
  }
  return null; // functions, symbols, bigint -> dropped
}

/** Whitelists the portfolio schema and returns a fully sanitized deep copy. */
export function sanitizePortfolioPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const budget = { count: 0 };
  const out = {};
  for (const key of TOP_LEVEL_KEYS) {
    if (!(key in payload)) continue;
    let value = deepSanitize(payload[key], 1, budget);
    if (key in ARRAY_CAPS && Array.isArray(value)) value = value.slice(0, ARRAY_CAPS[key]);
    out[key] = value;
  }
  // Personal/social URL fields get strict URL validation on top
  if (out.personal && typeof out.personal === 'object') {
    for (const field of ['avatar', 'resumeUrl']) {
      if (out.personal[field]) out.personal[field] = sanitizeExternalUrl(out.personal[field]) ?? '';
    }
  }
  if (out.socials && typeof out.socials === 'object') {
    for (const [k, v] of Object.entries(out.socials)) {
      if (typeof v === 'string' && v && !/^mailto:/i.test(v)) {
        out.socials[k] = sanitizeExternalUrl(v) ?? '';
      }
    }
    // Parser-junk guard: truncated GitHub URLs (e.g. github.com/2) must never
    // persist — they silently reconnect the site to a stranger's account.
    if (typeof out.socials.github === 'string' && out.socials.github) {
      const ghUser = out.socials.github
        .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!/^[A-Za-z0-9-]{3,39}$/.test(ghUser)) {
        out.socials.github = '';
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 4. SESSION TOKENS (HMAC-SHA256)
// ---------------------------------------------------------------------------
let cachedSecret = null;
let warnedAboutSecret = false;

export function getSessionSecret() {
  if (cachedSecret) return cachedSecret;
  const fromEnv = (process.env.SESSION_SECRET || '').trim();
  if (fromEnv.length >= 32) {
    cachedSecret = fromEnv;
    return cachedSecret;
  }
  if (!warnedAboutSecret) {
    warnedAboutSecret = true;
    console.warn('[SEC] SESSION_SECRET missing or too short (<32 chars). Using an ephemeral in-process secret: sessions do not survive cold starts. Set SESSION_SECRET in your hosting environment variables!');
  }
  cachedSecret = crypto.randomBytes(48).toString('hex');
  return cachedSecret;
}

export function safeEqualString(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

export function createSessionToken(ttlMs = SESSION_TTL_MS) {
  const payloadObj = { sub: 'owner', iat: Date.now(), exp: Date.now() + ttlMs };
  const payload = Buffer.from(JSON.stringify(payloadObj), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (typeof token !== 'string' || token.length > 1024) return null;
  const dot = token.lastIndexOf('.');
  if (dot < 1 || dot === token.length - 1) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  if (!safeEqualString(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || data.sub !== 'owner' || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ---------------------------------------------------------------------------
// 5. COOKIE HELPERS + CSRF DOUBLE-SUBMIT + SESSION GUARD
// ---------------------------------------------------------------------------
export function parseCookies(header) {
  const out = {};
  if (typeof header !== 'string') return out;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq <= 0) continue;
    const key = part.slice(0, eq).trim();
    const rawValue = part.slice(eq + 1).trim();
    if (!key) continue;
    let value = rawValue;
    try { value = decodeURIComponent(rawValue); } catch { /* keep raw */ }
    if (!(key in out)) out[key] = value;
  }
  return out;
}

export function buildCookieString(name, value, { maxAgeSec = null, httpOnly = true, secure = true, sameSite = 'Lax', path = '/' } = {}) {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  cookie += `; Path=${path}`;
  cookie += `; SameSite=${sameSite}`;
  if (httpOnly) cookie += '; HttpOnly';
  if (secure) cookie += '; Secure';
  if (maxAgeSec !== null) cookie += `; Max-Age=${Math.max(0, Math.floor(maxAgeSec))}`;
  return cookie;
}

export function verifyCsrfDoubleSubmit({ cookies, headerToken }) {
  const cookieToken = (cookies || {})[CSRF_COOKIE_NAME];
  if (!cookieToken || typeof headerToken !== 'string' || !headerToken) return false;
  return safeEqualString(cookieToken, headerToken);
}

/** Issues HttpOnly session + readable CSRF cookie pair on successful auth. */
export function issueSessionCookies(res, { secure = true } = {}) {
  const token = createSessionToken();
  const csrf = generateCsrfToken();
  const maxAgeSec = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader('Set-Cookie', [
    buildCookieString(SESSION_COOKIE_NAME, token, { maxAgeSec, httpOnly: true, secure, sameSite: 'Lax' }),
    buildCookieString(CSRF_COOKIE_NAME, csrf, { maxAgeSec, httpOnly: false, secure, sameSite: 'Lax' })
  ]);
  return { token, csrf };
}

/**
 * Gate for every mutating owner endpoint. Returns false (and writes the
 * 401/403 response) when the request is not authenticated.
 */
export function requireOwnerSession(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sessionData = verifySessionToken(cookies[SESSION_COOKIE_NAME]);
  if (!sessionData) {
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'Owner session required. Verify via email OTP and try again.' }));
    return false;
  }
  const headerToken = req.headers[CSRF_HEADER_NAME];
  if (!verifyCsrfDoubleSubmit({ cookies, headerToken })) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, error: 'CSRF validation failed. Refresh the page and re-verify owner access.' }));
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// 6. RATE LIMITING (pure logic; persistence handled by caller)
// ---------------------------------------------------------------------------
export function evaluateRateLimit(state, { max, windowMs }) {
  const now = Date.now();
  if (!state || typeof state !== 'object' || !state.windowStart || now - state.windowStart > windowMs) {
    return { allowed: true, state: { count: 1, windowStart: now }, retryAfterMs: 0 };
  }
  const count = (state.count || 0) + 1;
  if (count > max) {
    return { allowed: false, state: { count, windowStart: state.windowStart }, retryAfterMs: windowMs - (now - state.windowStart) };
  }
  return { allowed: true, state: { count, windowStart: state.windowStart }, retryAfterMs: 0 };
}

// ---------------------------------------------------------------------------
// 7. OTP + USERNAME VALIDATION
// ---------------------------------------------------------------------------
export function isValidOtp(code) {
  return typeof code === 'string' && /^[0-9]{6}$/.test(code);
}

export function safeCompareOtp(submitted, expected) {
  if (typeof submitted !== 'string' || typeof expected !== 'string') return false;
  if (submitted.length !== expected.length) return false;
  return safeEqualString(submitted, expected);
}

export function validateUsername(raw) {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().replace(/^@/, '').replace(/\/+$/, '');
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(cleaned)) return null;
  return cleaned;
}

export function validateGitName(raw) {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim();
  if (!/^[A-Za-z0-9_.-]{1,100}$/.test(cleaned) || cleaned.includes('..')) return null;
  return cleaned;
}

export function isValidEmail(raw) {
  return typeof raw === 'string' && /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(raw.trim()) && raw.trim().length <= 254;
}

/** Best-effort client IP for per-IP rate limiting behind Vercel's proxy. */
export function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.trim()) return xff.split(',')[0].trim();
  return 'unknown';
}
