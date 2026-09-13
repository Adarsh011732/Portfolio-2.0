import { handleCors, json } from '../_lib/cors.js';
import { getCachedData, setCachedData } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') { json(res, 405, { error: 'Method not allowed' }); return; }

  try {
    const handle = req.query?.handle || req.url.split('/').pop().split('?')[0];
    const forceRefresh = req.query?.refresh === 'true';
    if (!handle) {
      json(res, 400, { error: 'Codeforces handle is required' });
      return;
    }
    const data = await fetchCodeforcesProfile(handle, forceRefresh);
    json(res, 200, data);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}

export async function fetchCodeforcesProfile(handle, forceRefresh = false) {
  const cacheKey = `cf_${handle.toLowerCase()}`;
  const cached = getCachedData(cacheKey, forceRefresh);
  if (cached) return cached;

  const clean = handle.trim().replace(/^@/, '').replace(/https?:\/\/codeforces\.com\/profile\//i, '').replace(/\/$/, '');

  // 1. User Info
  const userRes = await fetch(`https://codeforces.com/api/user.info?handles=${clean}`);
  const userData = await userRes.json();
  if (userData.status !== 'OK' || !userData.result?.[0]) {
    throw new Error(`Codeforces handle "${clean}" not found.`);
  }
  const u = userData.result[0];

  // 2. User Contests & Rating History
  const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${clean}`);
  const ratingData = await ratingRes.json();
  const contestHistory = ratingData.status === 'OK' ? ratingData.result : [];

  // 3. User Submissions & Solved Problems
  const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${clean}&from=1&count=2000`);
  const statusData = await statusRes.json();

  const solvedProblems = new Set();
  const activityMap = new Map();
  let easy = 0, medium = 0, hard = 0;

  if (statusData.status === 'OK' && Array.isArray(statusData.result)) {
    statusData.result.forEach(sub => {
      const dateStr = new Date((sub.creationTimeSeconds ?? 0) * 1000).toISOString().split('T')[0];
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);

      if (sub.verdict === 'OK' && sub.problem) {
        const probId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!solvedProblems.has(probId)) {
          solvedProblems.add(probId);
          const r = sub.problem.rating ?? 0;
          if (r > 0 && r <= 1200) easy++;
          else if (r > 1200 && r <= 1800) medium++;
          else if (r > 1800) hard++;
          else easy++;
        }
      }
    });
  }

  const activity = Array.from(activityMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const result = {
    platform: 'codeforces',
    username: clean,
    profileUrl: `https://codeforces.com/profile/${clean}`,
    stats: {
      problemsSolved: solvedProblems.size,
      easy,
      medium,
      hard,
      rating: u.rating ?? null,
      maxRating: u.maxRating ?? null,
      rank: u.rank ?? 'Unrated',
      maxRank: u.maxRank ?? 'Unrated',
      contests: contestHistory.length
    },
    activity,
    lastUpdated: new Date().toISOString(),
    status: 'synced'
  };

  setCachedData(cacheKey, result);
  return result;
}
