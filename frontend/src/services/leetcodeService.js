import { fetchLeetCodeData } from './platformDataService';

export async function fetchLeetCodeStats(usernameOrUrl, forceRefresh = false) {
  return await fetchLeetCodeData(usernameOrUrl, forceRefresh);
}
