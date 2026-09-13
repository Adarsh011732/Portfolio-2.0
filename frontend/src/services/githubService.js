import { fetchGitHubData } from './platformDataService';

export function normalizeTechName(techStr) {
  if (!techStr || typeof techStr !== 'string') return null;
  const clean = techStr.toLowerCase().trim().replace(/^[@#]/, '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export async function fetchGitHubUserData(usernameOrUrl, forceRefresh = false) {
  return await fetchGitHubData(usernameOrUrl, forceRefresh);
}
