import { handleCors, readBody, json } from '../_lib/cors.js';
import { getPortfolio, savePortfolio } from '../_lib/db.js';
import { requireOwnerSession, sanitizePortfolioPayload } from '../_lib/security.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const data = await getPortfolio();
      if (data) {
        // Defense-in-depth: sanitize legacy rows before they reach any href
        const sanitized = sanitizePortfolioPayload(data) ?? data;
        json(res, 200, sanitized);
      } else {
        json(res, 404, { error: 'No portfolio data found. Run the migration script first.' });
      }
      return;
    }

    if (req.method === 'POST') {
      // SECURITY CHANGE: writes now require an owner session (HttpOnly cookie
      // + CSRF header). Previously ANY visitor could overwrite the portfolio.
      if (!requireOwnerSession(req, res)) return;

      const body = await readBody(req, 512 * 1024);
      const payload = JSON.parse(body || '{}');
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        json(res, 400, { success: false, error: 'Invalid payload.' });
        return;
      }

      // Whitelist the schema and strip hostile content (mass-assignment + stored-XSS guard)
      const sanitized = sanitizePortfolioPayload(payload);
      if (!sanitized) {
        json(res, 400, { success: false, error: 'Invalid portfolio payload.' });
        return;
      }

      const success = await savePortfolio(sanitized);
      if (success) {
        json(res, 200, { success: true, message: 'Portfolio saved to database' });
      } else {
        json(res, 500, { success: false, error: 'Failed to save portfolio data' });
      }
      return;
    }

    json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    console.error('[api/portfolio]:', e.message);
    json(res, 500, { success: false, error: 'Portfolio request failed.' });
  }
}
