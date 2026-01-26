// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

function getSource(config) {
  return (config && config.source) || 'hds';
}

function buildTypeToTagFilter(source) {
  return {
    market: `${source}:market`,
    yearmarket: `${source}:yearmarket`,
  };
}

function joinUrl(base, pathWithQuery) {
  const baseUrl = String(base || '').replace(/\/+$/, '');
  const path = String(pathWithQuery || '').replace(/^\/+/, '');
  return `${baseUrl}/${path}`;
}

function isAbsoluteUrl(u) {
  try {
    // eslint-disable-next-line no-new
    new URL(u);
    return true;
  } catch {
    return false;
  }
}

async function fetchJson(url, { signal, debug } = {}) {
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit', // Don't send cookies to avoid CORS issues
    });
    
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}${body ? ` - ${body}` : ''}`);
    }
    
    // Verify Content-Type to help avoid CORB issues
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
      if (debug) {
        console.warn('[webcomp-market-calendar] Unexpected Content-Type:', contentType, 'for', url);
      }
    }
    
    return await res.json();
  } catch (error) {
    // Re-throw fetch errors, but log CORB-related issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      if (debug) {
        console.warn('[webcomp-market-calendar] Fetch failed (may be CORB-related):', url);
      }
    }
    throw error;
  }
}

export function createOdhClient({ apiBase, debug = false, config = null } = {}) {
  const base = apiBase || 'https://tourism.api.opendatahub.testingmachine.eu';
  const source = getSource(config);
  const TYPE_TO_TAGFILTER = buildTypeToTagFilter(source);

  function buildFirstPageUrl({ type, pageSize } = {}) {
    const tagfilter = TYPE_TO_TAGFILTER[type];
    if (!tagfilter) throw new Error(`Unknown type "${type}"`);
    
    const params = new URLSearchParams();
    params.append('source', source);
    params.append('tagfilter', tagfilter);
    
    // Add pagesize if provided
    if (pageSize && Number.isFinite(pageSize) && pageSize > 0) {
      params.append('pagesize', String(pageSize));
    }
    
    return joinUrl(base, `v1/ODHActivityPoi?${params.toString()}`);
  }

  function buildSingleItemUrl(id) {
    return joinUrl(base, `v1/ODHActivityPoi/${encodeURIComponent(id)}`);
  }

  async function fetchPageByUrl(url, { signal } = {}) {
    const page = await fetchJson(url, { signal, debug });
    const items = Array.isArray(page?.Items) ? page.Items : [];
    const next = page?.NextPage || null;
    return { items, page, nextPage: next };
  }

  async function fetchSingleItem(id, { signal, language, fields, removenullvalues } = {}) {
    let url = buildSingleItemUrl(id);
    const params = [];
    if (language) params.push(`language=${encodeURIComponent(language)}`);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      params.push(`fields=${encodeURIComponent(fields.join(','))}`);
    }
    if (removenullvalues === true) params.push('removenullvalues=true');
    if (params.length > 0) url += '?' + params.join('&');
    
    const item = await fetchJson(url, { signal, debug });
    return item;
  }

  async function fetchAllOrUntil({ type, minItems = 0, signal } = {}) {
    const out = [];
    let nextUrl = buildFirstPageUrl({ type });

    // follow NextPage until we have enough or no more pages
    while (nextUrl) {
      const url = isAbsoluteUrl(nextUrl) ? nextUrl : joinUrl(base, nextUrl);
      const { items, nextPage } = await fetchPageByUrl(url, { signal });
      out.push(...items);

      if (minItems > 0 && out.length >= minItems) break;
      nextUrl = nextPage || null;
    }

    return out;
  }

  function searchItems(items, query, getTitle) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const t = String(getTitle?.(it) || '').toLowerCase();
      return t.includes(q);
    });
  }

  function filterItems(items, { municipalityId } = {}) {
    if (!municipalityId) return items;
    const wanted = String(municipalityId);
    return items.filter((it) => String(it?.LocationInfo?.MunicipalityInfo?.Id || '') === wanted);
  }

  async function fetchSimilarFairs({ odhtagfilter, locfilter, excludeId, signal, maxResults = 50, type = 'yearmarket' } = {}) {
    const params = new URLSearchParams();
    params.append('source', source);
    params.append('tagfilter', TYPE_TO_TAGFILTER[type] || TYPE_TO_TAGFILTER.yearmarket);
    params.append('pagesize', '25'); // Fetch 25 items per page
    
    if (odhtagfilter) params.append('odhtagfilter', odhtagfilter);
    if (locfilter) params.append('locfilter', locfilter);
    
    const results = [];
    let currentUrl = joinUrl(base, `v1/ODHActivityPoi?${params.toString()}`);
    
    // Fetch multiple pages until we have enough results or no more pages
    while (currentUrl && results.length < maxResults) {
      const url = isAbsoluteUrl(currentUrl) ? currentUrl : joinUrl(base, currentUrl);
      const data = await fetchJson(url, { signal, debug });
      const items = Array.isArray(data?.Items) ? data.Items : [];
      
      // Filter out the current fair
      const filtered = items.filter(item => String(item?.Id) !== String(excludeId));
      results.push(...filtered);
      
      // Check if there's a next page
      currentUrl = data?.NextPage || null;
      
      // Stop if we have enough results
      if (results.length >= maxResults) break;
    }
    
    // Return up to maxResults
    return results.slice(0, maxResults);
  }

  async function countItemsByLocfilter({ locfilter, type, signal } = {}) {
    const params = new URLSearchParams();
    params.append('source', source);
    params.append('tagfilter', TYPE_TO_TAGFILTER[type] || TYPE_TO_TAGFILTER.market);
    params.append('pagesize', '100'); // Use larger page size for efficiency
    
    if (locfilter) params.append('locfilter', locfilter);
    
    let count = 0;
    let currentUrl = joinUrl(base, `v1/ODHActivityPoi?${params.toString()}`);
    
    // Fetch all pages to get accurate count
    while (currentUrl) {
      const url = isAbsoluteUrl(currentUrl) ? currentUrl : joinUrl(base, currentUrl);
      const data = await fetchJson(url, { signal, debug });
      const items = Array.isArray(data?.Items) ? data.Items : [];
      count += items.length;
      
      // Check if there's a next page
      currentUrl = data?.NextPage || null;
    }
    
    return count;
  }

  async function fetchMunicipality(id, { signal, language, fields, removenullvalues } = {}) {
    let url = joinUrl(base, `v1/Municipality/${encodeURIComponent(id)}`);
    const params = [];
    
    if (language) params.push(`language=${encodeURIComponent(language)}`);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      params.push(`fields=${encodeURIComponent(fields.join(','))}`);
    }
    if (removenullvalues === true) params.push('removenullvalues=true');
    
    if (params.length > 0) url += '?' + params.join('&');
    
    const municipality = await fetchJson(url, { signal, debug });
    return municipality;
  }

  async function fetchDistrict(id, { signal, language, fields, removenullvalues } = {}) {
    let url = joinUrl(base, `v1/District/${encodeURIComponent(id)}`);
    const params = [];
    
    if (language) params.push(`language=${encodeURIComponent(language)}`);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      params.push(`fields=${encodeURIComponent(fields.join(','))}`);
    }
    if (removenullvalues === true) params.push('removenullvalues=true');
    
    if (params.length > 0) url += '?' + params.join('&');
    
    const district = await fetchJson(url, { signal, debug });
    return district;
  }

  async function fetchRegion(id, { signal, language, fields, removenullvalues } = {}) {
    let url = joinUrl(base, `v1/Region/${encodeURIComponent(id)}`);
    const params = [];
    
    if (language) params.push(`language=${encodeURIComponent(language)}`);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      params.push(`fields=${encodeURIComponent(fields.join(','))}`);
    }
    if (removenullvalues === true) params.push('removenullvalues=true');
    
    if (params.length > 0) url += '?' + params.join('&');
    
    const region = await fetchJson(url, { signal, debug });
    return region;
  }

  async function fetchTourismAssociation(url, { signal, language, fields, removenullvalues } = {}) {
    // url can be a full URL or a relative path
    let fullUrl = isAbsoluteUrl(url) ? url : joinUrl(base, url);
    const params = [];
    
    if (language) params.push(`language=${encodeURIComponent(language)}`);
    if (fields && Array.isArray(fields) && fields.length > 0) {
      params.push(`fields=${encodeURIComponent(fields.join(','))}`);
    }
    if (removenullvalues === true) params.push('removenullvalues=true');
    
    if (params.length > 0) {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl += separator + params.join('&');
    }
    
    const tourismAssociation = await fetchJson(fullUrl, { signal, debug });
    return tourismAssociation;
  }

  async function fetchAllTourismAssociations({ signal, language, pageSize } = {}) {
    const params = new URLSearchParams();
    
    if (language) params.append('language', language);
    if (pageSize && Number.isFinite(pageSize) && pageSize > 0) {
      params.append('pagesize', String(pageSize));
    }
    
    const url = joinUrl(base, `v1/TourismAssociation?${params.toString()}`);
    const response = await fetchJson(url, { signal, debug });
    
    // Handle both direct array response and paginated response
    let items = [];
    let next = null;
    
    if (Array.isArray(response)) {
      // Direct array response
      items = response;
    } else if (Array.isArray(response?.Items)) {
      // Paginated response with Items property
      items = response.Items;
      next = response?.NextPage || null;
    }
    
    return { items, page: response, nextPage: next };
  }

  async function fetchTourismAssociationPageByUrl(url, { signal } = {}) {
    const fullUrl = isAbsoluteUrl(url) ? url : joinUrl(base, url);
    const response = await fetchJson(fullUrl, { signal, debug });
    
    // Handle both direct array response and paginated response
    let items = [];
    let next = null;
    
    if (Array.isArray(response)) {
      // Direct array response
      items = response;
    } else if (Array.isArray(response?.Items)) {
      // Paginated response with Items property
      items = response.Items;
      next = response?.NextPage || null;
    }
    
    return { items, page: response, nextPage: next };
  }

  async function fetchAllTourismAssociationsUntil({ minItems = 0, signal, language } = {}) {
    const out = [];
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    params.append('pagesize', '100'); // Use a reasonable page size
    let nextUrl = joinUrl(base, `v1/TourismAssociation?${params.toString()}`);

    while (nextUrl) {
      const url = isAbsoluteUrl(nextUrl) ? nextUrl : joinUrl(base, nextUrl);
      const { items, nextPage } = await fetchTourismAssociationPageByUrl(url, { signal });
      out.push(...items);
      nextUrl = nextPage || null;

      if (minItems > 0 && out.length >= minItems) break;
      if (!nextUrl) break;
    }

    return out;
  }

  return {
    fetchAllOrUntil,
    searchItems,
    filterItems,
    buildFirstPageUrl,
    buildSingleItemUrl,
    fetchPageByUrl,
    fetchSingleItem,
    fetchSimilarFairs,
    countItemsByLocfilter,
    fetchMunicipality,
    fetchDistrict,
    fetchRegion,
    fetchTourismAssociation,
    fetchAllTourismAssociations,
    fetchAllTourismAssociationsUntil,
    fetchTourismAssociationPageByUrl,
  };
}


