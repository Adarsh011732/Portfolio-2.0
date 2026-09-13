import { handleCors, json } from './_lib/cors.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;
  json(res, 200, { status: 'ok', time: new Date().toISOString() });
}
