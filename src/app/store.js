// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { reactive, watch } from 'vue';
import { createOdhClient } from '../api/odhClient';

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
    communities: emptyDataset(),
    filterMetadata: {
      municipalities: [],
      tags: [],
      loading: false,
      error: null,
      loadedLanguage: null,
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
    if (type !== 'market' && type !== 'yearmarket') return;
    const ds = datasetFor(type);
    if (!ds) return;
    Object.assign(ds, emptyDataset());
  }

  function datasetFor(type) {
    return type === 'market' ? state.markets : state.fairs;
  }

  async function ensureLoaded(type, minItems, { signal, rawfilter, pageSize, search, locfilter, odhtagfilter } = {}) {
    if (type !== 'market' && type !== 'yearmarket') {
      log('ensureLoaded skipped: invalid type', type);
      return;
    }
    const ds = datasetFor(type);
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
    ds.error = null;
    try {
      if (!ds.nextPageUrl && !ds.done) {
        ds.nextPageUrl = client.buildFirstPageUrl({
          type,
          pageSize: effectivePageSize,
          rawfilter: rawfilter || undefined,
          search: search || undefined,
          locfilter: locfilter || undefined,
          odhtagfilter: odhtagfilter || undefined,
        });
      }

      while (ds.nextPageUrl && ds.itemsRaw.length < minItems) {
        const { items, nextPage, page } = await client.fetchPageByUrl(ds.nextPageUrl, { signal });
        ds.itemsRaw.push(...items);
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
        if (config.language) params.append('language', config.language);
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
      : DEFAULT_CATEGORY_OPTIONS;
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
  };
}


