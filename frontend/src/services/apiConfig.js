/**
 * Unified API Configuration
 * - Development: Defaults to '' (relative path) so Vite's dev proxy forwards /api to localhost:3001.
 * - Production: Set VITE_API_BASE_URL in your hosting platform (e.g. Vercel, Netlify)
 *   to point to your deployed backend (e.g. Render, Railway, Fly.io).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

export function getApiUrl(endpoint) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanPath}`;
}
