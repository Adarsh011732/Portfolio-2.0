import { handleCors, readBody, json } from '../_lib/cors.js';
import { getPortfolio, savePortfolio } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const data = await getPortfolio();
      if (data) {
        json(res, 200, data);
      } else {
        json(res, 404, { error: 'No portfolio data found. Run the migration script first.' });
      }
      return;
    }

    if (req.method === 'POST') {
      const body = await readBody(req, 512 * 1024);
      const payload = JSON.parse(body || '{}');
      if (!payload || typeof payload !== 'object') {
        json(res, 400, { error: 'Invalid payload' });
        return;
      }
      const success = await savePortfolio(payload);
      if (success) {
        json(res, 200, { success: true, message: 'Portfolio saved to database' });
      } else {
        json(res, 500, { error: 'Failed to save portfolio data' });
      }
      return;
    }

    json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
