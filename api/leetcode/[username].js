import { handleCors, json } from '../_lib/cors.js';
import { getCachedData, setCachedData } from '../_lib/db.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'GET') { json(res, 405, { error: 'Method not allowed' }); return; }

  try {
    const { username } = req.query;
    const forceRefresh = req.query.refresh === 'true';
    const data = await fetchLeetCodeProfile(username, forceRefresh);
    json(res, 200, data);
  } catch (e) {
    json(res, 500, { error: e.message });
  }
}

export async function fetchLeetCodeProfile(username, forceRefresh = false) {
  const cacheKey = `lc_${username.toLowerCase()}`;
  const cached = getCachedData(cacheKey, forceRefresh);
  if (cached) return cached;

  const cleanUser = username.trim().replace(/^@/, '').replace(/https?:\/\/leetcode\.com\/(?:u\/)?/i, '').replace(/\/$/, '');

  const query = `
    query getUserFullProfile($username: String!) {
      matchedUser(username: $username) {
        username
        githubUrl
        twitterUrl
        linkedinUrl
        profile {
          ranking
          reputation
          starRating
          aboutMe
          userAvatar
          countryName
          skillTags
        }
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        submissionCalendar
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        totalParticipants
        topPercentage
        badge {
          name
        }
      }
    }
  `;

  const lcRes = await fetch('https://leetcode.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://leetcode.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    body: JSON.stringify({ query, variables: { username: cleanUser } })
  });

  if (!lcRes.ok) throw new Error(`LeetCode GraphQL returned status ${lcRes.status}`);

  const jsonData = await lcRes.json();
  const matchedUser = jsonData.data?.matchedUser;
  if (!matchedUser) throw new Error(`LeetCode profile "${cleanUser}" not found.`);

  const subs = matchedUser.submitStatsGlobal?.acSubmissionNum ?? [];
  const allSub = subs.find(s => s.difficulty === 'All')?.count ?? 0;
  const easySub = subs.find(s => s.difficulty === 'Easy')?.count ?? 0;
  const medSub = subs.find(s => s.difficulty === 'Medium')?.count ?? 0;
  const hardSub = subs.find(s => s.difficulty === 'Hard')?.count ?? 0;

  const contestInfo = jsonData.data?.userContestRanking;
  const rating = contestInfo?.rating ? Math.round(contestInfo.rating) : null;
  const contests = contestInfo?.attendedContestsCount ?? 0;
  const ranking = matchedUser.profile?.ranking ?? null;

  const languages = (matchedUser.languageProblemCount ?? []).map(l => ({
    name: l.languageName,
    solved: l.problemsSolved
  }));

  const activity = [];
  if (matchedUser.submissionCalendar) {
    try {
      const calendarObj = JSON.parse(matchedUser.submissionCalendar);
      Object.entries(calendarObj).forEach(([timestampStr, count]) => {
        const ts = parseInt(timestampStr, 10) * 1000;
        const dateStr = new Date(ts).toISOString().split('T')[0];
        activity.push({ date: dateStr, count });
      });
      activity.sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {}
  }

  const result = {
    platform: 'leetcode',
    username: cleanUser,
    profileUrl: `https://leetcode.com/u/${cleanUser}/`,
    stats: {
      problemsSolved: allSub,
      easy: easySub,
      medium: medSub,
      hard: hardSub,
      rating,
      ranking,
      contests,
      reputation: matchedUser.profile?.reputation ?? 0
    },
    languages,
    activity,
    lastUpdated: new Date().toISOString(),
    status: 'synced'
  };

  setCachedData(cacheKey, result);
  return result;
}
