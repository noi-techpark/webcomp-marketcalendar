<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-community-detail">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :store="store" />

    <ErrorAlert v-if="communityError || fairsError || marketsError"
      :message="communityError || fairsError || marketsError" />

    <CommunityDetailSkeleton
      v-if="(loadingCommunity || loadingFairs || loadingMarkets) && communityData === null"
    />

    <div v-else-if="communityData" class="wcmc-community-detail__content">
      <!-- Colonna principale -->
      <div class="wcmc-community-detail__main">
        <!-- Main Row: Logo, Name, Info and Referent -->
        <div class="row g-0 ">
          <!-- Left Column: Logo, Name and Contact Info -->
          <div class="col-12 col-lg-9 col-md-8 mb-3 d-flex">
            <div class="wcmc-community-detail__header-name-logo-info  rounded row g-0 p-4 h-100 w-100">
              <!-- Logo Column -->
              <div class="col-auto d-md-block d-none">
                <div class="wcmc-community-detail__header d-flex align-items-start">
                  <img v-if="communityData.logoUrl" :src="communityData.logoUrl" :alt="communityData.name"
                    class="flex-shrink-0 wcmc-community-logo-img" />
                  <div v-else class="d-flex align-items-center justify-content-center flex-shrink-0 wcmc-community-logo-placeholder">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                      class="wcmc-d-block">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D2D2D"
                        stroke-width="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Mobile: Logo stacked above name -->
              <div class="col-12 d-md-none mb-3">
                <div class="wcmc-community-detail__header d-flex align-items-start">
                  <img v-if="communityData.logoUrl" :src="communityData.logoUrl" :alt="communityData.name"
                    class="flex-shrink-0 wcmc-community-logo-img" />
                  <div v-else class="d-flex align-items-center justify-content-center flex-shrink-0 wcmc-community-logo-placeholder">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                      class="wcmc-d-block">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D2D2D"
                        stroke-width="2" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Name and Info Column -->
              <div class="col ps-md-3 ps-0">
                <div class="row g-0">
                  <!-- Name Section -->
                  <div class="col-12">
                    <div class="wcmc-community-detail__header-text d-flex flex-column gap-1">
                      <h1 class="wcmc-community-detail__title mb-0">{{ communityData.name }}</h1>
                    </div>
                  </div>

                  <!-- Informazioni comunità -->
                  <div class="col-12 mt-3">
                    <div class="row g-3 g-md-2">
                      <!-- Address Column -->
                      <div
                        v-if="communityData.municipalityName || communityData.address"
                        class="col-6 col-md-6 col-lg-3">
                        <div
                          class="wcmc-community-detail__info-item wcmc-community-detail__info-item--address d-flex align-items-start gap-2">
                          <svg class="wcmc-community-detail__info-icon flex-shrink-0" width="10" height="16"
                            viewBox="0 0 24 24" fill="currentColor">
                            <path
                              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <div class="wcmc-community-detail__address-lines d-flex flex-column gap-1">
                            <!-- Mobile: Municipality name on top, address below -->
                            <div class="d-md-none d-flex flex-column gap-1">
                              <div v-if="communityData.municipalityName" class="fw-bold">{{ communityData.municipalityName }}</div>
                              <a v-if="communityData.googleMapsSearchLink && communityData.address"
                                :href="communityData.googleMapsSearchLink" target="_blank"
                                class="wcmc-community-detail__info-link">
                                {{ communityData.address }}
                              </a>
                              <div v-else-if="communityData.address">{{ communityData.address }}</div>
                            </div>
                            <!-- Desktop: Combined with comma -->
                            <a v-if="communityData.googleMapsSearchLink"
                              :href="communityData.googleMapsSearchLink" target="_blank"
                              class="wcmc-community-detail__info-link d-none d-md-block">
                              <span v-if="communityData.municipalityName">{{ communityData.municipalityName }}</span><span v-if="communityData.municipalityName && communityData.address">, </span><span v-if="communityData.address">{{ communityData.address }}</span>
                            </a>
                            <div v-else class="d-none d-md-block">
                              <span v-if="communityData.municipalityName">{{ communityData.municipalityName }}</span><span v-if="communityData.municipalityName && communityData.address">, </span><span v-if="communityData.address">{{ communityData.address }}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Phone Column -->
                      <div v-if="communityData.phone" class="col-6 col-md-6 col-lg-3">
                        <div class="wcmc-community-detail__info-item d-flex align-items-start gap-2">
                          <svg class="wcmc-community-detail__info-icon flex-shrink-0" width="14" height="14"
                            viewBox="0 0 24 24" fill="currentColor">
                            <path
                              d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                          </svg>
                          <div class="wcmc-community-detail__info-content d-flex flex-column gap-1">
                            <span class="wcmc-community-detail__info-label fw-semibold text-uppercase">{{
                              t('phone').toUpperCase() }}</span>
                            <span>{{ communityData.phone }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Website Column -->
                      <div v-if="communityData.website" class="col-6 col-md-6 col-lg-3">
                        <div class="wcmc-community-detail__info-item d-flex align-items-start gap-2">
                          <svg class="wcmc-community-detail__info-icon flex-shrink-0" width="14" height="14"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path
                              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                          <div class="wcmc-community-detail__info-content d-flex flex-column gap-1">
                            <span class="wcmc-community-detail__info-label fw-semibold text-uppercase">{{
                              t('website').toUpperCase() }}</span>
                            <a :href="communityData.website" target="_blank" class="wcmc-community-detail__info-link text-break">
                              {{ communityData.website }}
                            </a>
                          </div>
                        </div>
                      </div>

                      <!-- PEC Column -->
                      <div v-if="communityData.pec" class="col-6 col-md-6 col-lg-3">
                        <div class="wcmc-community-detail__info-item d-flex align-items-start gap-2">
                          <svg class="wcmc-community-detail__info-icon flex-shrink-0" width="14" height="12"
                            viewBox="0 0 24 24" fill="currentColor">
                            <path
                              d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                          </svg>
                          <div class="wcmc-community-detail__info-content d-flex flex-column gap-1">
                            <span class="wcmc-community-detail__info-label fw-semibold text-uppercase">PEC</span>
                            <span>{{ communityData.pec }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Referent Sidebar (Desktop) -->
          <div class="col-12 col-lg-3 col-md-4 ps-2 d-none d-md-block d-flex">
            <div class="mb-3 w-100">
              <div class="wcmc-community-detail__sidebar h-100">
                <div class="wcmc-community-detail__referent d-flex flex-column p-4 gap-3 h-100 rounded">
                  <h3 class="wcmc-community-detail__referent-title mb-0">{{ t('referent') }}</h3>
                  <div
                    v-if="!communityData.referentName && !communityData.referentPhone && !communityData.referentEmail"
                    class="wcmc-community-detail__referent-info text-muted d-flex align-items-center gap-2">
                    {{ t('notAvailable') }}
                  </div>
                  <template v-else>
                    <div v-if="communityData.referentName" class="wcmc-community-detail__referent-name">
                      {{ communityData.referentName }}
                    </div>
                    <div v-if="communityData.referentPhone"
                      class="wcmc-community-detail__referent-info d-flex align-items-center gap-2">
                      <svg class="wcmc-community-detail__referent-icon flex-shrink-0" width="14" height="14"
                        viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                      <span class="text-truncate flex-fill min-w-0">{{ t('phone') }}</span>
                    </div>
                    <div v-if="communityData.referentEmail"
                      class="wcmc-community-detail__referent-info d-flex align-items-center gap-2">
                      <svg class="wcmc-community-detail__referent-icon flex-shrink-0" width="14" height="12"
                        viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      <span class="text-truncate flex-fill min-w-0">{{ t('mail') }}</span>
                    </div>
                    <div class="d-flex gap-2 mt-auto">
                      <button v-if="communityData.referentPhone"
                        class="wcmc-community-detail__contact-btn btn btn-primary flex-fill" type="button"
                        @click="callReferent">
                        {{ t('call') }}
                      </button>
                      <button v-if="communityData.referentEmail"
                        class="wcmc-community-detail__contact-btn btn btn-primary flex-fill" type="button"
                        @click="contactReferent">
                        {{ t('write') }}
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Referent Section (Mobile only) -->
        <div class="row g-0 d-md-none">
          <div class="col-12">
            <div class="mb-3">
              <div class="wcmc-community-detail__sidebar">
                <div class="wcmc-community-detail__referent d-flex flex-column p-4 gap-3 rounded">
                  <h3 class="wcmc-community-detail__referent-title mb-0">{{ t('referent') }}</h3>
                  <div
                    v-if="!communityData.referentName && !communityData.referentPhone && !communityData.referentEmail"
                    class="wcmc-community-detail__referent-info text-muted d-flex align-items-center gap-2">
                    {{ t('notAvailable') }}
                  </div>
                  <template v-else>
                    <div v-if="communityData.referentName" class="wcmc-community-detail__referent-name">
                      {{ communityData.referentName }}
                    </div>
                    <div class="d-flex flex-row wcmc-gap-6-5rem">
                      <div v-if="communityData.referentPhone"
                        class="wcmc-community-detail__referent-info d-flex align-items-center gap-2">
                        <svg class="wcmc-community-detail__referent-icon flex-shrink-0" width="14" height="14"
                          viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                        </svg>
                        <span class="text-truncate flex-fill min-w-0">{{ t('phone') }}</span>
                      </div>
                      <div v-if="communityData.referentEmail"
                        class="wcmc-community-detail__referent-info d-flex align-items-center gap-2">
                        <svg class="wcmc-community-detail__referent-icon flex-shrink-0" width="14" height="12"
                          viewBox="0 0 24 24" fill="currentColor">
                          <path
                            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                        </svg>
                        <span class="text-truncate flex-fill min-w-0">{{ t('mail') }}</span>
                      </div>
                    </div>
                    <div class="d-flex gap-2 mt-auto">
                      <button v-if="communityData.referentPhone"
                        class="wcmc-community-detail__contact-btn btn btn-primary flex-fill" type="button"
                        @click="callReferent">
                        {{ t('call') }}
                      </button>
                      <button v-if="communityData.referentEmail"
                        class="wcmc-community-detail__contact-btn btn btn-primary flex-fill" style="max-width: 10rem" type="button"
                        @click="contactReferent">
                        {{ t('write') }}
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map and Related Sections Container -->
        <div class="row g-0 ">
          <!-- Left Column: Map (col-4 on desktop, full width on mobile) -->
          <div class="col-12 col-lg-4 mb-4 mb-lg-0">
            <div class="wcmc-community-detail__map-container w-100 py-2">
              <LeafletMap :height="'100%'" :markets="relatedMarkets" :fairs="relatedFairs" :show-markets="true"
                :show-fairs="true" :initial-center="mapCenter" :initial-zoom="mapZoom" :lang="config.language"
                :config="config" />
            </div>
          </div>

          <!-- Right Column: Related Sections (col-8 on desktop, full width on mobile) -->
          <div class="col-12 col-lg-8 ps-lg-4">
            <div class="row g-0">
              <!-- Row 1: Related Fairs Section -->
              <div class="col-12 mb-4">
                <div class="wcmc-community-detail__related-section wcmc-community-detail__related-section--fairs">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="wcmc-community-detail__related-title mb-0">
                      {{ t('relatedFairs') }}
                      <span class="badge wcmc-badge-circle ms-2">{{ relatedFairs.length }}</span>
                    </h2>
                    <div v-if="relatedFairs.length > 0" class="d-flex gap-2">
                      <button class="btn btn-outline-light btn-sm wcmc-slider-btn" :disabled="!canScrollFairsLeft"
                        @click="scrollFairs('left')" type="button" aria-label="Previous fairs">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button class="btn btn-outline-light btn-sm wcmc-slider-btn" :disabled="!canScrollFairsRight"
                        @click="scrollFairs('right')" type="button" aria-label="Next fairs">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div ref="fairsSlider"
                    class="wcmc-community-detail__related-cards wcmc-slider-container d-flex flex-row gap-3 align-items-stretch flex-nowrap overflow-hidden pb-2"
                    @scroll="updateFairsScrollState">
                    <div v-for="fair in relatedFairs" :key="fair.id"
                      class="wcmc-community-detail__related-card flex-shrink-0 d-flex flex-column"
                      @click="openDetails(fair)">
                      <ItemCard :item="fair" badge="Fair" variant="communityFair" :lang="config.language" @details="openDetails" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Row 2: Related Markets Section -->
              <div class="col-12">
                <div class="wcmc-community-detail__related-section wcmc-community-detail__related-section--markets">
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="wcmc-community-detail__related-title mb-0">
                      {{ t('relatedMarkets') }}
                      <span class="badge wcmc-badge-circle ms-2">{{ relatedMarkets.length }}</span>
                    </h2>
                    <div v-if="relatedMarkets.length > 0" class="d-flex gap-2">
                      <button class="btn btn-outline-light btn-sm wcmc-slider-btn" :disabled="!canScrollMarketsLeft"
                        @click="scrollMarkets('left')" type="button" aria-label="Previous markets">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button class="btn btn-outline-light btn-sm wcmc-slider-btn" :disabled="!canScrollMarketsRight"
                        @click="scrollMarkets('right')" type="button" aria-label="Next markets">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div ref="marketsSlider"
                    class="wcmc-community-detail__related-cards wcmc-slider-container d-flex flex-row gap-3 align-items-stretch flex-nowrap overflow-hidden pb-2"
                    @scroll="updateMarketsScrollState">
                    <div v-for="market in relatedMarkets" :key="market.id"
                      class="wcmc-community-detail__related-card flex-shrink-0 d-flex flex-column"
                      @click="openDetails(market)">
                      <ItemCard :item="market" badge="Market" @details="openDetails" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ItemCard from '../components/ItemCard.vue';
import CommunityDetailSkeleton from '../components/CommunityDetailSkeleton.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import LeafletMap from '../components/LeafletMap.vue';
import Breadcrumb from '../components/Breadcrumb.vue';

import { normalizeOdhItem, getMunicipalityName, getMunicipalityId, getDistrictId, getRegionId, getContactInfo } from '../../utils/normalize';
import { fetchMunicipalityName, fetchDistrictName, fetchRegionName } from '../../utils/locationCache';


function pickLang(arr, lang) {
  if (!Array.isArray(arr)) return null;
  return arr.find((item) => item?.LanguageCode === lang) || arr[0] || null;
}

function pickLangMap(langMap, lang) {
  if (!langMap || typeof langMap !== 'object') return null;
  return langMap?.[lang] ?? langMap?.en ?? langMap?.it ?? langMap?.de ?? null;
}

function getContactInfoLocal(raw, lang) {
  const contact = getContactInfo(raw, lang);
  if (!contact) return { phone: null, website: null, email: null, pec: null };

  return {
    phone: contact.phone,
    website: contact.url,
    email: contact.email,
    pec: contact.email, // PEC potrebbe essere nell'email o in un campo separato
  };
}

function getReferentInfo(raw, lang) {
  const contact = getContactInfo(raw, lang);
  if (!contact) return { name: null, phone: null, email: null };

  // Costruisci il nome completo se disponibile
  let name = contact.companyName || '';
  if (contact.givenName || contact.surname) {
    const parts = [];
    if (contact.namePrefix) parts.push(contact.namePrefix);
    if (contact.givenName) parts.push(contact.givenName);
    if (contact.surname) parts.push(contact.surname);
    if (parts.length > 0) name = parts.join(' ');
  }

  return {
    name: name || null,
    phone: contact.phone,
    email: contact.email,
  };
}

export default {
  name: 'CommunityDetail',
  components: { ItemCard, CommunityDetailSkeleton, EmptyState, ErrorAlert, LeafletMap, Breadcrumb },
  props: {
    config: { type: Object, required: true },
    store: { type: Object, required: true },
    id: { type: String, required: true },
    name: { type: String, default: 'Community' },
  },
  data() {
    return {
      communityItem: null,
      loadingCommunity: false,
      communityError: null,
      relatedFairsData: [],
      loadingFairs: false,
      fairsError: null,
      relatedMarketsData: [],
      loadingMarkets: false,
      marketsError: null,
      canScrollFairsLeft: false,
      canScrollFairsRight: false,
      canScrollMarketsLeft: false,
      canScrollMarketsRight: false,
    };
  },
  computed: {
    communityData() {
      if (!this.communityItem) return null;

      const contactInfo = getContactInfoLocal(this.communityItem, this.config.language);
      const referentInfo = getReferentInfo(this.communityItem, this.config.language);
      let municipality = getMunicipalityName(this.communityItem, this.config.language);
      // Get community name from TourismAssociation
      const nameMap = this.communityItem?.Name;

      // Get logoUrl and address from ContactInfos using current language with fallbacks
      let logoUrl = null;
      let address = null;
      const lang = this.config.language || 'it';
      if (this.communityItem?.ContactInfos) {
        if (typeof this.communityItem.ContactInfos === 'object' && !Array.isArray(this.communityItem.ContactInfos)) {
          const contactInfoByLang = this.communityItem.ContactInfos[lang];
          logoUrl = contactInfoByLang?.LogoUrl || null;
          address = contactInfoByLang?.Address || null;
        } else if (Array.isArray(this.communityItem.ContactInfos)) {
          const contactInfoByLang = pickLang(this.communityItem.ContactInfos, lang);
          logoUrl = contactInfoByLang?.LogoUrl || null;
          address = contactInfoByLang?.Address || null;
        }
      }

      const picked = pickLangMap(nameMap, this.config.language);
      const communityName = picked || this.name || municipality || 'Comunità';
      const municipalityName = municipality || '';

      // Costruisci link Google Maps search combinando municipality name e address
      let googleMapsSearchLink = null;
      const searchParts = [];
      if (municipalityName) {
        searchParts.push(municipalityName);
      }
      if (address) {
        searchParts.push(address);
      }
      if (searchParts.length > 0) {
        const searchQuery = encodeURIComponent(searchParts.join(', '));
        googleMapsSearchLink = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
      }

      // Return null for missing data instead of hardcoded fallbacks
      return {
        name: communityName,
        logoUrl: logoUrl,
        municipalityName: municipalityName.toUpperCase(),
        address: address || null,
        googleMapsSearchLink,
        phone: contactInfo.phone || null,
        website: contactInfo.website || null,
        pec: contactInfo.pec || null,
        referentName: referentInfo.name || null,
        referentPhone: referentInfo.phone || null,
        referentEmail: referentInfo.email || null,
      };
    },
    relatedMarkets() {
      return this.relatedMarketsData.map((r) =>
        normalizeOdhItem(r, { lang: this.config.language, type: 'market' })
      );
    },
    relatedFairs() {
      const normalized = this.relatedFairsData.map((r) =>
        normalizeOdhItem(r, { lang: this.config.language, type: 'yearmarket' })
      );

      return normalized;
    },
    hasMapData() {
      return this.relatedMarkets.some((m) => m.coords) || this.relatedFairs.some((f) => f.coords);
    },
    mapCenter() {
      // First, try to use the community's position
      if (this.communityItem?.GpsPoints?.position?.Latitude && this.communityItem?.GpsPoints?.position?.Longitude) {
        return {
          lat: this.communityItem.GpsPoints.position.Latitude,
          lon: this.communityItem.GpsPoints.position.Longitude,
        };
      }

      // Fallback to average of related markets and fairs
      const allCoords = [
        ...this.relatedMarkets.filter((m) => m.coords).map((m) => [m.coords.lat, m.coords.lon]),
        ...this.relatedFairs.filter((f) => f.coords).map((f) => [f.coords.lat, f.coords.lon]),
      ];

      if (allCoords.length === 0) return { lat: 46.5, lon: 11.35 };

      const avgLat = allCoords.reduce((sum, [lat]) => sum + lat, 0) / allCoords.length;
      const avgLon = allCoords.reduce((sum, [, lon]) => sum + lon, 0) / allCoords.length;

      return { lat: avgLat, lon: avgLon };
    },
    mapZoom() {
      // If community has position, use a closer zoom level
      if (this.communityItem?.GpsPoints?.position?.Latitude && this.communityItem?.GpsPoints?.position?.Longitude) {
        return 13;
      }

      // Otherwise, use zoom based on related items
      const allCoords = [
        ...this.relatedMarkets.filter((m) => m.coords),
        ...this.relatedFairs.filter((f) => f.coords),
      ];
      return allCoords.length === 1 ? 13 : 10;
    },
    breadcrumbItems() {
      return [
        {
          label: this.t('community'),
          route: 'communityList',
        },
        {
          label: this.t('detail'),
        },
      ];
    },
  },
  watch: {
    id: {
      handler() {
        this.loadCommunityData();
      },
      immediate: true,
    },
    relatedFairsData: {
      handler(newVal, oldVal) {
        // Update scroll state when fairs data changes
        this.$nextTick(() => {
          this.updateFairsScrollState();
        });
      },
      deep: true,
    },
    relatedFairs: {
      handler() {
        // Update scroll state when computed fairs change
        this.$nextTick(() => {
          this.updateFairsScrollState();
        });
      },
    },
    relatedMarketsData: {
      handler(newVal, oldVal) {
        // Update scroll state when markets data changes
        this.$nextTick(() => {
          this.updateMarketsScrollState();
        });
      },
      deep: true,
    },
    relatedMarkets: {
      handler() {
        // Update scroll state when computed markets change
        this.$nextTick(() => {
          this.updateMarketsScrollState();
        });
      },
    },
  },
  async mounted() {
    await this.loadCommunityData();
    // Initialize scroll state after component is mounted
    this.$nextTick(() => {
      this.updateFairsScrollState();
      this.updateMarketsScrollState();
    });
    // Update scroll state on window resize
    window.addEventListener('resize', this.updateFairsScrollState);
    window.addEventListener('resize', this.updateMarketsScrollState);
  },
  beforeUnmount() {
    // Clean up resize listeners
    window.removeEventListener('resize', this.updateFairsScrollState);
    window.removeEventListener('resize', this.updateMarketsScrollState);
  },
  methods: {
    async loadCommunityData() {
      this.loadingCommunity = true;
      this.communityError = null;
      try {
        const community = await this.store.fetchCommunityById(this.id);

        if (community) {
          this.communityItem = community;
          // Fetch related fairs and markets using locfilter
          await Promise.all([
            this.loadRelatedFairs(),
            this.loadRelatedMarkets(),
          ]);
        } else {
          console.warn('[CommunityDetail] loadCommunityData: Community not found for id =', this.id);
          this.communityError = 'Community not found';
        }
      } catch (e) {
        this.communityError = e?.message || String(e);
        console.error('[CommunityDetail] Failed to load community:', e);
        console.error('[CommunityDetail] Error stack:', e?.stack);
      } finally {
        this.loadingCommunity = false;
      }
    },
    async loadRelatedFairs() {
      if (!this.communityItem) {
        return;
      }


      this.loadingFairs = true;
      this.fairsError = null;
      try {
        // Determine which locfilter to use based on available IDs
        // Priority: TourismVerein > Region > Municipality
        const tourismVereinId = this.communityItem?.LocationInfo?.TvInfo?.Id;
        const regionId = this.communityItem?.LocationInfo?.RegionInfo?.Id;
        const municipalityId = this.communityItem?.LocationInfo?.MunicipalityInfo?.Id;


        // Also try using the community ID directly (as done in CommunityList)
        const communityId = this.communityItem?.Id;

        let locfilter = null;
        if (tourismVereinId) {
          locfilter = `tvs${tourismVereinId}`;

        } else if (communityId) {
          // Try using community ID directly (as done in CommunityList)
          locfilter = `tvs${communityId}`;

        } else if (regionId) {
          locfilter = `reg${regionId}`;

        } else if (municipalityId) {
          locfilter = `mun${municipalityId}`;

        }

        if (locfilter) {


          const items = await this.store.fetchSimilarItems({
            type: 'yearmarket',
            locfilter,
            maxResults: 100,
          });

          this.relatedFairsData = items;
        } else {
          console.warn('[CommunityDetail] loadRelatedFairs: No locfilter could be determined');
        }
      } catch (e) {
        this.fairsError = e?.message || String(e);
        console.error('[CommunityDetail] Failed to load related fairs:', e);
        console.error('[CommunityDetail] Error stack:', e?.stack);
      } finally {
        this.loadingFairs = false;
      }
    },
    back() {
      this.store.go('communityList');
    },
    openDetails(item) {
      if (item.type === 'market') this.store.go('marketDetail', { id: item.id });
      else this.store.go('fairsDetail', { id: item.id });
    },
    contactReferent() {
      if (this.communityData?.referentEmail) {
        window.location.href = `mailto:${this.communityData.referentEmail}`;
      }
    },
    callReferent() {
      if (this.communityData?.referentPhone) {
        window.location.href = `tel:${this.communityData.referentPhone}`;
      }
    },
    scrollFairs(direction) {
      const slider = this.$refs.fairsSlider;
      if (!slider) return;

      // Get the first card to calculate its width
      const firstCard = slider.querySelector('.wcmc-community-detail__related-card');
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth;
      const gap = 12; // gap-3 = 12px
      const scrollAmount = cardWidth + gap;

      if (direction === 'left') {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    },
    updateFairsScrollState() {
      const slider = this.$refs.fairsSlider;
      if (!slider) {
        this.canScrollFairsLeft = false;
        this.canScrollFairsRight = false;
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = slider;
      this.canScrollFairsLeft = scrollLeft > 0;
      this.canScrollFairsRight = scrollLeft < scrollWidth - clientWidth - 1; // -1 for rounding
    },
    async loadRelatedMarkets() {
      if (!this.communityItem) {
        return;
      }

      this.loadingMarkets = true;
      this.marketsError = null;
      try {
        // Determine which locfilter to use based on available IDs
        // Priority: TourismVerein > Region > Municipality
        const tourismVereinId = this.communityItem?.LocationInfo?.TvInfo?.Id;
        const regionId = this.communityItem?.LocationInfo?.RegionInfo?.Id;
        const municipalityId = this.communityItem?.LocationInfo?.MunicipalityInfo?.Id;

        // Also try using the community ID directly (as done in CommunityList)
        const communityId = this.communityItem?.Id;

        let locfilter = null;
        if (tourismVereinId) {
          locfilter = `tvs${tourismVereinId}`;
        } else if (communityId) {
          // Try using community ID directly (as done in CommunityList)
          locfilter = `tvs${communityId}`;
        } else if (regionId) {
          locfilter = `reg${regionId}`;
        } else if (municipalityId) {
          locfilter = `mun${municipalityId}`;
        }

        if (locfilter) {
          const items = await this.store.fetchSimilarItems({
            type: 'market',
            locfilter,
            maxResults: 100,
          });

          this.relatedMarketsData = items;
        } else {
          console.warn('[CommunityDetail] loadRelatedMarkets: No locfilter could be determined');
        }
      } catch (e) {
        this.marketsError = e?.message || String(e);
        console.error('[CommunityDetail] Failed to load related markets:', e);
      } finally {
        this.loadingMarkets = false;
      }
    },
    scrollMarkets(direction) {
      const slider = this.$refs.marketsSlider;
      if (!slider) return;

      // Get the first card to calculate its width
      const firstCard = slider.querySelector('.wcmc-community-detail__related-card');
      if (!firstCard) return;

      const cardWidth = firstCard.offsetWidth;
      const gap = 12; // gap-3 = 12px
      const scrollAmount = cardWidth + gap;

      if (direction === 'left') {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    },
    updateMarketsScrollState() {
      const slider = this.$refs.marketsSlider;
      if (!slider) {
        this.canScrollMarketsLeft = false;
        this.canScrollMarketsRight = false;
        return;
      }

      const { scrollLeft, scrollWidth, clientWidth } = slider;
      this.canScrollMarketsLeft = scrollLeft > 0;
      this.canScrollMarketsRight = scrollLeft < scrollWidth - clientWidth - 1; // -1 for rounding
    },
    t(key) {
      const TRANSLATIONS = {
        en: {
          community: 'Community',
          detail: 'Detail',
          phone: 'Phone',
          website: 'Website',
          mail: 'Mail',
          referent: 'Referent',
          contact: 'Contact',
          call: 'Call',
          write: 'Write',
          relatedFairs: 'RELATED FAIRS',
          relatedMarkets: 'RELATED MARKETS',
          notAvailable: 'Not available',
        },
        it: {
          community: 'Comunità',
          detail: 'Dettaglio',
          phone: 'Telefono',
          website: 'Sito web',
          mail: 'Mail',
          referent: 'Referente',
          contact: 'Contatta',
          call: 'Chiama',
          write: 'Scrivi',
          relatedFairs: 'FIERE CORRELATE',
          relatedMarkets: 'MERCATI CORRELATI',
          notAvailable: 'Non disponibile',
        },
        de: {
          community: 'Community',
          detail: 'Detail',
          phone: 'Telefon',
          website: 'Website',
          mail: 'Mail',
          referent: 'Referent',
          contact: 'Kontakt',
          call: 'Anrufen',
          write: 'Schreiben',
          relatedFairs: 'VERWANDTE MESSEN',
          relatedMarkets: 'VERWANDTE MÄRKTE',
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
