import { fetchCodolioData } from './platformDataService';

export async function fetchCodolioProfile(inputUrlOrUsername, forceRefresh = false) {
  return await fetchCodolioData(inputUrlOrUsername, forceRefresh);
}
