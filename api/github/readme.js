import { handleCors, json } from '../_lib/cors.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') { json(res, 405, { error: 'Method not allowed' }); return; }

  try {
    const owner = req.query.owner;
    const repo = req.query.repo;
    if (!owner || !repo) {
      json(res, 400, { error: 'owner and repo query params required' });
      return;
    }

    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { 'User-Agent': 'Developer-Portfolio-App' }
    });

    if (!readmeRes.ok) {
      json(res, readmeRes.status, { error: 'README not found' });
      return;
    }

    const readmeData = await readmeRes.json();
    if (readmeData.content) {
      const text = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      json(res, 200, { text });
    } else {
      json(res, 404, { error: 'No content in README' });
    }
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}
