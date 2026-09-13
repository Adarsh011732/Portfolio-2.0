/**
 * Google Drive link parsing and preview helper utilities
 */

export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /drive\.google\.com|docs\.google\.com/i.test(url.trim());
}

export function extractGoogleDriveId(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();

  // Pattern 1: /file/d/FILE_ID/view or /file/d/FILE_ID
  const fileMatch = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileMatch && fileMatch[1]) return fileMatch[1];

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  const idMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Pattern 3: /d/FILE_ID/
  const dMatch = clean.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 4: /folders/FOLDER_ID
  const folderMatch = clean.match(/\/folders\/([a-zA-Z0-9_-]+)/i);
  if (folderMatch && folderMatch[1]) return folderMatch[1];

  return null;
}

export function getGoogleDriveEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const fileId = extractGoogleDriveId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return url.trim();
}

export function getGoogleDriveDirectUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const fileId = extractGoogleDriveId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  }
  return url.trim();
}
