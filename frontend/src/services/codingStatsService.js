import { fetchLeetCodeData, fetchCodolioData, fetchCodeforcesData } from './platformDataService';

export const SUPPORTED_PLATFORMS = [
  { id: 'codolio', name: 'Codolio', icon: 'Sparkles', color: '#8083ff', urlPrefix: 'https://codolio.com/profile/' },
  { id: 'leetcode', name: 'LeetCode', icon: 'Terminal', color: '#fb923c', urlPrefix: 'https://leetcode.com/u/' },
  { id: 'codeforces', name: 'Codeforces', icon: 'Code', color: '#38bdf8', urlPrefix: 'https://codeforces.com/profile/' },
  { id: 'codechef', name: 'CodeChef', icon: 'ChefHat', color: '#a855f7', urlPrefix: 'https://www.codechef.com/users/' },
  { id: 'gfg', name: 'GeeksforGeeks', icon: 'Binary', color: '#22c55e', urlPrefix: 'https://auth.geeksforgeeks.org/user/' },
  { id: 'hackerrank', name: 'HackerRank', icon: 'Award', color: '#10b981', urlPrefix: 'https://www.hackerrank.com/' }
];

export async function fetchPlatformStats(platformId, usernameOrUrl, forceRefresh = false) {
  if (!usernameOrUrl) throw new Error("Username or profile URL is required");

  const clean = usernameOrUrl.trim();
  const platform = platformId.toLowerCase();

  if (platform === 'codolio') {
    return await fetchCodolioData(clean, forceRefresh);
  }

  if (platform === 'leetcode') {
    return await fetchLeetCodeData(clean, forceRefresh);
  }

  if (platform === 'codeforces') {
    return await fetchCodeforcesData(clean, forceRefresh);
  }

  // Generic platform connection container without fake numbers
  return {
    platform: platformId,
    username: clean,
    profileUrl: clean.startsWith('http') ? clean : `#`,
    stats: {
      problemsSolved: null,
      easy: null,
      medium: null,
      hard: null,
      rating: null,
      maxRating: null,
      contests: null,
      streak: null
    },
    lastUpdated: new Date().toISOString(),
    status: 'connected'
  };
}

/**
 * Aggregates statistics across all connected platforms strictly with real numbers
 */
export function aggregateCodingStats(connectedPlatforms = [], codolioData = null) {
  let totalSolved = 0;
  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;
  let streak = 0;
  let activeDays = 0;
  let ranking = null;
  const platformBreakdown = [];
  const addedPlatformIds = new Set();

  // If Codolio is connected and has real problemsSolved
  if (codolioData && codolioData.stats?.problemsSolved != null && codolioData.stats.problemsSolved > 0) {
    totalSolved = codolioData.stats.problemsSolved;
    easySolved = codolioData.stats.easy ?? 0;
    mediumSolved = codolioData.stats.medium ?? 0;
    hardSolved = codolioData.stats.hard ?? 0;
    streak = codolioData.stats.streak ?? 0;
    activeDays = codolioData.stats.activeDays ?? 0;
    ranking = codolioData.stats.ranking ?? null;

    platformBreakdown.push({
      platform: 'Codolio (Unified)',
      color: '#8083ff',
      solved: totalSolved,
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved,
      profileUrl: codolioData.profileUrl || `https://codolio.com/profile/${codolioData.username || '01AdarshSingh'}`
    });
    addedPlatformIds.add('codolio');
  }

  // Also include individually connected platforms (LeetCode, Codeforces, etc.)
  connectedPlatforms.forEach(p => {
    if (p.stats && p.stats.problemsSolved != null && p.stats.problemsSolved > 0) {
      if (!totalSolved) {
        totalSolved += p.stats.problemsSolved;
      }
      
      const pEasy = p.stats.easy ?? 0;
      const pMed = p.stats.medium ?? 0;
      const pHard = p.stats.hard ?? 0;

      // If aggregated easy/med/hard are currently 0, supplement from connected platforms
      if (easySolved === 0 && mediumSolved === 0 && hardSolved === 0) {
        easySolved += pEasy;
        mediumSolved += pMed;
        hardSolved += pHard;
      }

      if (p.stats.streak && p.stats.streak > streak) streak = p.stats.streak;
      if (p.stats.activeDays && p.stats.activeDays > activeDays) activeDays = p.stats.activeDays;
      if (p.stats.ranking && !ranking) ranking = p.stats.ranking;

      const config = SUPPORTED_PLATFORMS.find(sp => sp.id === p.platform) || { color: '#8083ff', name: p.platform, urlPrefix: '' };
      
      platformBreakdown.push({
        platform: config.name,
        color: config.color,
        solved: p.stats.problemsSolved,
        easy: pEasy,
        medium: pMed,
        hard: pHard,
        rating: p.stats.rating ?? null,
        rank: p.stats.rank ?? null,
        profileUrl: p.profileUrl || (p.username ? `${config.urlPrefix || ''}${p.username}` : '#')
      });
      addedPlatformIds.add(p.platform);
    }
  });

  // Fallback: If totalSolved exists but easy/med/hard are still 0, check connected platforms sum
  if (totalSolved > 0 && easySolved === 0 && mediumSolved === 0 && hardSolved === 0) {
    connectedPlatforms.forEach(p => {
      if (p.stats) {
        easySolved += (p.stats.easy ?? 0);
        mediumSolved += (p.stats.medium ?? 0);
        hardSolved += (p.stats.hard ?? 0);
      }
    });
  }

  return {
    totalSolved: totalSolved > 0 ? totalSolved : null,
    easy: easySolved,
    medium: mediumSolved,
    hard: hardSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    streak: streak > 0 ? streak : null,
    activeDays: activeDays > 0 ? activeDays : null,
    ranking,
    platformBreakdown,
    hasData: totalSolved > 0
  };
}

