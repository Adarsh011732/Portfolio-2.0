/**
 * Shared CORS + security headers and request utilities for Vercel serverless functions.
 *
 * CORS policy (strict):
 *  - FRONTEND_URL unset  -> same-origin only in production; localhost allowed in dev
 *  - FRONTEND_URL list   -> exact-match allowlist with credentials
 *  - FRONTEND_URL "*"    -> wildcard WITHOUT credentials (never combined)
 */
import { CSRF_HEADER_NAME } from './security.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function resolveCorsHeaders(origin) {
  const headers = { ...SECURITY_HEADERS };
  const configured = (process.env.FRONTEND_URL || '').split(',').map(o => o.trim()).filter(Boolean);

  if (configured.length) {
    if (configured.length === 1 && configured[0] === '*') {
      // Explicit wildcard: credentials are never combined with it
      headers['Access-Control-Allow-Origin'] = '*';
    } else if (origin && configured.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
      headers['Vary'] = 'Origin';
    }
    return headers;
  }

  // Unset: same-origin only in production; localhost browsers allowed in dev
  if (process.env.NODE_ENV !== 'production' && origin && isLocalDevOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
    headers['Vary'] = 'Origin';
  }
  return headers;
}

/**
 * Handle CORS preflight and return true if handled (caller should return early).
 * For all other methods, stashes the resolved security headers for json().
 */
export function handleCors(req, res) {
  const origin = req.headers.origin;
  const corsHeaders = resolveCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': `Content-Type, ${CSRF_HEADER_NAME}`,
      'Access-Control-Max-Age': '600'
    });
    res.end();
    return true;
  }

  res._securityHeaders = corsHeaders;
  return false;
}

/**
 * Read the full request body as a string, rejecting oversized payloads.
 */
export function readBody(req, maxBytes = 512 * 1024) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBytes) {
        req.destroy();
        reject(new Error('Payload too large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * Send a JSON response with the resolved security headers attached.
 */
export function json(res, statusCode, data) {
  res.writeHead(statusCode, {
    ...(res._securityHeaders || SECURITY_HEADERS),
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify(data));
}
