// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

// Simple in-memory cache for location data (Municipality, District, Region)
const locationCache = new Map();

export function getCachedLocationName(type, id, lang) {
  const key = `${type}_${id}_${lang}`;
  return locationCache.get(key) || null;
}

export function setCachedLocationName(type, id, lang, name) {
  const key = `${type}_${id}_${lang}`;
  locationCache.set(key, name);
}

export function clearLocationCache() {
  locationCache.clear();
}

/**
 * Extract name from location data (Municipality, District, Region)
 */
function extractLocationName(data, lang) {
  if (!data) return null;
  
  // Try different possible field structures
  const name = 
    data?.Detail?.[lang]?.Title ||
    data?.Detail?.en?.Title ||
    data?.Detail?.it?.Title ||
    data?.Detail?.de?.Title ||
    data?.Name?.[lang] ||
    data?.Name?.en ||
    data?.Name?.it ||
    data?.Name?.de ||
    data?.Shortname ||
    data?.Title ||
    null;
  
  if (name) {
    const nameStr = String(name).trim();
    if (nameStr) return nameStr;
  }
  
  return null;
}

/**
 * Fetch municipality name from API if not available in cache
 */
export async function fetchMunicipalityName(municipalityId, lang, fetchFn) {
  if (!municipalityId || !fetchFn) return null;
  
  // Check cache first
  const cached = getCachedLocationName('municipality', municipalityId, lang);
  if (cached) return cached;
  
  try {
    const municipality = await fetchFn(municipalityId, { 
      language: lang,
      removenullvalues: true 
    });
    
    const name = extractLocationName(municipality, lang);
    if (name) {
      setCachedLocationName('municipality', municipalityId, lang, name);
      return name;
    }
    
    return null;
  } catch (error) {
    console.warn('[locationCache] Failed to fetch municipality:', municipalityId, error);
    return null;
  }
}

/**
 * Fetch district name from API if not available in cache
 */
export async function fetchDistrictName(districtId, lang, fetchFn) {
  if (!districtId || !fetchFn) return null;
  
  // Check cache first
  const cached = getCachedLocationName('district', districtId, lang);
  if (cached) return cached;
  
  try {
    const district = await fetchFn(districtId, { 
      language: lang,
      removenullvalues: true 
    });
    
    const name = extractLocationName(district, lang);
    if (name) {
      setCachedLocationName('district', districtId, lang, name);
      return name;
    }
    
    return null;
  } catch (error) {
    console.warn('[locationCache] Failed to fetch district:', districtId, error);
    return null;
  }
}

/**
 * Fetch region name from API if not available in cache
 */
export async function fetchRegionName(regionId, lang, fetchFn) {
  if (!regionId || !fetchFn) return null;
  
  // Check cache first
  const cached = getCachedLocationName('region', regionId, lang);
  if (cached) return cached;
  
  try {
    const region = await fetchFn(regionId, { 
      language: lang,
      removenullvalues: true 
    });
    
    const name = extractLocationName(region, lang);
    if (name) {
      setCachedLocationName('region', regionId, lang, name);
      return name;
    }
    
    return null;
  } catch (error) {
    console.warn('[locationCache] Failed to fetch region:', regionId, error);
    return null;
  }
}

