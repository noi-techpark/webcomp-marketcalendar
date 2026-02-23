// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { reactive, watch } from 'vue';
import { createOdhClient, buildActivityPoiRawfilter } from '../api/odhClient';

function emptyDataset() {
  return {
    itemsRaw: [],
    nextPageUrl: null,
    previousPageUrl: null,
    done: false,
    loading: false,
    error: null,
    paginationMeta: null, // { TotalPages, TotalResults, CurrentPage }
  };
}

export function createStore(config) {
  const state = reactive({
    activeTab: config.initialView || 'markets',
    /** Current UI language; kept in sync with config.language so views react to language change. */
    language: (() => {
      // Priority: 1. URL search param, 2. localStorage, 3. Attributes/Config (default)
      const fromUrl = new URLSearchParams(window.location.search).get('language');
      if (fromUrl) return fromUrl.toLowerCase();
      try {
        const fromLocal = localStorage.getItem('wcmc-language');
        if (fromLocal) return fromLocal.toLowerCase();
      } catch { }
      return config.language || 'en';
    })(),
    // Simple internal routing
    route: {
      name: 'marketsList', // marketsList | marketDetail | fairsList | fairsDetail | map | communityList | communityDetail
      params: {},
    },
    ui: {
      markets: { page: 1 },
      fairs: { page: 1 },
      community: { page: 1 },
    },
    markets: emptyDataset(),
    fairs: emptyDataset(),
    communities: { ...emptyDataset(), searchQuery: '' },
    filterMetadata: {
      municipalities: [],
      tags: [],
      loading: false,
      error: null,
      loadedLanguage: null,
    },
    globalCounts: {
      markets: {}, // communityId -> count
      fairs: {},   // communityId -> count
      loaded: false,
      loading: false,
    },
  });

  // Sync initial language back to config
  config.language = state.language;

  function setLanguage(lang) {
    const next = String(lang || 'en').toLowerCase();
    state.language = next;
    config.language = next;
    try {
      localStorage.setItem('wcmc-language', next);
    } catch { }

    // Update URL if possible (optional but helpful)
    try {
      const url = new URL(window.location);
      url.searchParams.set('language', next);
      window.history.replaceState({}, '', url);
    } catch { }
  }

  let client = createOdhClient({ apiBase: config.apiBase, debug: config.debug, config });

  function log(...args) {
    // if (config.debug) console.log('[webcomp-market-calendar]', ...args);
  }

  function resetData() {
    state.markets = Object.assign(state.markets, emptyDataset());
    state.fairs = Object.assign(state.fairs, emptyDataset());
    state.communities = Object.assign(state.communities, emptyDataset());
    state.filterMetadata.municipalities = [];
    state.filterMetadata.tags = [];
  }

  function setTab(tab) {
    state.activeTab = tab;
    if (tab === 'markets') state.route = { name: 'marketsList', params: {} };
    if (tab === 'fairs') state.route = { name: 'fairsList', params: {} };
    if (tab === 'map') state.route = { name: 'map', params: {} };
    if (tab === 'community') state.route = { name: 'communityList', params: {} };

    // Reset community search if leaving community tab (or even if entering, to start fresh)
    if (tab !== 'community' && state.communities.searchQuery) {
      state.communities.searchQuery = '';
      state.communities.itemsRaw = [];
      state.communities.nextPageUrl = null;
      state.communities.done = false;
      state.communities.loading = false;
      state.communities.error = null;
      state.communities.paginationMeta = null;
      state.ui.community.page = 1;
    }
  }

  function go(name, params = {}) {
    state.route = { name, params };
  }

  function setListPage(listKey, page) {
    const p = Number(page);
    const next = Number.isFinite(p) && p > 0 ? p : 1;
    if (listKey === 'markets') state.ui.markets.page = next;
    if (listKey === 'fairs') state.ui.fairs.page = next;
    if (listKey === 'community') state.ui.community.page = next;
  }

  function resetList(type) {
    if (type !== 'market' && type !== 'yearmarket' && type !== 'all') return;
    if (type === 'all') {
      Object.assign(state.markets, emptyDataset());
      Object.assign(state.fairs, emptyDataset());
      return;
    }
    const ds = datasetFor(type);
    if (!ds) return;
    Object.assign(ds, emptyDataset());
  }

  function datasetFor(type) {
    return type === 'market' ? state.markets : state.fairs;
  }

  async function ensureLoaded(type, minItems, { signal, rawfilter, pageSize, search, locfilter, odhtagfilter } = {}) {
    if (type !== 'market' && type !== 'yearmarket' && type !== 'all') {
      log('ensureLoaded skipped: invalid type', type);
      return;
    }
    // For 'all' we use a temporary virtual dataset or just pick one to manage pagination if needed,
    // but in MapView it's used with minItems=999999 and reset before call.
    const ds = type === 'all' ? state.fairs : datasetFor(type);
    if (ds.loading) return;
    const effectivePageSize = pageSize != null && Number.isFinite(pageSize) && pageSize > 0
      ? pageSize
      : (config.pageSize || 20);
    // When caller requests a specific page size (e.g. map uses 50), start fresh so we use that size
    if (pageSize != null && Number.isFinite(pageSize) && pageSize > 0 && (ds.nextPageUrl || ds.itemsRaw.length > 0)) {
      resetList(type);
    }
    if (ds.done && ds.itemsRaw.length >= minItems) return;

    ds.loading = true;
    if (type === 'all') state.markets.loading = true;
    ds.error = null;
    if (type === 'all') state.markets.error = null;
    try {
      if (!ds.nextPageUrl && !ds.done) {
        ds.nextPageUrl = client.buildFirstPageUrl({
          type: type === 'all' ? undefined : type,
          pageSize: effectivePageSize,
          rawfilter: rawfilter || undefined,
          search: search || undefined,
          locfilter: locfilter || undefined,
          odhtagfilter: odhtagfilter || undefined,
        });
      }

      while (ds.nextPageUrl && ds.itemsRaw.length < minItems) {
        const { items, nextPage, page } = await client.fetchPageByUrl(ds.nextPageUrl, { signal });

        if (type === 'all') {
          // Distribute items based on tags
          items.forEach(item => {
            const tagIds = item.TagIds || [];
            if (tagIds.includes('hds:market')) state.markets.itemsRaw.push(item);
            if (tagIds.includes('hds:yearmarket')) state.fairs.itemsRaw.push(item);
          });
          // Also push to the 'ds' we are trackig for the loop if it's not one of them
          // but here ds is state.fairs, so it's already being pushed if tag matches.
          // To be safe and ensure the loop continues until minItems:
          if (ds.itemsRaw.length < minItems) {
            // We use fairs as the master dataset for 'all' pagination tracking
          }
        } else {
          ds.itemsRaw.push(...items);
        }
        if (page && !ds.paginationMeta && (page.TotalPages !== undefined || page.TotalResults !== undefined)) {
          ds.paginationMeta = {
            TotalPages: page.TotalPages || null,
            TotalResults: page.TotalResults || null,
            CurrentPage: page.CurrentPage || null,
          };
        }
        ds.nextPageUrl = nextPage || null;
        if (!ds.nextPageUrl) ds.done = true;
      }
      if (!ds.nextPageUrl) ds.done = true;
      log('loaded', type, ds.itemsRaw.length, 'done=', ds.done);
    } catch (e) {
      ds.error = e?.message || String(e);
      log('load error', type, ds.error);
    } finally {
      ds.loading = false;
      if (type === 'all') state.markets.loading = false;
    }
  }

  async function fetchListPage(type, pageNumber, { rawfilter, signal, search, locfilter, odhtagfilter } = {}) {
    if (type !== 'market' && type !== 'yearmarket') {
      log('fetchListPage skipped: invalid type', type);
      return;
    }
    const ds = datasetFor(type);
    const requestedPage = Number(pageNumber) || 1;
    const currentPage = ds.paginationMeta?.CurrentPage ?? 0;
    const useNextPage = requestedPage === currentPage + 1 && ds.nextPageUrl;
    const usePreviousPage = requestedPage === currentPage - 1 && requestedPage >= 1 && ds.previousPageUrl;

    ds.loading = true;
    ds.error = null;
    try {
      let items;
      let nextPage;
      let previousPage;
      let page;

      if (useNextPage) {
        const result = await client.fetchPageByUrl(ds.nextPageUrl, { signal });
        items = result.items;
        nextPage = result.nextPage;
        previousPage = result.previousPage;
        page = result.page;
      } else if (usePreviousPage) {
        const result = await client.fetchPageByUrl(ds.previousPageUrl, { signal });
        items = result.items;
        nextPage = result.nextPage;
        previousPage = result.previousPage;
        page = result.page;
      } else {
        const pageSize = config.pageSize || 20;
        const result = await client.fetchPage({
          type,
          pageNumber: requestedPage,
          pageSize,
          rawfilter: rawfilter || undefined,
          search: search || undefined,
          locfilter: locfilter || undefined,
          odhtagfilter: odhtagfilter || undefined,
          signal,
        });
        items = result.items;
        nextPage = result.nextPage;
        previousPage = result.previousPage;
        page = result.page;
      }

      ds.itemsRaw = items;
      ds.nextPageUrl = nextPage || null;
      ds.previousPageUrl = previousPage || null;
      ds.done = !nextPage;
      // Always update CurrentPage so sequential NextPage is used correctly (API may use Seed).
      const resolvedCurrentPage = page?.CurrentPage ?? requestedPage;
      const totalPages = page?.TotalPages ?? ds.paginationMeta?.TotalPages ?? null;
      const totalResults = page?.TotalResults ?? ds.paginationMeta?.TotalResults ?? null;
      ds.paginationMeta = {
        TotalPages: totalPages,
        TotalResults: totalResults,
        CurrentPage: resolvedCurrentPage,
      };
      log('fetchListPage', type, requestedPage, ds.itemsRaw.length);
    } catch (e) {
      ds.error = e?.message || String(e);
      log('load error', type, ds.error);
    } finally {
      ds.loading = false;
    }
  }

  function findById(type, id) {
    const ds = datasetFor(type);
    const wanted = String(id);
    return ds.itemsRaw.find((it) => String(it?.Id) === wanted) || null;
  }

  async function fetchDetailById(id, { signal, removenullvalues } = {}) {
    try {
      log('fetching detail for', id);
      const item = await client.fetchSingleItem(id, {
        signal,
        language: config.language,
        removenullvalues: removenullvalues !== undefined ? removenullvalues : true // Default to true to reduce payload
      });
      log('fetched detail', id, item ? 'success' : 'not found');
      return item;
    } catch (e) {
      log('error fetching detail', id, e?.message || String(e));
      // Fallback: try to find in already loaded list data
      const parts = String(id).split(':');
      if (parts.length >= 2 && parts[1] === 'market') {
        return findById('market', id);
      } else if (parts.length >= 2 && parts[1] === 'yearmarket') {
        return findById('yearmarket', id);
      }
      return null;
    }
  }

  async function fetchSimilarFairs(options) {
    const result = await client.fetchSimilarFairs(options);
    // For backward compatibility, return items if it's an array, otherwise return the full result
    return Array.isArray(result) ? result : result.items;
  }

  async function fetchSimilarItems({ type, ...options }) {
    // Wrapper to fetch similar items for any type (market or yearmarket)
    return await fetchSimilarFairs({ ...options, type });
  }

  async function countItemsByLocfilter({ locfilter, type, signal } = {}) {
    return await client.countItemsByLocfilter({ locfilter, type, signal });
  }

  async function fetchMunicipality(id, options = {}) {
    return await client.fetchMunicipality(id, options);
  }

  async function fetchDistrict(id, options = {}) {
    return await client.fetchDistrict(id, options);
  }

  async function fetchRegion(id, options = {}) {
    return await client.fetchRegion(id, options);
  }

  async function fetchTourismAssociation(url, options = {}) {
    return await client.fetchTourismAssociation(url, options);
  }

  async function ensureCommunitiesLoaded(minItems, { signal } = {}) {
    const ds = state.communities;
    if (ds.loading) return;
    if (ds.done && ds.itemsRaw.length >= minItems) return;

    ds.loading = true;
    ds.error = null;
    try {
      if (!ds.nextPageUrl && !ds.done) {
        const pageSize = config.pageSize || 20;
        const params = new URLSearchParams();
        params.append('pagesize', String(pageSize));
        params.append('pagenumber', '1');
        if (config.language) params.append('language', config.language);
        if (state.communities.searchQuery) params.append('searchfilter', state.communities.searchQuery);
        ds.nextPageUrl = `${config.apiBase || 'https://tourism.api.opendatahub.testingmachine.eu'}/v1/TourismAssociation?${params.toString()}`;
      }

      while (ds.nextPageUrl && ds.itemsRaw.length < minItems) {
        // Use fetchTourismAssociationPageByUrl if available, otherwise fallback to fetchPageByUrl
        const fetchFn = client.fetchTourismAssociationPageByUrl || client.fetchPageByUrl;
        const result = await fetchFn(ds.nextPageUrl, { signal });
        const { items, nextPage, page } = result;

        // Store pagination metadata from the first page response
        if (page && !ds.paginationMeta && (page.TotalPages !== undefined || page.TotalResults !== undefined)) {
          ds.paginationMeta = {
            TotalPages: page.TotalPages || null,
            TotalResults: page.TotalResults || null,
            CurrentPage: page.CurrentPage || null,
          };
        }

        ds.itemsRaw.push(...items);
        ds.nextPageUrl = nextPage || null;
        if (!ds.nextPageUrl) ds.done = true;
      }
      if (!ds.nextPageUrl) ds.done = true;
      log('loaded communities', ds.itemsRaw.length, 'done=', ds.done);

    } catch (e) {
      ds.error = e?.message || String(e);
      log('load error communities', ds.error);
    } finally {
      ds.loading = false;
    }
  }

  async function fetchCommunityById(id, { signal } = {}) {
    try {
      log('fetching community for', id);
      const url = `${config.apiBase || 'https://tourism.api.opendatahub.testingmachine.eu'}/v1/TourismAssociation/${encodeURIComponent(id)}`;
      const item = await client.fetchTourismAssociation(url, {
        signal,
        language: config.language
      });
      log('fetched community', id, item ? 'success' : 'not found');
      return item;
    } catch (e) {
      log('error fetching community', id, e?.message || String(e));
      // Fallback: try to find in already loaded list data
      const wanted = String(id);
      return state.communities.itemsRaw.find((it) => String(it?.Id) === wanted) || null;
    }
  }

  async function fetchGeoShapeByMunicipalityName(municipalityName, options = {}) {
    return await client.fetchGeoShapeByMunicipalityName(municipalityName, options);
  }

  const lang = () => state.language || config.language || 'en';

  // Static category options for the filter (no API calls). Use config.filterCategoryOptions to override.
  const DEFAULT_CATEGORY_OPTIONS = [{ Id: 'POI', Name: 'POI' }];

  function getStaticCategoryOptions() {
    return Array.isArray(config.filterCategoryOptions) && config.filterCategoryOptions.length > 0
      ? config.filterCategoryOptions.map((c) => ({ Id: c.Id ?? c.id ?? c, Name: c.Name ?? c.name ?? String(c) }))
      : []; // Default to empty if not configured, we will fetch from API
  }

  async function ensureFilterMetadataLoaded({ signal } = {}) {
    const meta = state.filterMetadata;
    if (meta.loading) return;
    const currentLang = lang();
    if (meta.municipalities.length > 0 && meta.loadedLanguage === currentLang) return;

    meta.loading = true;
    meta.error = null;
    meta.tags = getStaticCategoryOptions();
    // Reset municipalities if language changed
    if (meta.loadedLanguage !== currentLang) {
      meta.municipalities = [];
    }
    try {
      const language = lang();

      // Fetch Tags from API if no static options provided or to supplement
      // User requested: make a api call to .../v1/Tag/poi
      const tagsUrl = `${config.apiBase || 'https://tourism.api.opendatahub.testingmachine.eu'}/v1/Tag/poi?validforentity=active&origin=webcomp-market-calender`;
      const tagsRes = await client.fetchJson(tagsUrl);
      if (tagsRes && tagsRes.Id) {
        const effectiveId = tagsRes.Id;
        let name = tagsRes.TagName[language];

        const existingIds = new Set(meta.tags.map(t => t.Id));
        if (!existingIds.has(effectiveId)) {
          meta.tags.push({ Id: effectiveId, Name: name });
        }
      }

      // Only pass language if it's not 'en' or if API requires it for localized names
      const muniList = await client.fetchMunicipalityList({ signal, language });

      meta.municipalities = (muniList || []).map((m) => {
        const rawName = m?.Detail?.[language]?.Title;

        let nameStr = rawName

        if (!nameStr && rawName && typeof rawName === 'object') {
          const first = Object.values(rawName).find((v) => typeof v === 'string' && String(v).trim());
          nameStr = first ? String(first).trim() : '';
        }
        if (!nameStr) nameStr = String(m?.Id ?? '').trim();
        return { Id: m?.Id, Name: nameStr || String(m?.Id ?? ''), RawName: rawName };
      }).filter((m) => m.Name);
      meta.loadedLanguage = language;
    } catch (e) {
      meta.error = e?.message || String(e);
    } finally {
      meta.loading = false;
    }
  }

  async function fetchGeoShapeByName(name, options = {}) {
    return await client.fetchGeoShapeByName(name, options);
  }

  async function fetchCommunityActivities(communityId) {
    if (!communityId) return;

    // Check if we already have data for this community
    if (state.globalCounts.markets[communityId] !== undefined && state.globalCounts.fairs[communityId] !== undefined) return;

    try {
      const locfilter = communityId;
      const rawfilter = buildActivityPoiRawfilter({ showPast: false });

      const url = `${config.apiBase || 'https://tourism.api.opendatahub.testingmachine.eu'}/v1/ODHActivityPoi`;
      const params = new URLSearchParams();
      params.append('pagenumber', '1');
      params.append('pagesize', '0'); // User insisted on pagesize=0 to get all related values
      params.append('type', '255');
      params.append('locfilter', `tvs${locfilter}`);
      params.append('source', 'hds');
      // params.append('odhtagfilter', 'market,yearmarket'); // User requested client-side filtering
      if (rawfilter) params.append('rawfilter', rawfilter);

      const res = await client.fetchJson(`${url}?${params.toString()}`);
      // Assuming res.Items/res.items contains the list. If pagesize=0 returns Items, good.
      const items = res.Items || res.items || [];

      let marketCount = 0;
      let fairCount = 0;

      items.forEach(item => {
        // Client-side classification
        const tagIds = item.TagIds || [];

        // Identify if market or fair
        // Market logic: 'hds:market' tag
        // Fair logic: 'hds:yearmarket' tag
        if (tagIds.includes('hds:market')) {
          marketCount++;
        }
        if (tagIds.includes('hds:yearmarket')) {
          fairCount++;
        }
      });

      state.globalCounts.markets[communityId] = marketCount;
      state.globalCounts.fairs[communityId] = fairCount;

    } catch (e) {
      console.error('fetchCommunityActivities failed for', communityId, e);
      // Set to 0 on error to avoid infinite retries or loading state
      state.globalCounts.markets[communityId] = 0;
      state.globalCounts.fairs[communityId] = 0;
    }
  }

  async function fetchCommunitiesActivities(ids) {
    if (!ids || ids.length === 0) return;

    // Only set loading if we actually need to fetch something
    const needsFetch = ids.some(id => state.globalCounts.markets[id] === undefined || state.globalCounts.fairs[id] === undefined);

    if (needsFetch) {
      state.globalCounts.loading = true;
      try {
        await Promise.all(ids.map(id => fetchCommunityActivities(id)));
      } finally {
        state.globalCounts.loading = false;
      }
    }
  }

  async function fetchCommunitiesActivities(ids) {
    if (!ids || ids.length === 0) return;

    // Only set loading if we actually need to fetch something
    const needsFetch = ids.some(id => state.globalCounts.markets[id] === undefined || state.globalCounts.fairs[id] === undefined);
    if (!needsFetch) return;

    state.globalCounts.loading = true;
    try {
      await Promise.all(ids.map(id => fetchCommunityActivities(id)));
    } finally {
      state.globalCounts.loading = false;
    }
  }

  function setCommunitySearch(query) {
    const q = String(query || '').trim();
    if (state.communities.searchQuery === q) return;

    state.communities.searchQuery = q;
    // Reset community data
    state.communities.itemsRaw = [];
    state.communities.nextPageUrl = null;
    state.communities.done = false;
    state.communities.loading = false;
    state.communities.error = null;
    state.communities.paginationMeta = null;

    // Reset page index
    state.ui.community.page = 1;

    // The view watcher on page or explicit call will trigger reload
  }

  watch(
    () => config.apiBase,
    (next, prev) => {
      if (!next || next === prev) return;
      client = createOdhClient({ apiBase: next, debug: config.debug, config });
      resetData();
      // keep current tab/view; next loads will use new base
    }
  );

  watch(
    () => config.initialView,
    (v) => {
      if (!v) return;
      setTab(v);
    },
    { immediate: true }
  );

  return {
    state,
    setTab,
    go,
    setListPage,
    setLanguage,
    resetList,
    ensureLoaded,
    fetchListPage,
    findById,
    fetchDetailById,
    fetchSimilarFairs,
    fetchSimilarItems,
    countItemsByLocfilter,
    fetchMunicipality,
    fetchDistrict,
    fetchRegion,
    fetchTourismAssociation,
    ensureCommunitiesLoaded,
    fetchCommunityById,
    fetchGeoShapeByMunicipalityName,
    fetchGeoShapeByName,
    ensureFilterMetadataLoaded,
    fetchCommunityActivities,
    fetchCommunitiesActivities,
    setCommunitySearch,
  };
}


