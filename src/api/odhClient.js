// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import envConfig from '../app/envConfig.js';

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


let requestCount = 0;
let lastReset = Date.now();

async function fetchJson(url, { signal, debug, origin } = {}) {
  // Rate Limiting: max 10 calls, then wait 3s
  const now = Date.now();
  if (now - lastReset > 1000) {
    // Reset count if window passed? No, the user said "10 times in a row back to back".
    // This implies a sliding window or just a counter.
    // "if we make any api call more than 10 times in a row back to back make sure to add a wait of 3 second"
    // Interpretation: After 10 calls, pause 3s, then reset count.
  }

  // Simple implementation:
  if (requestCount >= 10) {
    if (debug) console.log('[odhClient] Rate limit reached (10 calls), waiting 3s...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    requestCount = 0;
  }
  requestCount++;

  // console.log('[odhClient] Fetching URL:', url);
  const headers = {
    'Accept': 'application/json',
  };

  // Always ensure origin is set, prefer passed origin, fallback to default
  const effectiveOrigin = origin || 'webcomp-market-calender';

  let fetchUrl = url;
  if (effectiveOrigin) {
    // Check if origin param already exists
    const hasOrigin = fetchUrl.includes('origin=') || (fetchUrl.includes('?') && new URLSearchParams(fetchUrl.split('?')[1]).has('origin'));

    if (!hasOrigin) {
      const separator = fetchUrl.includes('?') ? '&' : '?';
      fetchUrl += `${separator}origin=${encodeURIComponent(effectiveOrigin)}`;
    }
  }

  // We also keep the header for compatibility
  if (effectiveOrigin) {
    headers['X-Origin'] = effectiveOrigin;
  }

  try {
    const res = await fetch(fetchUrl, {
      method: 'GET',
      signal,
      headers,
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

const DEFAULT_API_BASE = 'https://tourism.api.opendatahub.testingmachine.eu';

const START_FIELD = 'OperationSchedule.0.Start';
const STOP_FIELD = 'OperationSchedule.0.Stop';

/**
 * Format date for rawfilter (YYYYMMDD). Accepts YYYY-MM-DD or Date.
 * @param {string|Date} dateInput
 * @returns {string} YYYYMMDD
 */
function toYyyyMmDd(dateInput) {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Build rawfilter for ODHActivityPoi date filtering.
 */
export function buildActivityPoiDateRawfilter({ showPast, dateFrom, dateTo } = {}) {
  // When "show past" is on, do not send any date filter so the API returns all records including past
  if (showPast === true) return null;

  const today = showPast === false ? toYyyyMmDd(new Date()) : '';
  const from = dateFrom && String(dateFrom).trim() ? toYyyyMmDd(dateFrom.trim()) : '';
  const to = dateTo && String(dateTo).trim() ? toYyyyMmDd(dateTo.trim()) : '';

  const parts = [];

  if (from && to) {
    // Range: overlap logic — event overlaps [from, to] iff Start <= to AND Stop >= from
    parts.push(`le(${START_FIELD},'${to}')`);
    parts.push(`ge(${STOP_FIELD},'${from}')`);
  } else if (from) {
    // Only "from": event must start on or after this date; if showPast is false, use the later of today and from
    const effectiveFrom = today && from ? (from > today ? from : today) : (today || from);
    if (effectiveFrom) parts.push(`ge(${START_FIELD},'${effectiveFrom}')`);
  } else if (to) {
    // Only "to": event must end on or before this date; if showPast is false, also require Start >= today
    parts.push(`le(${STOP_FIELD},'${to}')`);
    if (today) parts.push(`ge(${START_FIELD},'${today}')`);
  } else if (today) {
    // No range, just "don't show past"
    parts.push(`ge(${START_FIELD},'${today}')`);
  }

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return `and(${parts.join(',')})`;
}

/**
 * Build combined rawfilter for ODHActivityPoi: date + optional category (tag).
 */
export function buildActivityPoiRawfilter({ showPast, dateFrom, dateTo, categoryTagIds, weekdays } = {}) {
  const datePart = buildActivityPoiDateRawfilter({ showPast, dateFrom, dateTo });
  const parts = datePart ? [datePart] : [];

  // Weekday rawfilter construction
  if (Array.isArray(weekdays) && weekdays.length > 0) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayFilters = weekdays.map(idx => {
      const dayName = dayNames[Number(idx)];
      if (!dayName) return null;
      // We check the first schedule and first time slot.
      // This assumes the standard structure for markets/fairs.
      return `eq(OperationSchedule.0.OperationScheduleTime.0.${dayName},true)`;
    }).filter(Boolean);

    if (dayFilters.length > 0) {
      if (dayFilters.length === 1) {
        parts.push(dayFilters[0]);
      } else {
        parts.push(`or(${dayFilters.join(',')})`);
      }
    }
  }

  // Category filtering (ODH Tags)
  // If we have category IDs, we need to filter by them.
  // The API supports 'odhtagfilter' param, but we can also use 'rawfilter'.
  // However, `odhtagfilter` is usually preferred for bitmask tags, but specific tags might need `eq(SmgTags, 'id')` or similar.
  // Looking at existing code, `odhtagfilter` was passed as a separate param in buildFirstPageUrl.
  // Here we only handle `rawfilter` parts. `odhtagfilter` is handled in `buildFirstPageUrl`.

  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  return `and(${parts.join(',')})`;
}

export function createOdhClient({ apiBase, debug = false, config = null, origin } = {}) {
  const base = apiBase || DEFAULT_API_BASE;
  const requestOrigin = origin || envConfig.ORIGIN;
  const source = getSource(config);
  const TYPE_TO_TAGFILTER = buildTypeToTagFilter(source);

  const VALID_TYPES = ['market', 'yearmarket'];

  function getPageSize(passed) {
    if (passed != null && Number.isFinite(passed) && passed > 0) return passed;
    const fromConfig = config?.pageSize;
    if (fromConfig != null && Number.isFinite(fromConfig) && fromConfig > 0) return fromConfig;
    return 20;
  }

  function buildFirstPageUrl({ type, pageSize, rawfilter, pagenumber, search, locfilter, odhtagfilter } = {}) {
    const resolvedType = type != null && VALID_TYPES.includes(type) ? type : null;
    if (type != null && !resolvedType && debug) {
      console.warn(
        '[webcomp-market-calendar] buildFirstPageUrl: invalid type "%s". Use one of: %s.',
        type,
        VALID_TYPES.join(', ')
      );
    }
    const tagfilter = resolvedType ? TYPE_TO_TAGFILTER[resolvedType] : null;

    const params = new URLSearchParams();
    params.append('source', source);
    if (tagfilter) {
      params.append('tagfilter', tagfilter);
    }

    const effectivePageSize = getPageSize(pageSize);

    // Search Refactor: if search filter is active, force page size to 0 (all results)
    if (search && String(search).trim()) {
      params.append('pagesize', '0');
      // Use 'searchfilter' instead of 'search'
      params.append('searchfilter', String(search).trim());
    } else {
      params.append('pagesize', String(effectivePageSize));
    }

    if (rawfilter && String(rawfilter).trim()) {
      params.append('rawfilter', String(rawfilter).trim());
    }

    if (locfilter && String(locfilter).trim()) {
      params.append('locfilter', String(locfilter).trim());
    }
    if (odhtagfilter && String(odhtagfilter).trim()) {
      params.append('odhtagfilter', String(odhtagfilter).trim());
    }

    // Markets Data Fetching Fix: Add rawsort to markets as well
    // Both types should be sorted by start date to ensure consistent ordering
    if (resolvedType === 'yearmarket' || resolvedType === 'market') {
      params.append('rawsort', 'OperationSchedule.0.Start');
    }

    if (pagenumber != null && Number.isFinite(pagenumber) && pagenumber > 0) {
      params.append('pagenumber', String(pagenumber));
    }

    return joinUrl(base, `v1/ODHActivityPoi?${params.toString()}`);
  }

  async function fetchPage({ type, pageNumber, pageSize, rawfilter, search, locfilter, odhtagfilter, signal } = {}) {
    const url = buildFirstPageUrl({
      type,
      pageSize: getPageSize(pageSize),
      rawfilter: rawfilter || undefined,
      pagenumber: pageNumber != null && pageNumber > 0 ? pageNumber : undefined,
      search: search || undefined,
      locfilter: locfilter || undefined,
      odhtagfilter: odhtagfilter || undefined,
    });
    return fetchPageByUrl(url, { signal });
  }

  function buildSingleItemUrl(id) {
    return joinUrl(base, `v1/ODHActivityPoi/${encodeURIComponent(id)}`);
  }

  /**
   * Resolve NextPage from API: if it's relative and query-only (e.g. "?seed=..."),
   * prepend the ODHActivityPoi path so the request goes to the correct endpoint.
   */
  function resolveNextPageUrl(nextPage) {
    if (!nextPage || typeof nextPage !== 'string') return nextPage || null;
    const s = nextPage.trim();
    if (isAbsoluteUrl(s)) return s;
    if (s.startsWith('?')) {
      return joinUrl(base, `v1/ODHActivityPoi${s}`);
    }
    return joinUrl(base, s);
  }

  function resolvePageUrl(url) {
    return resolveNextPageUrl(url || null);
  }

  async function fetchPageByUrl(url, { signal } = {}) {
    const toFetch = url && typeof url === 'string' && url.trim().startsWith('?')
      ? joinUrl(base, `v1/ODHActivityPoi${url.trim()}`)
      : (isAbsoluteUrl(url) ? url : joinUrl(base, url));
    const page = await fetchJson(toFetch, { signal, debug, origin: requestOrigin });
    const items = Array.isArray(page?.Items) ? page.Items : [];
    const next = resolvePageUrl(page?.NextPage);
    const previous = resolvePageUrl(page?.PreviousPage);
    return { items, page, nextPage: next, previousPage: previous };
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

    const item = await fetchJson(url, { signal, debug, origin: requestOrigin });
    return item;
  }

  /**
   * Fetch unique tag/category IDs (and names).
   * NEW: uses https://tourism.api.opendatahub.testingmachine.eu/v1/Tag/poi
   * instead of iterating over ODHActivityPoi pages.
   */
  async function fetchActivityPoiTagList({ type, signal, maxPages = 5, pageSize = 100 } = {}) {
    const params = new URLSearchParams();
    const url = joinUrl(base, `v1/Tag/poi?${params.toString()}`);

    try {
      const response = await fetchJson(url, { signal, debug, origin: requestOrigin });

      const items = Array.isArray(response) ? response : (Array.isArray(response?.Items) ? response.Items : []);

      const seen = new Map();
      for (const item of items) {
        const id = item?.Id;
        if (!id) continue;

        seen.set(id, { Id: id, Name: item.Name ? item.Name : id, _raw: item });
      }

      return Array.from(seen.values());

    } catch (e) {
      if (debug) console.warn('fetchActivityPoiTagList failed', e);
      return [];
    }
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

  async function fetchSimilarFairs({ odhtagfilter, locfilter, excludeId, signal, maxResults = 50, type = 'yearmarket', rawfilter } = {}) {
    const params = new URLSearchParams();
    params.append('source', source);
    const tagfilter = TYPE_TO_TAGFILTER[type] || (type === undefined ? null : TYPE_TO_TAGFILTER.yearmarket);
    if (tagfilter) params.append('tagfilter', tagfilter);
    params.append('pagesize', '25'); // Fetch 25 items per page

    if (odhtagfilter) params.append('odhtagfilter', odhtagfilter);
    if (locfilter) params.append('locfilter', locfilter);
    if (rawfilter) params.append('rawfilter', rawfilter);

    const results = [];
    let currentUrl = joinUrl(base, `v1/ODHActivityPoi?${params.toString()}`);

    // Fetch multiple pages until we have enough results or no more pages
    while (currentUrl && results.length < maxResults) {
      const url = isAbsoluteUrl(currentUrl) ? currentUrl : joinUrl(base, currentUrl);
      const data = await fetchJson(url, { signal, debug, origin: requestOrigin });
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
    const tagfilter = TYPE_TO_TAGFILTER[type] || (type === undefined ? null : TYPE_TO_TAGFILTER.market);
    if (tagfilter) params.append('tagfilter', tagfilter);
    params.append('pagesize', '100'); // Use larger page size for efficiency

    if (locfilter) params.append('locfilter', locfilter);

    let count = 0;
    let currentUrl = joinUrl(base, `v1/ODHActivityPoi?${params.toString()}`);

    // Fetch all pages to get accurate count
    while (currentUrl) {
      const url = isAbsoluteUrl(currentUrl) ? currentUrl : joinUrl(base, currentUrl);
      const data = await fetchJson(url, { signal, debug, origin: requestOrigin });
      const items = Array.isArray(data?.Items) ? data.Items : [];
      count += items.length;

      // Check if there's a next page
      currentUrl = data?.NextPage || null;
    }

    return count;
  }

  async function fetchMunicipalityList({ signal, language, pageSize = 500 } = {}) {
    const params = new URLSearchParams();
    params.append('pagesize', String(pageSize));
    if (language) params.append('language', language);
    let nextUrl = joinUrl(base, `v1/Municipality?${params.toString()}`);
    const out = [];
    while (nextUrl) {
      const url = isAbsoluteUrl(nextUrl) ? nextUrl : joinUrl(base, nextUrl);
      const response = await fetchJson(url, { signal, debug, origin: requestOrigin });
      const items = Array.isArray(response?.Items) ? response.Items : (Array.isArray(response) ? response : []);
      out.push(...items);
      nextUrl = response?.NextPage ? (isAbsoluteUrl(response.NextPage) ? response.NextPage : joinUrl(base, response.NextPage)) : null;
    }
    return out;
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

    const municipality = await fetchJson(url, { signal, debug, origin: requestOrigin });
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

    const district = await fetchJson(url, { signal, debug, origin: requestOrigin });
    return district;
  }

  async function fetchRegion(idOrUrl, { signal, language, fields, removenullvalues } = {}) {
    // idOrUrl can be a full URL or a relative path or just an ID
    let fullUrl = isAbsoluteUrl(idOrUrl) ? idOrUrl : joinUrl(base, idOrUrl);

    // If it's not a full URL and doesn't start with v1/, treat it as an ID
    if (!isAbsoluteUrl(idOrUrl) && !idOrUrl.startsWith('v1/')) {
      fullUrl = joinUrl(base, `v1/Region/${encodeURIComponent(idOrUrl)}`);
    }

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

    const region = await fetchJson(fullUrl, { signal, debug, origin: requestOrigin });
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

    const tourismAssociation = await fetchJson(fullUrl, { signal, debug, origin: requestOrigin });
    return tourismAssociation;
  }

  async function fetchAllTourismAssociations({ signal, language, pageSize } = {}) {
    const params = new URLSearchParams();

    if (language) params.append('language', language);
    if (pageSize && Number.isFinite(pageSize) && pageSize > 0) {
      params.append('pagesize', String(pageSize));
    }

    const url = joinUrl(base, `v1/TourismAssociation?${params.toString()}`);
    const response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    // Handle both direct array response and paginated response
    let items = [];
    let next = null;

    if (Array.isArray(response)) {
      items = response;
    } else if (Array.isArray(response?.Items)) {
      items = response.Items;
      next = response?.NextPage || null;
    }

    return { items, page: response, nextPage: next };
  }

  async function fetchTourismAssociationPageByUrl(url, { signal } = {}) {
    const fullUrl = isAbsoluteUrl(url) ? url : joinUrl(base, url);
    const response = await fetchJson(fullUrl, { signal, debug, origin: requestOrigin });

    let items = [];
    let next = null;

    if (Array.isArray(response)) {
      items = response;
    } else if (Array.isArray(response?.Items)) {
      items = response.Items;
      next = response?.NextPage || null;
    }

    return { items, page: response, nextPage: next };
  }

  async function fetchAllTourismAssociationsUntil({ minItems = 0, signal, language } = {}) {
    const out = [];
    const params = new URLSearchParams();
    if (language) params.append('language', language);
    params.append('pagesize', '100');
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

  async function fetchGeoShapeByName(name, { signal, srid = 'epsg:4326', type = 'region', pageSize = 1000, removenullvalues = false } = {}) {
    if (!name) {
      throw new Error('Name is required');
    }

    const escapeName = (name) => String(name).replace(/'/g, "''");

    const baseParams = new URLSearchParams();
    baseParams.append('pagenumber', '1');
    baseParams.append('pagesize', String(pageSize));
    baseParams.append('srid', srid);
    baseParams.append('type', type);
    baseParams.append('removenullvalues', String(removenullvalues));

    const originalName = escapeName(name);
    let params = new URLSearchParams(baseParams);
    params.append('rawfilter', `eq(Name, '${originalName}')`);
    let url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    let response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      return response.Items[0];
    }

    const upperName = escapeName(name.toUpperCase());
    params = new URLSearchParams(baseParams);
    params.append('rawfilter', `eq(Name, '${upperName}')`);
    url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      return response.Items[0];
    }

    params = new URLSearchParams(baseParams);
    params.append('rawfilter', `like(Name, '${originalName}')`);
    url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      const exactMatch = response.Items.find(item =>
        item?.Name?.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch) return exactMatch;
      return response.Items[0];
    }

    params = new URLSearchParams(baseParams);
    params.append('rawfilter', `like(Name, '${upperName}')`);
    url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      const exactMatch = response.Items.find(item =>
        item?.Name?.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch) return exactMatch;
      return response.Items[0];
    }

    return null;
  }

  async function fetchGeoShapeByMunicipalityName(municipalityName, options = {}) {
    return await fetchGeoShapeByName(municipalityName, { ...options, type: 'municipality' });
  }

  return {
    fetchAllOrUntil,
    searchItems,
    filterItems,
    buildFirstPageUrl,
    buildSingleItemUrl,
    fetchPageByUrl,
    fetchPage,
    fetchSingleItem,
    fetchSimilarFairs,
    countItemsByLocfilter,
    fetchMunicipalityList,
    fetchActivityPoiTagList,
    fetchMunicipality,
    fetchDistrict,
    fetchRegion,
    fetchTourismAssociation,
    fetchAllTourismAssociations,
    fetchAllTourismAssociationsUntil,
    fetchTourismAssociationPageByUrl,
    fetchGeoShapeByMunicipalityName,
    fetchGeoShapeByName,
    fetchJson,
  };
}
