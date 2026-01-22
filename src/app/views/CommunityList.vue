<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-community-list">
    <!-- Breadcrumb -->
    <!-- <Breadcrumb :items="breadcrumbItems" :store="store" /> -->

    <h2 class="wcmc-page-title mb-3 d-md-none">{{ t('community') }}</h2>
    <div class="d-flex flex-column flex-md-row gap-2 align-items-md-center justify-content-between mb-3">
      <h2 class="wcmc-page-title d-none d-md-block">{{ t('community') }}</h2>
      <div class="w-100 w-md-auto" style="max-width: 520px;">
        <SearchBar v-model="query" :placeholder="t('searchPlaceholder')" />
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

    <CommunityListSkeleton v-if="(communities.loading && communities.itemsRaw.length === 0) || areCountsLoading"
      :count="8" />

    <EmptyState v-else-if="!communities.loading && filteredGroups.length === 0" />

    <div v-else class="d-flex flex-column gap-3" style="cursor: pointer;">
      <div v-for="group in visibleGroups" :key="group.id || group.key"
        class="row g-0 align-items-center py-2 py-md-2 py-lg-2 rounded wcmc-community-list-row"
        @click="openGroup(group)">
        <!-- Mobile Layout: Icon, Name/CAP/Badges, Arrow -->
        <div class="col-12 d-md-none d-flex align-items-center gap-3 px-3">
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
            <div class="wcmc-community-card__name">{{ group.name }}</div>
            <div class="d-flex align-items-center gap-3">
              <!-- CAP Column -->
              <div v-if="group.cap" class="wcmc-community-card__cap">{{ group.cap }}</div>
              <!-- Counts Column -->
              <div class="d-flex align-items-center gap-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="wcmc-badge-circle flex-shrink-0">
                    {{ group.fairCount }}
                  </span>
                  <span style="font-size: 14px;">FIERE</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="wcmc-badge-circle flex-shrink-0">
                    {{ group.marketCount }}
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
        <div class="d-none d-md-block col-md-2 col-lg-1 col-xl-1 d-flex align-items-center justify-content-center px-0">
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
        <div class="d-none d-md-block col-md-2 col-lg-2 col-xl-2 d-flex flex-column gap-2 px-3">
          <div class="text-truncate">{{ group.name }}</div>
          <div v-if="group.cap" class="text-truncate">{{ group.cap }}</div>
        </div>

        <!-- Website Column -->
        <div class="d-none d-md-block col-md-4 col-lg-4 col-xl-4 d-flex align-items-center gap-2 px-3">
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
        <div class="d-none d-md-block col-md-2 col-lg-2 col-xl-2 d-flex align-items-center gap-2 px-3">
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
        <div
          class="d-none d-md-block col-md-1 col-lg-1 col-xl-1 px-2"
          style="min-width: 0;">
          <div class="d-flex flex-row align-items-center gap-1 flex-nowrap" style="white-space: nowrap;">
            <span class="flex-shrink-0" style="font-size: 12px;">FIERE</span>
            <span class="wcmc-badge-circle flex-shrink-0">
              {{ group.fairCount }}
            </span>
          </div>
        </div>

        <!-- MERCATI Badge Column -->
        <div
          class="d-none d-md-block col-md-1 col-lg-1 col-xl-1 px-2"
          style="min-width: 0;">
          <div class="d-flex flex-row align-items-center gap-1 flex-nowrap" style="white-space: nowrap;">
            <span class="flex-shrink-0" style="font-size: 12px;">MERCATI</span>
            <span class="wcmc-badge-circle flex-shrink-0">
              {{ group.marketCount }}
            </span>
          </div>
        </div>

        <!-- Arrow Column -->
        <div class="d-none d-md-block col-md-1 col-lg-1 col-xl-1 d-flex align-items-center justify-content-center px-0">
          <div class="d-flex align-items-center justify-content-center">
            <svg width="7" height="17" viewBox="0 0 7 17" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M1 1L6 8.5L1 16" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center justify-content-md-end pt-4">
      <Pagination v-model="page" :has-prev="hasPrev" :has-next="hasNext" :next-page-number="page + 1" />
    </div>
  </div>
</template>

<script>
import SearchBar from '../components/SearchBar.vue';
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
  components: { SearchBar, CommunityListSkeleton, EmptyState, ErrorAlert, Pagination, Breadcrumb },
  props: {
    config: { type: Object, required: true },
    store: { type: Object, required: true },
  },
  data() {
    return {
      query: '',
      counts: {}, // Current counts: { communityId: { fairCount: 0, marketCount: 0 } }
      loadingCounts: new Set(), // Track which communities are currently loading counts
      isMounted: false,
      _countsVersion: 0, // Version counter to force reactivity updates
    };
  },
  beforeUnmount() {
    // Clean up any pending operations
    this.isMounted = false;
    this.loadingCounts.clear();
  },
  computed: {
    communities() {
      return this.store.state.communities;
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

            // Get counts from reactive data (will be loaded via API)
            const counts = this.counts[id] || { fairCount: 0, marketCount: 0 };
            const fairCount = counts.fairCount;
            const marketCount = counts.marketCount;

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
      const q = String(this.query || '').trim().toLowerCase();
      if (!q) return this.groups;
      return this.groups.filter((g) => String(g.name || '').toLowerCase().includes(q));
    },
    startIdx() {
      return (this.page - 1) * this.pageSize;
    },
    endIdx() {
      return this.page * this.pageSize;
    },
    visibleGroups() {
      return this.filteredGroups.slice(this.startIdx, this.endIdx);
    },
    hasPrev() {
      return this.page > 1;
    },
    hasNext() {
      if (this.endIdx < this.filteredGroups.length) return true;
      return !this.communities.done;
    },
    breadcrumbItems() {
      return [
        {
          label: this.t('community'),
        },
      ];
    },
    areCountsLoading() {
      // Reference version counter to ensure reactivity
      this._countsVersion;
      // Check if any visible group is still loading counts
      if (this.visibleGroups.length === 0) return false;
      return this.visibleGroups.some((g) => {
        if (!g || !g.id) return false;
        // Check if it's currently loading
        if (this.loadingCounts.has(g.id)) return true;
        // Check if counts haven't been loaded yet (not in counts object)
        if (!this.counts[g.id]) return true;
        return false;
      });
    },
  },
  async mounted() {
    this.isMounted = true;
    await this.store.ensureCommunitiesLoaded(this.endIdx);
    // Load counts for visible communities
    if (this.isMounted) {
      await this.loadCountsForVisible();
    }
  },
  watch: {
    query() {
      this.page = 1;
    },
    async page(next, prev) {
      const n = Number(next);
      const p = Number(prev);
      if (!Number.isFinite(n) || n <= 0) return;
      if (Number.isFinite(p) && n <= p) return;
      const needed = n * this.pageSize;
      await this.store.ensureCommunitiesLoaded(needed);
      // Load counts for newly visible communities
      await this.loadCountsForVisible();
    },
    'communities.itemsRaw': {
      handler(newVal, oldVal) {
        // When communities are loaded, load counts for visible ones
        if (newVal && newVal.length > 0) {
          this.$nextTick(() => {
            this.loadCountsForVisible();
          });
        }
      },
      deep: true,
    },
  },
  methods: {
    async loadCountsForVisible() {
      // Load counts for all visible communities in parallel
      const promises = this.visibleGroups
        .filter((g) => g && g.id) // Filter out null/undefined items
        .map((g) => this.loadCountsForCommunity(g));
      await Promise.all(promises);
    },
    async loadCountsForCommunity(g) {
      // Safety check
      if (!g || !g.id) return;

      // Skip if already loading
      if (this.loadingCounts.has(g.id)) return;

      this.loadingCounts.add(g.id);
      this._countsVersion++; // Force reactivity update

      try {
        // Determine locfilter - TourismAssociation ID itself is the TourismVerein ID
        // Priority: TourismAssociation ID (tvs) > RegionId (reg) > MunicipalityId (mun)
        let locfilter = null;

        // The TourismAssociation ID is the TourismVerein ID
        if (g.id) {
          locfilter = `tvs${g.id}`;
        } else if (g.regionId) {
          locfilter = `reg${g.regionId}`;
        }

        if (!locfilter) {
          if (this.isMounted) {
            this.counts[g.id] = { fairCount: 0, marketCount: 0 };
          }
          return;
        }

        // Fetch counts directly from API for both fairs and markets in parallel
        const [fairCount, marketCount] = await Promise.all([
          this.store.countItemsByLocfilter({
            locfilter,
            type: 'yearmarket',
          }).catch(() => 0),
          this.store.countItemsByLocfilter({
            locfilter,
            type: 'market',
          }).catch(() => 0),
        ]);

        // Update counts only if component is still mounted
        if (this.isMounted) {
          this.counts[g.id] = {
            fairCount,
            marketCount,
          };
        }
      } catch (e) {
        if (this.isMounted) {
          this.counts[g.id] = { fairCount: 0, marketCount: 0 };
        }
      } finally {
        if (this.isMounted) {
          this.loadingCounts.delete(g.id);
          this._countsVersion++; // Force reactivity update
        }
      }
    },
    openGroup(g) {
      if (!g || !g.id) return;
      this.store.go('communityDetail', { id: g.id, name: g.name || 'Community' });
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
  },
};
</script>
