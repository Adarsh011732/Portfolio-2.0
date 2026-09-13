import { handleCors, readBody, json } from '../_lib/cors.js';
import { getPortfolio, savePortfolio } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'PUT' && req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req, 128 * 1024);
    const payload = JSON.parse(body || '{}');
    const current = (await getPortfolio()) || {};

    if (Array.isArray(payload.certifications)) {
      current.certifications = payload.certifications;
    } else if (payload.id) {
      current.certifications = (current.certifications || []).map(c =>
        c.id === payload.id ? { ...c, ...payload } : c
      );
    }

    await savePortfolio(current);
    json(res, 200, { success: true, certifications: current.certifications });
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
