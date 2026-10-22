/**
 * Unified API Configuration
 * - Development: Defaults to '' (relative path) so Vite's dev proxy forwards /api to localhost:3001.
 * - Production: Set VITE_API_BASE_URL in your hosting platform (e.g. Vercel, Netlify)
 *   to point to your deployed backend (e.g. Render, Railway, Fly.io).
 * - apiFetch(): attaches the double-submit CSRF header on mutating requests and
 *   carries session cookies for cross-origin API deployments.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function getApiUrl(endpoint) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanPath}`;
}

function readCsrfToken() {
  try {
    const fromSession = sessionStorage.getItem('portfolio_owner_csrf');
    if (fromSession) return fromSession;
  } catch { /* storage unavailable */ }
  try {
    const match = document.cookie.match(/(?:^|;\s*)portfolio_owner_csrf=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  } catch { /* cookies unavailable */ }
  return null;
}

/**
 * CSRF-aware fetch wrapper. Use for ALL /api calls that can mutate owner data
 * (portfolio saves, certification updates, auth actions).
 */
export function apiFetch(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const opts = { ...options, headers: new Headers(options.headers || undefined) };

  // Different-origin API deployments must carry the session cookie explicitly
  if (/^https?:\/\//i.test(url)) {
    let crossOrigin = true;
    try { crossOrigin = new URL(url, window.location.href).origin !== window.location.origin; } catch { /* keep default */ }
    if (crossOrigin) opts.credentials = opts.credentials || 'include';
  }

  // Double-submit CSRF token for state-changing calls (pairs with the HttpOnly session cookie)
  const method = (opts.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = readCsrfToken();
    if (csrfToken && !opts.headers.has('x-portfolio-csrf')) {
      opts.headers.set('x-portfolio-csrf', csrfToken);
    }
  }

  return fetch(url, opts);
}
