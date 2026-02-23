<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-community-list">
    <!-- Breadcrumb -->
    <!-- <Breadcrumb :items="breadcrumbItems" :store="store" /> -->

    <h2 class="wcmc-page-title mb-3 d-lg-none">{{ t('community') }}</h2>
    <div class="d-flex flex-column flex-lg-row gap-2 align-items-lg-center justify-content-between mb-3">
      <h2 class="wcmc-page-title d-none d-lg-block">{{ t('community') }}</h2>
      <div class="w-100 w-lg-auto" style="max-width: 520px;">
        <div class="wcmc-search-wrapper w-100">
          <div class="wcmc-search-box position-relative d-flex align-items-center">
            <input id="wcmc-community-search" type="search" class="wcmc-search-input wcmc-input-base form-control w-100"
              :placeholder="t('searchPlaceholder')" :value="searchBuffer" @input="searchBuffer = $event.target.value"
              @keydown.enter="applySearch" />
            <svg class="wcmc-search-icon position-absolute wcmc-icon-right" width="18" height="18" viewBox="0 0 24 24"
              fill="currentColor" style="cursor: pointer;" @click="applySearch">
              <path
                d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <ErrorAlert v-if="communities.error" :message="communities.error" />

    <!-- Debug info -->
    <div v-if="config.debug" class="alert alert-info mb-3">
      <div>Loading: {{ communities.loading }}</div>
      <div>Raw items: {{ communities.itemsRaw.length }}</div>
      <div>Groups: {{ groups.length }}</div>
      <div>Filtered: {{ filteredGroups.length }}</div>
      <div>Visible: {{ visibleGroups.length }}</div>
    </div>

    <CommunityListSkeleton v-if="communities.loading && communities.itemsRaw.length === 0" :count="8" />


    <EmptyState v-else-if="!communities.loading && filteredGroups.length === 0" />

    <div v-else class="d-flex flex-column gap-3" style="cursor: pointer;">
      <div v-for="group in visibleGroups" :key="group.id || group.key"
        class="row g-0 align-items-center py-2 py-lg-2 rounded wcmc-community-list-row" @click="openGroup(group)">
        <!-- Mobile/Tablet Layout: Icon, Name/CAP/Badges, Arrow -->
        <div class="col-12 d-lg-none d-flex align-items-center gap-3 px-3">
          <!-- Logo/Icon -->
          <div class="flex-shrink-0 d-flex align-items-center justify-content-center">
            <img v-if="group.logoUrl" :src="group.logoUrl" :alt="group.name"
              style="width: 55px; height: 55px; object-fit: contain;" />
            <div v-else class="d-flex align-items-center justify-content-center"
              style="width: 55px; height: 55px; background: white; border: 1px solid #2D2D2D;">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                style="display: block;">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D2D2D" stroke-width="2"
                  fill="none" />
              </svg>
            </div>
          </div>

          <!-- Name, CAP, and Badges -->
          <div class="flex-grow-1 d-flex flex-column gap-2">
            <div class="wcmc-community-card__name">
              <template v-for="(part, index) in formattedName(group.name)" :key="index">
                <span v-if="index > 0" class="wcmc-title-separator">/</span>
                <span class="wcmc-title-part">{{ part }}</span>
              </template>
            </div>
            <div class="d-flex align-items-center gap-3">
              <!-- CAP Column -->
              <div v-if="group.cap" class="wcmc-community-card__cap">{{ group.cap }}</div>
              <!-- Counts Column -->
              <div class="d-flex align-items-center gap-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="wcmc-badge-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                    :style="fairsBadgeStyle">
                    <svg v-if="globalCounts.loading" class="wcmc-spinner" xmlns="http://www.w3.org/2000/svg" width="14"
                      height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    <span v-else>{{ group.fairCount }}</span>
                  </span>
                  <span style="font-size: 14px;">FIERE</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="wcmc-badge-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                    :style="marketsBadgeStyle">
                    <svg v-if="globalCounts.loading" class="wcmc-spinner" xmlns="http://www.w3.org/2000/svg" width="14"
                      height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    <span v-else>{{ group.marketCount }}</span>
                  </span>
                  <span style="font-size: 14px;">MERCATI</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Arrow -->
          <div class="flex-shrink-0 d-flex align-items-center justify-content-center">
            <svg width="7" height="17" viewBox="0 0 7 17" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M1 1L6 8.5L1 16" />
            </svg>
          </div>
        </div>

        <!-- Desktop Layout: All columns in row -->
        <!-- Logo Column -->
        <div class="d-none d-lg-block col-lg-1 col-xl-1 d-flex align-items-center justify-content-center px-0">
          <div class="d-flex align-items-center justify-content-center">
            <img v-if="group.logoUrl" :src="group.logoUrl" :alt="group.name"
              style="max-width: 55px; max-height: 55px; object-fit: contain;" />
            <div v-else class="d-flex align-items-center justify-content-center"
              style="width: 55px; height: 55px; background: white; border: 1px solid #2D2D2D;">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                style="display: block;">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D2D2D" stroke-width="2"
                  fill="none" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Name and CAP Column -->
        <div class="d-none d-lg-block col-lg-2 col-xl-2 d-flex flex-column gap-2 px-3">
          <div>
            <template v-for="(part, index) in formattedName(group.name)" :key="index">
              <span v-if="index > 0" class="wcmc-title-separator">/</span>
              <span class="wcmc-title-part">{{ part }}</span>
            </template>
          </div>
          <div v-if="group.cap" class="text-truncate">{{ group.cap }}</div>
        </div>

        <!-- Website Column -->
        <div class="d-none d-lg-block col-lg-4 col-xl-4 d-flex align-items-center gap-2 px-3">
          <div class="text-truncate" style="min-width: 0; flex: 1;" v-if="group.website">
            <svg class="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {{ group.website }}
          </div>
          <span v-else class="text-muted">{{ t('notAvailable') }}</span>
        </div>

        <!-- Email Column -->
        <div class="d-none d-lg-block col-lg-2 col-xl-2 d-flex align-items-center gap-2 px-3">
          <div class="text-truncate" style="min-width: 0; flex: 1;" v-if="group.email">
            <svg class="flex-shrink-0" width="14" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            {{ group.email }}
          </div>
          <span v-else class="text-muted">{{ t('notAvailable') }}</span>
        </div>

        <!-- FIERE Badge Column -->
        <div class="d-none d-lg-block col-lg-1 col-xl-1 px-2" style="min-width: 0;">
          <div class="d-flex flex-row align-items-center gap-1 flex-nowrap" style="white-space: nowrap;">
            <span class="flex-shrink-0" style="font-size: 12px;">FIERE</span>
            <span class="wcmc-badge-circle flex-shrink-0 d-flex align-items-center justify-content-center"
              :style="fairsBadgeStyle">
              <svg v-if="globalCounts.loading" class="wcmc-spinner" xmlns="http://www.w3.org/2000/svg" width="14"
                height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              <span v-else>{{ group.fairCount }}</span>
            </span>
          </div>
        </div>

        <!-- MERCATI Badge Column -->
        <div class="d-none d-lg-block col-lg-1 col-xl-1 px-2" style="min-width: 0;">
          <div class="d-flex flex-row align-items-center gap-1 flex-nowrap" style="white-space: nowrap;">
            <span class="flex-shrink-0" style="font-size: 12px;">MERCATI</span>
            <span class="wcmc-badge-circle flex-shrink-0 d-flex align-items-center justify-content-center"
              :style="marketsBadgeStyle">
              <svg v-if="globalCounts.loading" class="wcmc-spinner" xmlns="http://www.w3.org/2000/svg" width="14"
                height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
              </svg>
              <span v-else>{{ group.marketCount }}</span>
            </span>
          </div>
        </div>

        <!-- Arrow Column -->
        <div class="d-none d-lg-block col-lg-1 col-xl-1 d-flex align-items-center justify-content-center px-0">
          <div class="d-flex align-items-center justify-content-center">
            <svg width="7" height="17" viewBox="0 0 7 17" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M1 1L6 8.5L1 16" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center justify-content-lg-end pt-4">
      <Pagination v-model="page" :has-prev="hasPrev" :has-next="hasNext" :next-page-number="page + 1"
        :total-pages="totalPages" :loading="communities.loading" :has-results="filteredGroups.length > 0" />
    </div>
  </div>
</template>

<script>
import CommunityListSkeleton from '../components/CommunityListSkeleton.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import Pagination from '../components/Pagination.vue';
import Breadcrumb from '../components/Breadcrumb.vue';

import { getImageUrl, getMunicipalityName } from '../../utils/normalize';

function pickLang(arr, lang) {
  if (!Array.isArray(arr)) return null;
  return arr.find((item) => item?.LanguageCode === lang) || arr[0] || null;
}

function pickLangMap(langMap, lang) {
  if (!langMap || typeof langMap !== 'object') return null;
  return langMap?.[lang] ?? langMap?.en ?? langMap?.it ?? langMap?.de ?? null;
}

function getContactInfo(raw, lang) {
  // TourismAssociation ContactInfos is an object with language keys, not an array
  let ci = null;
  if (raw?.ContactInfos) {
    if (typeof raw.ContactInfos === 'object' && !Array.isArray(raw.ContactInfos)) {
      ci = raw.ContactInfos[lang] || raw.ContactInfos.en || raw.ContactInfos.it || raw.ContactInfos.de || null;
    } else if (Array.isArray(raw.ContactInfos)) {
      ci = pickLang(raw.ContactInfos, lang);
    }
  }
  const email = ci?.Email ?? ci?.email ?? '';
  const website = ci?.Url ?? ci?.Website ?? ci?.web ?? '';
  const cap = ci?.ZipCode ?? '';
  const logoUrl = ci?.LogoUrl ?? '';
  return { email, website, cap, logoUrl };
}

function getPostalCode(raw, lang) {
  // Try ContactInfos first (TourismAssociation structure)
  const contactInfo = getContactInfo(raw, lang);
  if (contactInfo.cap) return contactInfo.cap;
  // Fallback to LocationInfo (ODHActivityPoi structure)
  return raw?.LocationInfo?.AddressInfo?.ZipCode ?? '';
}

function getName(raw, lang) {
  // TourismAssociation uses Detail[lang].Title or Shortname
  const detail = raw?.Detail;
  if (detail) {
    const title = detail[lang]?.Title || detail.en?.Title || detail.it?.Title || detail.de?.Title;
    if (title) return String(title);
  }
  return raw?.Shortname || raw?.Id || '';
}

export default {
  name: 'CommunityList',
  components: { CommunityListSkeleton, EmptyState, ErrorAlert, Pagination, Breadcrumb },
  props: {
    config: { type: Object, required: true },
    store: { type: Object, required: true },
  },
  data() {
    return {
      query: '',
      searchBuffer: '',
    };
  },
  beforeUnmount() {
  },
  computed: {
    communities() {
      return this.store.state.communities;
    },
    globalCounts() {
      return this.store.state.globalCounts;
    },
    pageSize() {
      return this.config.pageSize || 8;
    },
    page: {
      get() {
        return this.store.state.ui.community.page || 1;
      },
      set(v) {
        this.store.setListPage('community', v);
      },
    },
    groups() {
      const rawItems = this.communities.itemsRaw || [];


      return rawItems
        .filter((raw) => {
          if (!raw) return false;
          if (!raw.Id) {
            return false;
          }
          return true;
        })
        .map((raw) => {
          try {
            const contactInfo = getContactInfo(raw, this.config.language);
            const id = String(raw.Id);
            const name = getName(raw, this.config.language);

            // Get IDs for filtering - TourismAssociation uses RegionId directly
            const regionId = raw?.RegionId || raw?.Region?.Id;
            const customId = raw?.CustomId; // Might be TourismVerein ID (e.g., "TV1081")

            // Get counts from global state
            const fairCount = this.globalCounts.fairs[id] || 0;
            const marketCount = this.globalCounts.markets[id] || 0;

            const result = {
              id,
              key: id,
              name: name || 'Community',
              logoUrl: contactInfo.logoUrl,
              cap: getPostalCode(raw, this.config.language),
              email: contactInfo.email,
              website: contactInfo.website,
              regionId,
              customId,
              fairCount,
              marketCount,
            };


            return result;
          } catch (e) {
            return null;
          }
        })
        .filter((g) => g && g.id) // Ensure no null items in final array
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    filteredGroups() {
      // Client-side filtering removed in favor of server-side search
      return this.groups;
    },
    startIdx() {
      // Logic for client-side pagination is no longer needed if we rely on API pagination?
      // Wait, if API returns page 1 of results, we show them all?
      // The current implementation seems to load ALL communities then paginate locally?
      // Re-reading ensureCommunitiesLoaded: it keeps fetching until minItems or done.
      // If we use server search, we might get paginated results.
      // But the current UI expects a large list and does local slicing.
      // If we change ensureCommunitiesLoaded to use API search, it resets itemsRaw.
      // So filteredGroups will be the search results.
      // We still need pagination if results > pageSize.
      return (this.page - 1) * this.pageSize;
    },
    endIdx() {
      return this.page * this.pageSize;
    },
    visibleGroups() {
      // If we have API search, itemsRaw contains the *fetched* items. 
      // If we use pageSize in store.js, we might only have one page.
      // But the View does local slicing: `filteredGroups.slice(startIdx, endIdx)`.
      // If store fetches distinct pages, we need to be careful.
      // `ensureCommunitiesLoaded` fetches *up to* minItems. 
      // `minItems` is `n * this.pageSize` (via page watcher).
      // So logic holds: we ensure we have enough items for the current page, then slice locally.
      return this.filteredGroups.slice(this.startIdx, this.endIdx);
    },
    visibleGroupIds() {
      return this.visibleGroups.map(g => g.id).join(',');
    },
    hasPrev() {
      return this.page > 1;
    },
    hasNext() {
      if (this.endIdx < this.filteredGroups.length) return true;
      return !this.communities.done;
    },
    totalPages() {
      if (this.communities.paginationMeta && this.communities.paginationMeta.TotalPages !== null && this.communities.paginationMeta.TotalPages > 0) {
        return this.communities.paginationMeta.TotalPages;
      }
      if (this.filteredGroups.length === 0) return 0; // Fixed: 0 if empty

      const basePages = Math.ceil(this.filteredGroups.length / this.pageSize);
      return this.communities.done ? basePages : null;
    },
    breadcrumbItems() {
      return [
        {
          label: this.t('community'),
        },
      ];
    },
    fairsBadgeStyle() {
      const fairsColor = this.getConfigColor('--color-indicator-position-fairs-map', '#024C96');
      return {
        backgroundColor: fairsColor,
        color: '#ffffff',
      };
    },
    marketsBadgeStyle() {
      const marketsColor = this.getConfigColor('--color-indicator-position-markets-map', '#F39650');
      return {
        backgroundColor: marketsColor,
        color: '#ffffff',
      };
    },
  },
  async mounted() {
    // Initialize by fetching first page of communities
    this.store.setListPage('community', 1);
    await this.store.ensureCommunitiesLoaded(this.pageSize);
  },
  watch: {
    visibleGroupIds: {
      immediate: true,
      handler(newIds) {
        if (!newIds) return;
        const ids = newIds.split(',').filter(Boolean);
        if (ids.length === 0) return;

        // Fetch counts for each visible community
        this.store.fetchCommunitiesActivities(ids);
      }
    },
    query() {
      // Do nothing on verify input; applySearch triggers it
    },
    async page(next, prev) {
      const n = Number(next);
      if (!Number.isFinite(n) || n <= 0) return;

      // Ensure we have enough items for the requested page
      const needed = n * this.pageSize;
      await this.store.ensureCommunitiesLoaded(needed);
    },
  },
  methods: {

    openGroup(g) {
      if (!g || !g.id) return;
      this.store.go('communityDetail', { id: g.id, name: g.name || 'Community' });
    },
    formattedName(name) {
      if (!name) return [];
      const title = String(name).toUpperCase();
      // Split on "/" first
      return title.split('/').map(part => part.trim()).filter(part => part.length > 0);
    },
    getConfigColor(cssVarName, fallback) {
      try {
        // CSS variables are set on .wcmc-root in shadow DOM
        const rootEl = document.querySelector('webcomp-market-calendar')?.shadowRoot?.querySelector('.wcmc-root');
        if (rootEl) {
          const computedStyle = getComputedStyle(rootEl);
          const color = computedStyle.getPropertyValue(cssVarName).trim();
          if (color) return color;
        }
      } catch (e) {
        // Fallback on error
      }
      return fallback;
    },
    t(key) {
      const TRANSLATIONS = {
        en: {
          community: 'Community',
          searchPlaceholder: 'Write something...',
          notAvailable: 'Not available',
        },
        it: {
          community: 'Comunità',
          searchPlaceholder: 'Cerca...',
          notAvailable: 'Non disponibile',
        },
        de: {
          community: 'Community',
          searchPlaceholder: 'Schreibe etwas...',
          notAvailable: 'Nicht verfügbar',
        },
      };
      const lang = this.config.language || 'it';
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.it;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    applySearch() {
      if (this.query !== this.searchBuffer) {
        this.query = this.searchBuffer;
        this.store.setCommunitySearch(this.query);
        // Ensure new results are loaded
        this.store.ensureCommunitiesLoaded(this.pageSize);
      }
    },
  },
};
</script>
