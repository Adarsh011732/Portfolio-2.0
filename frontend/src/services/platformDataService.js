/**
 * Normalized Platform Data-Fetching Service
 * Connects React frontend to the backend proxy API with caching and refresh mechanisms.
 * Keeps all API logic outside React components.
 */

import { getApiUrl } from './apiConfig';

/**
 * Fetch GitHub Profile, Repositories, and Deep Technology Stack
 */
export async function fetchGitHubData(username, forceRefresh = false) {
  if (!username) throw new Error("GitHub username is required");
  const clean = username.trim().replace(/^@/, '').replace(/https?:\/\/github\.com\//i, '').replace(/\/$/, '');
  
  const refreshQuery = forceRefresh ? '?refresh=true' : '';
  const res = await fetch(getApiUrl(`/api/github/${encodeURIComponent(clean)}${refreshQuery}`));
  
  if (!res.ok) {
    throw new Error(`Failed to fetch GitHub data for "${clean}"`);
  }

  const data = await res.json();
  return {
    platform: 'github',
    username: clean,
    profileUrl: data.profileUrl ?? `https://github.com/${clean}`,
    user: data.user,
    stats: {
      repositories: data.stats?.repositories ?? null,
      stars: data.stats?.stars ?? null,
      forks: data.stats?.forks ?? null,
      followers: data.stats?.followers ?? null,
      commits: data.stats?.commits ?? null
    },
    activity: Array.isArray(data.activity) ? data.activity : [],
    detectedTechnologies: Array.isArray(data.detectedTechnologies) ? data.detectedTechnologies : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString()
  };
}

/**
 * Fetch LeetCode Real Data via GraphQL Backend
 */
export async function fetchLeetCodeData(username, forceRefresh = false) {
  if (!username) throw new Error("LeetCode username is required");
  const clean = username.trim().replace(/^@/, '').replace(/https?:\/\/leetcode\.com\/(?:u\/)?/i, '').replace(/\/$/, '');

  const refreshQuery = forceRefresh ? '?refresh=true' : '';
  const res = await fetch(getApiUrl(`/api/leetcode/${encodeURIComponent(clean)}${refreshQuery}`));

  if (!res.ok) {
    throw new Error(`Failed to fetch LeetCode data for "${clean}"`);
  }

  const data = await res.json();
  return {
    platform: 'leetcode',
    username: clean,
    profileUrl: data.profileUrl ?? `https://leetcode.com/u/${clean}/`,
    stats: {
      problemsSolved: data.stats?.problemsSolved ?? null,
      easy: data.stats?.easy ?? null,
      medium: data.stats?.medium ?? null,
      hard: data.stats?.hard ?? null,
      rating: data.stats?.rating ?? null,
      ranking: data.stats?.ranking ?? null,
      contests: data.stats?.contests ?? null,
      streak: data.stats?.streak ?? null
    },
    languages: Array.isArray(data.languages) ? data.languages : [],
    activity: Array.isArray(data.activity) ? data.activity : [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
    status: data.status ?? 'synced'
  };
}

/**
 * Fetch Codolio Aggregated Profile
 */
export async function fetchCodolioData(username, forceRefresh = false) {
  if (!username) throw new Error("Codolio username is required");
  const clean = username.trim().replace(/^@/, '').replace(/https?:\/\/codolio\.com\/profile\//i, '').replace(/\/$/, '');

  const refreshQuery = forceRefresh ? '?refresh=true' : '';
  const res = await fetch(getApiUrl(`/api/codolio/${encodeURIComponent(clean)}${refreshQuery}`));

  if (!res.ok) {
    throw new Error(`Failed to fetch Codolio data for "${clean}"`);
  }

  const data = await res.json();
  return {
    platform: 'codolio',
    username: clean,
    name: data.name ?? clean,
    profileUrl: data.profileUrl ?? `https://codolio.com/profile/${clean}`,
    stats: {
      problemsSolved: data.stats?.problemsSolved ?? null,
      easy: data.stats?.easy ?? null,
      medium: data.stats?.medium ?? null,
      hard: data.stats?.hard ?? null,
      streak: data.stats?.streak ?? null,
      activeDays: data.stats?.activeDays ?? null,
      ranking: data.stats?.ranking ?? null
    },
    platforms: Array.isArray(data.platforms) ? data.platforms : [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
    status: data.status ?? 'synced'
  };
}

/**
 * Fetch Codeforces Official Profile
 */
export async function fetchCodeforcesData(handle, forceRefresh = false) {
  if (!handle) throw new Error("Codeforces handle is required");
  const clean = handle.trim().replace(/^@/, '').replace(/https?:\/\/codeforces\.com\/profile\//i, '').replace(/\/$/, '');

  const refreshQuery = forceRefresh ? '?refresh=true' : '';
  const res = await fetch(getApiUrl(`/api/codeforces/${encodeURIComponent(clean)}${refreshQuery}`));

  if (!res.ok) {
    throw new Error(`Failed to fetch Codeforces data for "${clean}"`);
  }

  const data = await res.json();
  return {
    platform: 'codeforces',
    username: clean,
    profileUrl: data.profileUrl ?? `https://codeforces.com/profile/${clean}`,
    stats: {
      problemsSolved: data.stats?.problemsSolved ?? null,
      easy: data.stats?.easy ?? null,
      medium: data.stats?.medium ?? null,
      hard: data.stats?.hard ?? null,
      rating: data.stats?.rating ?? null,
      maxRating: data.stats?.maxRating ?? null,
      rank: data.stats?.rank ?? null,
      maxRank: data.stats?.maxRank ?? null,
      contests: data.stats?.contests ?? null
    },
    activity: Array.isArray(data.activity) ? data.activity : [],
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
    status: data.status ?? 'synced'
  };
}
