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

async function fetchJson(url, { signal, debug, origin } = {}) {
  // console.log('[odhClient] Fetching URL:', url);
  const headers = {
    'Accept': 'application/json',
  };
  if (origin) {
    headers['X-Origin'] = origin;
  }
  try {
    const res = await fetch(url, {
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
 * --- How ODH rawfilter works (for debugging) ---
 *
 * The API accepts a `rawfilter` query param with OData-like expressions:
 *
 *   ge(field, 'value')   → field >= value
 *   le(field, 'value')   → field <= value
 *   and(a, b, c)        → (a) AND (b) AND (c)
 *
 * For dates we use YYYYMMDD strings (e.g. '20260205').
 *
 * Event has OperationSchedule[0].Start and .Stop (ISO dates). We filter so:
 *   - "Event overlaps [from, to]" = (Start <= to) AND (Stop >= from)
 *     → le(OperationSchedule.0.Start, to) and ge(OperationSchedule.0.Stop, from)
 *   - "Event starts on or after from" → ge(OperationSchedule.0.Start, from)
 *   - "Event ends on or before to"    → le(OperationSchedule.0.Stop, to)
 *
 * To debug: log the return value of buildActivityPoiDateRawfilter(...) or inspect
 * the request URL in DevTools (Network tab) and decode the rawfilter param.
 */

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
 *
 * Rawfilter semantics (ODH API):
 * - ge(field, 'YYYYMMDD') = field >= date (event start/end on or after date)
 * - le(field, 'YYYYMMDD') = field <= date (event start/end on or before date)
 * - and(a, b, ...) = all conditions must be true
 *
 * Range [dateFrom, dateTo]: we use OVERLAP logic so events that occur in the range are included:
 * - Event overlaps [dateFrom, dateTo] when: Start <= dateTo AND Stop >= dateFrom
 * - So we add: le(OperationSchedule.0.Start, dateTo) and ge(OperationSchedule.0.Stop, dateFrom)
 * - That includes events that start before the range but end inside it, or span the whole range.
 *
 * @param {{ showPast: boolean, dateFrom?: string, dateTo?: string }} options
 * @returns {string|null} rawfilter string or null if no date filter
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
 * Zone / municipality is NOT handled here – use dedicated API filters instead of rawfilter on Name.
 * @param {{ showPast?: boolean, dateFrom?: string, dateTo?: string, categoryTagIds?: string[] }} options
 * @returns {string|null} rawfilter string or null
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
    const resolvedType =
      type != null && VALID_TYPES.includes(type) ? type : 'yearmarket';
    if (resolvedType !== type && debug) {
      console.warn(
        '[webcomp-market-calendar] buildFirstPageUrl: invalid type "%s", using "yearmarket". Use one of: %s.',
        type,
        VALID_TYPES.join(', ')
      );
    }
    const tagfilter = TYPE_TO_TAGFILTER[resolvedType];

    const params = new URLSearchParams();
    params.append('source', source);
    params.append('tagfilter', tagfilter);

    const effectivePageSize = getPageSize(pageSize);
    params.append('pagesize', String(effectivePageSize));
    if (rawfilter && String(rawfilter).trim()) {
      params.append('rawfilter', String(rawfilter).trim());
    }
    if (search && String(search).trim()) {
      params.append('search', String(search).trim());
    }
    if (locfilter && String(locfilter).trim()) {
      params.append('locfilter', String(locfilter).trim());
    }
    if (odhtagfilter && String(odhtagfilter).trim()) {
      params.append('odhtagfilter', String(odhtagfilter).trim());
    }

    if (resolvedType === 'yearmarket') {
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
   * Fetch unique tag/category IDs (and names) from ODHActivityPoi for use as category filter options.
   * Fetches pages of POIs and collects ODHTags (or Tags). Pass type 'market' or 'yearmarket' to limit to one, or omit to fetch both and merge.
   */
  async function fetchActivityPoiTagList({ type, signal, maxPages = 5, pageSize = 100 } = {}) {
    const seen = new Map();
    const types = type ? [type] : ['market', 'yearmarket'];
    for (const t of types) {
      let pageNum = 1;
      let hasMore = true;
      while (hasMore && pageNum <= maxPages) {
        const url = buildFirstPageUrl({
          type: t,
          pageSize,
          pagenumber: pageNum,
        });
        const { items } = await fetchPageByUrl(url, { signal });
        for (const item of items) {
          const tags = item?.ODHTags || item?.Tags || [];
          if (!Array.isArray(tags)) continue;
          for (const tag of tags) {
            const id = tag?.Id ?? tag?.Name ?? tag;
            if (id == null || String(id).trim() === '') continue;
            const key = String(id);
            if (seen.has(key)) continue;
            const name = typeof tag?.Name === 'string' ? tag.Name : (tag?.Detail?.en?.Title ?? tag?.Detail?.de?.Title ?? key);
            seen.set(key, { Id: key, Name: name });
          }
        }
        hasMore = items.length >= pageSize;
        pageNum += 1;
      }
    }
    return Array.from(seen.values()).sort((a, b) => String(a.Name).localeCompare(String(b.Name)));
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
    params.append('tagfilter', TYPE_TO_TAGFILTER[type] || TYPE_TO_TAGFILTER.market);
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

  /**
   * Fetch all municipalities from the API for use as zone filter options.
   * Returns array of { Id, Name } (Name may be object with language keys; we normalize to string).
   */
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
    const response = await fetchJson(fullUrl, { signal, debug, origin: requestOrigin });

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

  async function fetchGeoShapeByName(name, { signal, srid = 'epsg:4326', type = 'region', pageSize = 1000, removenullvalues = false } = {}) {
    if (!name) {
      throw new Error('Name is required');
    }

    // Helper function to escape single quotes for rawfilter
    const escapeName = (name) => String(name).replace(/'/g, "''");

    const baseParams = new URLSearchParams();
    baseParams.append('pagenumber', '1');
    baseParams.append('pagesize', String(pageSize));
    baseParams.append('srid', srid);
    baseParams.append('type', type);
    baseParams.append('removenullvalues', String(removenullvalues));

    // Try multiple approaches to find the entity (municipality or region)
    // 1. Try exact match with original casing
    const originalName = escapeName(name);
    let params = new URLSearchParams(baseParams);
    params.append('rawfilter', `eq(Name, '${originalName}')`);
    let url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    let response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      return response.Items[0];
    }

    // 2. Try exact match with uppercase (in case API stores names in uppercase)
    const upperName = escapeName(name.toUpperCase());
    params = new URLSearchParams(baseParams);
    params.append('rawfilter', `eq(Name, '${upperName}')`);
    url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      return response.Items[0];
    }

    // 3. Try like() with original casing (partial match, case-sensitive)
    params = new URLSearchParams(baseParams);
    params.append('rawfilter', `like(Name, '${originalName}')`);
    url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      // Find the best match (exact case-insensitive match)
      const exactMatch = response.Items.find(item =>
        item?.Name?.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch) return exactMatch;
      return response.Items[0];
    }

    // 4. Try like() with uppercase
    params = new URLSearchParams(baseParams);
    params.append('rawfilter', `like(Name, '${upperName}')`);
    url = joinUrl(base, `v1/GeoShape?${params.toString()}`);

    response = await fetchJson(url, { signal, debug, origin: requestOrigin });

    if (Array.isArray(response?.Items) && response.Items.length > 0) {
      // Find the best match (exact case-insensitive match)
      const exactMatch = response.Items.find(item =>
        item?.Name?.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch) return exactMatch;
      return response.Items[0];
    }

    return null;
  }

  // Keep the old function name for backward compatibility
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
  };
}


