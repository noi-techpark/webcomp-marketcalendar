// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Simple in-memory cache for municipality names
const municipalityCache = new Map();

export function getCachedMunicipalityName(id, lang) {
  const key = `${id}_${lang}`;
  return municipalityCache.get(key) || null;
}

export function setCachedMunicipalityName(id, lang, name) {
  const key = `${id}_${lang}`;
  municipalityCache.set(key, name);
}

export function clearMunicipalityCache() {
  municipalityCache.clear();
}

/**
 * Fetch municipality name from API if not available in cache
 * @param {string} municipalityId - The municipality ID
 * @param {string} lang - Language code (it, en, de)
 * @param {Function} fetchFn - Function to fetch municipality data (store.fetchMunicipality)
 * @returns {Promise<string|null>} Municipality name or null if not found
 */
export async function fetchMunicipalityName(municipalityId, lang, fetchFn) {
  if (!municipalityId || !fetchFn) return null;
  
  // Check cache first
  const cached = getCachedMunicipalityName(municipalityId, lang);
  if (cached) return cached;
  
  try {
    const municipality = await fetchFn(municipalityId, { 
      language: lang,
      removenullvalues: true 
    });
    
    if (!municipality) return null;
    
    // Extract name from municipality data
    // Try different possible field structures
    const name = 
      municipality?.Detail?.[lang]?.Title ||
      municipality?.Detail?.en?.Title ||
      municipality?.Detail?.it?.Title ||
      municipality?.Detail?.de?.Title ||
      municipality?.Name?.[lang] ||
      municipality?.Name?.en ||
      municipality?.Name?.it ||
      municipality?.Name?.de ||
      municipality?.Shortname ||
      municipality?.Title ||
      null;
    
    if (name) {
      const nameStr = String(name).trim();
      if (nameStr) {
        // Cache the result
        setCachedMunicipalityName(municipalityId, lang, nameStr);
        return nameStr;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('[municipalityCache] Failed to fetch municipality:', municipalityId, error);
    return null;
  }
}

