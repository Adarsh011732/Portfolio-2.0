import { handleCors, readBody, json } from '../_lib/cors.js';
import { getPortfolio, savePortfolio } from '../_lib/db.js';
import { requireOwnerSession, sanitizePortfolioPayload } from '../_lib/security.js';

const MAX_CERTS = 300;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT' && req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  // SECURITY CHANGE: certification writes require an owner session + CSRF token.
  if (!requireOwnerSession(req, res)) return;

  try {
    const body = await readBody(req, 128 * 1024);
    const payload = JSON.parse(body || '{}');
    const current = (await getPortfolio()) || {};

    if (Array.isArray(payload.certifications)) {
      current.certifications = payload.certifications.slice(0, MAX_CERTS);
    } else if (payload.id) {
      current.certifications = (current.certifications || []).map(c =>
        c.id === payload.id ? { ...c, ...payload } : c
      );
    } else {
      json(res, 400, { success: false, error: 'Provide certifications[] or an id to update.' });
      return;
    }

    // Whitelist + deep sanitize before persisting
    const sanitized = sanitizePortfolioPayload(current);
    if (!sanitized) {
      json(res, 400, { success: false, error: 'Invalid certifications payload.' });
      return;
    }
    await savePortfolio(sanitized);
    json(res, 200, { success: true, certifications: sanitized.certifications });
  } catch (e) {
    console.error('[api/portfolio/certifications]:', e.message);
    json(res, 500, { success: false, error: 'Failed to update certifications.' });
  }
}
