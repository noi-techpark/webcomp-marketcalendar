<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-map-view d-flex flex-column h-100 min-h-0 pb-3">
    <!-- Breadcrumb removed -->

    <!-- Mobile: All controls in single row -->
    <div class="d-md-none">
      <!-- Title + Filter Badge -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="wcmc-page-title wcmc-page-title-large mb-0">{{ t('map') }}</h2>
        <button
          type="button"
          class="btn bg-transparent rounded position-relative d-flex align-items-center justify-content-center wcmc-mobile-filter-button-theme flex-shrink-0"
          @click="mobileFilterVisible = true"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clip-rule="evenodd"/>
          </svg>
          <span v-if="activeFilterCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill wcmc-filter-badge-theme">{{ activeFilterCount }}</span>
        </button>
      </div>
      
      <!-- Single Row: Today + Date + Search -->
      <div class="d-flex gap-2 mb-3">
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base flex-shrink-0"
          :class="{ 'active': filters.date === 'today' }"
          @click="toggleTodayFilter"
        >
          {{ t('today') }}
        </button>
        
        <div class="wcmc-date-selector-wrapper position-relative wcmc-flex-grow-min" @touchstart.prevent="handleDateTouchMobile">
          <input
            id="wcmc-map-date-selector-mobile"
            name="date-selector-mobile"
            type="text"
            class="wcmc-date-selector wcmc-input-base wcmc-pointer-events-none form-control fst-italic w-100"
            :placeholder="t('selectDate')"
            :value="formattedDate"
            readonly
          />
          <input
            type="date"
            class="wcmc-date-input-overlay"
            :value="selectedDate"
            @change="onDateChange"
            ref="dateInputMobile"
          />
          <svg class="wcmc-date-selector-icon position-absolute wcmc-icon-centered" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; pointer-events: none;">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </div>
        
        <div class="wcmc-search-wrapper wcmc-flex-grow-min">
          <div class="wcmc-search-box position-relative d-flex align-items-center">
            <input
              id="wcmc-map-search-input-mobile"
              name="search-mobile"
              type="search"
              class="wcmc-search-input wcmc-input-base form-control w-100"
              :placeholder="t('search')"
              :value="query"
              @input="query = $event.target.value"
            />
            <svg class="wcmc-search-icon position-absolute wcmc-icon-right" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop: Title + Controls Row -->
    <div class="d-none d-md-flex flex-row justify-content-between align-items-center mb-3">
      <!-- Title -->
      <h2 class="wcmc-page-title">{{ t('map') }}</h2>

      <!-- Header row: Quick filter + Date selector + Search -->
      <div class="d-flex align-items-center gap-3">
        <!-- Quick filter "Oggi" -->
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green"
          :class="{ 'active': filters.date === 'today' }"
          @click="toggleTodayFilter"
        >
          {{ t('today') }}
        </button>
        
        <!-- Date selector -->
        <div class="wcmc-date-selector-wrapper position-relative wcmc-cursor-pointer" @click="openDatePicker">
          <input
            id="wcmc-date-selector-map"
            name="date-selector"
            type="text"
            class="wcmc-date-selector form-control fst-italic"
            :placeholder="t('selectDate')"
            :value="formattedDate"
            readonly
            @click="openDatePicker"
            ref="dateDisplay"
          />
          <input
            type="date"
            class="position-absolute top-0 start-0 w-100 h-100 opacity-0 wcmc-cursor-pointer"
            style="z-index: 10;"
            :value="selectedDate"
            @change="onDateChange"
            ref="dateInput"
            tabindex="-1"
          />
          <svg class="wcmc-date-selector-icon position-absolute wcmc-icon-centered" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; pointer-events: none; z-index: 2;">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </div>
        
        <!-- Search box -->
        <div class="wcmc-search-wrapper">
          <div class="wcmc-search-box position-relative d-flex align-items-center">
            <input
              id="wcmc-map-search-input"
              name="search"
              type="search"
              class="wcmc-search-input form-control"
              :placeholder="t('search')"
              :value="query"
              @input="query = $event.target.value"
            />
            <svg class="wcmc-search-icon position-absolute wcmc-icon-right" width="16" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter bar (Desktop only) -->
    <div v-if="filterVisible" class="wcmc-filter-bar mb-4 p-4 px-5 rounded d-none d-md-block">
      <div class="wcmc-filter-dropdowns d-flex flex-wrap gap-4 gap-md-5">
        <!-- Typology Filter -->
        <div class="wcmc-filter-group wcmc-filter-group-base position-relative d-flex flex-column gap-1 flex-fill min-w-0" ref="typologyFilter">
          <label class="wcmc-filter-label fw-medium text-uppercase">{{ t('typology') }}</label>
          <div 
            class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between" 
            @click.stop="toggleDropdown('typology')"
          >
            <span class="flex-grow-1 text-start text-truncate me-2">{{ typologyDisplayText }}</span>
            <svg class="wcmc-filter-chevron flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: dropdownOpen.typology ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
              <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-show="dropdownOpen.typology" class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleTypology('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.typology.length === 0" readonly>
              <span class="small">{{ t('allTypologies') }}</span>
            </div>
            <div v-for="typ in availableTypologies" :key="typ" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleTypology(typ)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.typology.includes(typ)" readonly>
              <span class="small">{{ typ }}</span>
            </div>
          </div>
        </div>

        <!-- Zone Filter -->
        <div class="wcmc-filter-group wcmc-filter-group-base position-relative d-flex flex-column gap-1 flex-fill min-w-0" ref="zoneFilter">
          <label class="wcmc-filter-label fw-medium text-uppercase">{{ t('zone') }}</label>
          <div 
            class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between" 
            @click.stop="toggleDropdown('zone')"
          >
            <span class="flex-grow-1 text-start text-truncate me-2">{{ zoneDisplayText }}</span>
            <svg class="wcmc-filter-chevron flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: dropdownOpen.zone ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
              <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-show="dropdownOpen.zone" class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleZone('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.zone.length === 0" readonly>
              <span class="small">{{ t('allLocations') }}</span>
            </div>
            <div v-for="zone in availableZones" :key="zone" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleZone(zone)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.zone.includes(zone)" readonly>
              <span class="small">{{ zone }}</span>
            </div>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="wcmc-filter-group wcmc-filter-group-base position-relative d-flex flex-column gap-1 flex-fill min-w-0" ref="categoryFilter">
          <label class="wcmc-filter-label fw-medium text-uppercase">{{ t('category') }}</label>
          <div 
            class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between" 
            @click.stop="toggleDropdown('category')"
          >
            <span class="flex-grow-1 text-start text-truncate me-2">{{ categoryDisplayText }}</span>
            <svg class="wcmc-filter-chevron flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: dropdownOpen.category ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
              <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-show="dropdownOpen.category" class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleCategory('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.category.length === 0" readonly>
              <span class="small">{{ t('allCategories') }}</span>
            </div>
            <div v-for="cat in availableCategories" :key="cat" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleCategory(cat)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.category.includes(cat)" readonly>
              <span class="small">{{ cat }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Active filter tags -->
      <div v-if="activeFilterTags.length > 0 || filters.date" class="wcmc-filter-tags d-flex flex-wrap gap-2 mt-4 pt-4 border-top">
        <span v-if="filters.date" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="filters.date = ''">
          {{ filters.date === 'today' ? t('today') : formattedDate }}
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
        </span>
        <span v-for="tag in activeFilterTags" :key="tag.type + tag.value" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="tag.type === 'typology' ? toggleTypology(tag.value) : tag.type === 'zone' ? toggleZone(tag.value) : toggleCategory(tag.value)">
          {{ tag.label }}
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
        </span>
      </div>
    </div>

    <!-- Mobile Filter Modal -->
    <div v-if="mobileFilterVisible" class="wcmc-mobile-filter-overlay" @click.self="mobileFilterVisible = false">
      <div class="wcmc-mobile-filter-panel">
        <!-- Filter Header -->
        <div class="wcmc-mobile-filter-header d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <h3 class="mb-0 fw-bold">{{ t('filters') }}</h3>
            <button type="button" class="btn btn-link p-0 text-decoration-none" @click="clearAllFilters">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>
          </div>
          <button type="button" class="btn btn-link p-0 text-decoration-none" @click="mobileFilterVisible = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        
        <!-- Filter Content -->
        <div class="wcmc-mobile-filter-content p-3">
          <!-- Typology Filter -->
          <div class="wcmc-mobile-filter-section mb-4">
            <h4 class="wcmc-mobile-filter-section-title text-uppercase mb-3">{{ t('typology') }}</h4>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="typologyFilter" id="typologyAll" :checked="filters.typology.length === 0" @change="filters.typology = []">
              <label class="form-check-label" for="typologyAll">{{ t('seeAll') }}</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="typologyFilter" id="typologySpecific" :checked="filters.typology.length > 0">
              <label class="form-check-label" for="typologySpecific">{{ t('specificTypologies') }}</label>
            </div>
            <div v-if="filters.typology.length > 0 || true" class="ms-4 mt-2">
              <div v-for="typ in availableTypologies" :key="typ" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'typ-'+typ" :checked="filters.typology.includes(typ)" @change="toggleTypology(typ)">
                <label class="form-check-label" :for="'typ-'+typ">{{ typ }}</label>
              </div>
            </div>
          </div>

          <!-- Zone Filter -->
          <div class="wcmc-mobile-filter-section mb-4">
            <h4 class="wcmc-mobile-filter-section-title text-uppercase mb-3">{{ t('zone') }}</h4>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="zoneFilter" id="zoneAll" :checked="filters.zone.length === 0" @change="filters.zone = []">
              <label class="form-check-label" for="zoneAll">{{ t('seeAll') }}</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="zoneFilter" id="zoneSpecific" :checked="filters.zone.length > 0">
              <label class="form-check-label" for="zoneSpecific">{{ t('specificLocations') }}</label>
            </div>
            <div v-if="filters.zone.length > 0 || true" class="ms-4 mt-2">
              <div v-for="zone in availableZones" :key="zone" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'zone-'+zone" :checked="filters.zone.includes(zone)" @change="toggleZone(zone)">
                <label class="form-check-label" :for="'zone-'+zone">{{ zone }}</label>
              </div>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="wcmc-mobile-filter-section mb-4">
            <h4 class="wcmc-mobile-filter-section-title text-uppercase mb-3">{{ t('category') }}</h4>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="categoryFilter" id="categoryAll" :checked="filters.category.length === 0" @change="filters.category = []">
              <label class="form-check-label" for="categoryAll">{{ t('seeAll') }}</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="categoryFilter" id="categorySpecific" :checked="filters.category.length > 0">
              <label class="form-check-label" for="categorySpecific">{{ t('specificCategories') }}</label>
            </div>
            <div v-if="filters.category.length > 0 || true" class="ms-4 mt-2">
              <div v-for="cat in availableCategories" :key="cat" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'cat-'+cat" :checked="filters.category.includes(cat)" @change="toggleCategory(cat)">
                <label class="form-check-label" :for="'cat-'+cat">{{ cat }}</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ErrorAlert v-if="markets.error || fairs.error" :message="markets.error || fairs.error" />

    <!-- Map -->
    <div class="wcmc-map-container flex-fill min-h-0 w-100 rounded overflow-hidden position-relative">
      <LeafletMap
        :height="mapHeight"
        :markets="filteredMarkets"
        :fairs="filteredFairs"
        :show-markets="filters.typeMarkets"
        :show-fairs="filters.typeFairs"
        :lang="lang"
        :config="config"
        v-bind="mapConfig"
        @openDetails="openDetails"
      />
      <!-- Empty State Overlay -->
      <div v-if="showEmptyState" class="wcmc-map-empty-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center" style="background: rgba(0,0,0,0.6); z-index: 1000;">
        <div class="text-center text-white">
          <p class="mb-2 fw-bold">{{ t('noResults') }}</p>
          <p class="small opacity-75 mb-0">{{ t('tryDifferentFilters') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LeafletMap from '../components/LeafletMap.vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import { normalizeOdhItem } from '../../utils/normalize';

const TRANSLATIONS = {
  en: {
    map: 'Map',
    type: 'TYPE',
    markets: 'Markets',
    fairs: 'Fairs',
    weekday: 'DAY OF THE WEEK',
    zone: 'ZONE',
    frequency: 'FREQUENCY',
    period: 'PERIOD',
    typology: 'TYPOLOGY',
    category: 'CATEGORY',
    allDays: 'All days',
    allLocations: 'All locations',
    allFrequencies: 'All frequencies',
    allPeriods: 'All periods',
    allTypologies: 'All typologies',
    allCategories: 'All categories',
    winter: 'Winter',
    summer: 'Summer',
    today: 'Today',
    selected: 'selected',
    selectDate: 'Select date',
    searchPlaceholderNew: 'Write something...',
    search: 'Search...',
    filters: 'Filters',
    seeAll: 'See all',
    specificTypologies: 'Specific typologies',
    specificLocations: 'Specific locations',
    specificCategories: 'Specific categories',
    noResults: 'No results',
    tryDifferentFilters: 'Try modifying the search or filters.',
  },
  it: {
    map: 'Mappa',
    type: 'TIPO',
    markets: 'Mercati',
    fairs: 'Fiere',
    weekday: 'GIORNO DELLA SETTIMANA',
    zone: 'ZONA',
    frequency: 'FREQUENZA',
    period: 'PERIODO',
    typology: 'TIPOLOGIA',
    category: 'CATEGORIA',
    allDays: 'Vedi tutti',
    allLocations: 'Tutte le località',
    allFrequencies: 'Tutte le frequenze',
    allPeriods: 'Tutti i periodi',
    allTypologies: 'Vedi tutti',
    allCategories: 'Tutte le categorie',
    winter: 'Invernale',
    summer: 'Estivo',
    today: 'Oggi',
    selected: 'selezionati',
    selectDate: 'Seleziona data',
    searchPlaceholderNew: 'Scrivi qualcosa...',
    search: 'Cerca...',
    filters: 'Filtri',
    seeAll: 'Vedi tutti',
    specificTypologies: 'Tipologie specifiche',
    specificLocations: 'Località specifiche',
    specificCategories: 'Categorie specifiche',
    noResults: 'Nessun risultato',
    tryDifferentFilters: 'Prova a modificare la ricerca o i filtri.',
  },
  de: {
    map: 'Karte',
    type: 'TYP',
    markets: 'Märkte',
    fairs: 'Messen',
    weekday: 'WOCHENTAG',
    zone: 'ZONE',
    frequency: 'HÄUFIGKEIT',
    period: 'ZEITRAUM',
    typology: 'TYPOLOGIE',
    category: 'KATEGORIE',
    allDays: 'Alle Tage',
    allLocations: 'Alle Orte',
    allFrequencies: 'Alle Häufigkeiten',
    allPeriods: 'Alle Zeiträume',
    allTypologies: 'Alle Typologien',
    allCategories: 'Alle Kategorien',
    winter: 'Winter',
    summer: 'Sommer',
    today: 'Heute',
    selected: 'ausgewählt',
    selectDate: 'Datum auswählen',
    searchPlaceholderNew: 'Schreibe etwas...',
    search: 'Suchen...',
    filters: 'Filter',
    seeAll: 'Alle anzeigen',
    specificTypologies: 'Bestimmte Typologien',
    specificLocations: 'Bestimmte Orte',
    specificCategories: 'Bestimmte Kategorien',
    noResults: 'Keine Ergebnisse',
    tryDifferentFilters: 'Versuchen Sie, die Suche oder Filter zu ändern.',
  },
};


export default {
  name: 'MapView',
  components: { LeafletMap, ErrorAlert },
  props: {
    config: { type: Object, required: true },
    store: { type: Object, required: true },
  },
  data() {
    // Initialize filters with default values from config
    const zoneDefault = this.config.filterZoneDefaultValue ? 
      (Array.isArray(this.config.filterZoneDefaultValue) ? this.config.filterZoneDefaultValue : [this.config.filterZoneDefaultValue]) 
      : [];
    const categoryDefault = this.config.filterCategoryDefaultValue ? 
      (Array.isArray(this.config.filterCategoryDefaultValue) ? this.config.filterCategoryDefaultValue : [this.config.filterCategoryDefaultValue]) 
      : [];
    
    return {
      query: '',
      selectedDate: '',
      filters: {
        typeMarkets: true,
        typeFairs: true,
        date: '',
        zone: zoneDefault,
        typology: [],
        category: categoryDefault,
      },
      dropdownOpen: {
        zone: false,
        typology: false,
        category: false,
      },
      mobileFilterVisible: false,
      minItems: Math.max(60, (this.config.pageSize || 20) * 3),
    };
  },
  computed: {
    filterVisible() {
      // Explicitly check if filterVisibility is true (default to true if undefined)
      return this.config.filterVisibility === true || this.config.filterVisibility === undefined;
    },
    lang() {
      return this.config.language || 'it';
    },
    activeFilterCount() {
      let count = 0;
      if (this.filters.date && this.filters.date !== '') count++;
      count += this.filters.typology.length;
      count += this.filters.zone.length;
      count += this.filters.category.length;
      return count;
    },
    formattedDate() {
      if (!this.selectedDate) return '';
      // Format date as dd/mm/yyyy
      const date = new Date(this.selectedDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    markets() {
      return this.store.state.markets;
    },
    fairs() {
      return this.store.state.fairs;
    },
    normalizedMarkets() {
      return this.markets.itemsRaw.map((it) => normalizeOdhItem(it, { lang: this.config.language, type: 'market' }));
    },
    normalizedFairs() {
      return this.fairs.itemsRaw.map((it) => normalizeOdhItem(it, { lang: this.config.language, type: 'yearmarket' }));
    },
    allNormalized() {
      return [...this.normalizedMarkets, ...this.normalizedFairs];
    },
    baseFilteredMarketsForZone() {
      // Zone options should only show zones that would produce visible (mappable) results
      return this.applyFilters(this.normalizedMarkets, { ignoreZone: true }).filter((n) => n.coords);
    },
    baseFilteredFairsForZone() {
      // Zone options should only show zones that would produce visible (mappable) results
      return this.applyFilters(this.normalizedFairs, { ignoreZone: true }).filter((n) => n.coords);
    },
    allBaseForZone() {
      return [...this.baseFilteredMarketsForZone, ...this.baseFilteredFairsForZone];
    },
    availableZones() {
      const zones = new Set();
      this.allBaseForZone.forEach((item) => {
        if (item.municipality) zones.add(item.municipality);
      });
      return Array.from(zones).sort();
    },
    availableTypologies() {
      const typs = new Set();
      this.allNormalized.forEach((item) => {
        const raw = item.raw;
        const tags = raw?.ODHTags || raw?.Tags || [];
        if (Array.isArray(tags)) {
          tags.forEach((tag) => {
            const name = tag?.Id || tag?.Name || tag;
            if (typeof name === 'string' && name) typs.add(name);
          });
        }
      });
      return Array.from(typs).sort();
    },
    availableCategories() {
      const cats = new Set();
      this.allNormalized.forEach((item) => {
        const raw = item.raw;
        const tags = raw?.ODHTags || raw?.Tags || [];
        if (Array.isArray(tags)) {
          tags.forEach((tag) => {
            const name = tag?.Id || tag?.Name || tag;
            if (typeof name === 'string' && name) cats.add(name);
          });
        }
      });
      return Array.from(cats).sort();
    },
    typologyDisplayText() {
      if (this.filters.typology.length === 0) return this.t('allTypologies');
      if (this.filters.typology.length === 1) return this.filters.typology[0];
      return `${this.filters.typology.length} ${this.t('selected')}`;
    },
    zoneDisplayText() {
      if (this.filters.zone.length === 0) return this.t('allLocations');
      if (this.filters.zone.length === 1) return this.filters.zone[0];
      return `${this.filters.zone.length} ${this.t('selected')}`;
    },
    categoryDisplayText() {
      if (this.filters.category.length === 0) return this.t('allCategories');
      if (this.filters.category.length === 1) return this.filters.category[0];
      return `${this.filters.category.length} ${this.t('selected')}`;
    },
    activeFilterTags() {
      const tags = [];
      // Typology
      this.filters.typology.forEach(val => {
        tags.push({ type: 'typology', value: val, label: val });
      });
      // Zone
      this.filters.zone.forEach(val => {
        tags.push({ type: 'zone', value: val, label: val });
      });
      // Category
      this.filters.category.forEach(val => {
        tags.push({ type: 'category', value: val, label: val });
      });
      return tags;
    },
    filteredMarkets() {
      return this.applyFilters(this.normalizedMarkets).filter((n) => n.coords);
    },
    filteredFairs() {
      return this.applyFilters(this.normalizedFairs).filter((n) => n.coords);
    },
    mapHeight() {
      // Calculate height: viewport minus header, title, filters, padding
      // Approximate: 100vh - 200px (header + title + filters + margins)
      return 'calc(100vh - 280px)';
    },

    mapConfig() {
      const config = {};
      if (this.config.mapCenter) {
        config.initialCenter = this.config.mapCenter;
      }
      if (this.config.mapZoom !== undefined && this.config.mapZoom !== null) {
        config.initialZoom = this.config.mapZoom;
      }
      return config;
    },
    showEmptyState() {
      // Show empty state when data is loaded but no results match filters
      const marketsLoaded = !this.markets.loading && this.normalizedMarkets.length > 0;
      const fairsLoaded = !this.fairs.loading && this.normalizedFairs.length > 0;
      const hasData = marketsLoaded || fairsLoaded;
      const noResults = this.filteredMarkets.length === 0 && this.filteredFairs.length === 0;
      return hasData && noResults;
    },
  },
  async mounted() {
    await Promise.all([
      this.store.ensureLoaded('market', this.minItems),
      this.store.ensureLoaded('yearmarket', this.minItems),
    ]);
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    availableZones: {
      immediate: true,
      handler() {
        // Avoid clearing configured defaults before data is actually loaded
        const marketsReady = this.markets?.done || (this.markets?.itemsRaw && this.markets.itemsRaw.length > 0);
        const fairsReady = this.fairs?.done || (this.fairs?.itemsRaw && this.fairs.itemsRaw.length > 0);
        if (!marketsReady && !fairsReady) return;
        this.pruneZoneSelection();
      },
    },
  },
  methods: {
    t(key) {
      const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.it;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    applyFilters(items, { ignoreZone = false } = {}) {
      let result = items;

      // Text search
      const q = String(this.query || '').trim().toLowerCase();
      if (q) {
        result = result.filter((n) => String(n.title || '').toLowerCase().includes(q));
      }

      // Date filter (today or specific date)
      if (this.filters.date === 'today') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        result = result.filter((item) => {
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          return itemDate.toDateString() === today.toDateString();
        });
      } else if (this.filters.date === 'specific' && this.selectedDate) {
        const selectedDateObj = new Date(this.selectedDate);
        result = result.filter((item) => {
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          return itemDate.toDateString() === selectedDateObj.toDateString();
        });
      }

      // Zone filter
      if (!ignoreZone && this.filters.zone.length > 0) {
        result = result.filter((item) => this.filters.zone.includes(item.municipality));
      }

      // Typology filter
      if (this.filters.typology.length > 0) {
        result = result.filter((item) => {
          const raw = item.raw;
          const tags = raw?.ODHTags || raw?.Tags || [];
          if (Array.isArray(tags)) {
            return tags.some((tag) => {
              const name = tag?.Id || tag?.Name || tag;
              return this.filters.typology.includes(String(name));
            });
          }
          return false;
        });
      }

      // Category filter
      if (this.filters.category.length > 0) {
        result = result.filter((item) => {
          const raw = item.raw;
          const tags = raw?.ODHTags || raw?.Tags || [];
          if (Array.isArray(tags)) {
            return tags.some((tag) => {
              const name = tag?.Id || tag?.Name || tag;
              return this.filters.category.includes(String(name));
            });
          }
          return false;
        });
      }

      return result;
    },
    pruneZoneSelection() {
      if (!Array.isArray(this.filters.zone) || this.filters.zone.length === 0) return;
      const allowed = new Set(this.availableZones);
      const next = this.filters.zone.filter((z) => allowed.has(z));
      if (next.length !== this.filters.zone.length) {
        this.filters.zone = next;
      }
    },
    toggleTodayFilter() {
      if (this.filters.date === 'today') {
        this.filters.date = '';
        this.selectedDate = '';
      } else {
        // Set today's date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        this.selectedDate = `${year}-${month}-${day}`;
        this.filters.date = 'today';
      }
    },
    toggleDropdown(name) {
      // Close all others, toggle current
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[key] = (key === name) ? !this.dropdownOpen[name] : false;
      });
    },
    toggleZone(value) {
      if (value === 'all') {
        this.filters.zone = [];
        return;
      }
      const idx = this.filters.zone.indexOf(value);
      if (idx >= 0) {
        this.filters.zone.splice(idx, 1);
      } else {
        this.filters.zone.push(value);
      }
    },
    toggleTypology(value) {
      if (value === 'all') {
        this.filters.typology = [];
        return;
      }
      const idx = this.filters.typology.indexOf(value);
      if (idx >= 0) {
        this.filters.typology.splice(idx, 1);
      } else {
        this.filters.typology.push(value);
      }
    },
    toggleCategory(value) {
      if (value === 'all') {
        this.filters.category = [];
        return;
      }
      const idx = this.filters.category.indexOf(value);
      if (idx >= 0) {
        this.filters.category.splice(idx, 1);
      } else {
        this.filters.category.push(value);
      }
    },
    handleClickOutside(event) {
      // Check if click is inside any filter ref
      const isInside = this.$refs.zoneFilter?.contains(event.target) ||
                       this.$refs.typologyFilter?.contains(event.target) ||
                       this.$refs.categoryFilter?.contains(event.target);
      
      if (!isInside) {
        this.dropdownOpen.zone = false;
        this.dropdownOpen.typology = false;
        this.dropdownOpen.category = false;
      }
    },
    openDatePicker() {
      // Open the date picker by clicking on the input
      if (this.$refs.dateInput) {
        this.$refs.dateInput.showPicker?.();
        // Fallback: focus and click if showPicker is not available 
        if (!this.$refs.dateInput.showPicker) {
          this.$refs.dateInput.focus();
          this.$refs.dateInput.click();
        }
      }
    },
    handleDateTouchMobile() {
      // Handle touch on mobile to open date picker
      const dateInput = this.$refs.dateInputMobile;
      if (dateInput) {
        dateInput.focus();
        // Try showPicker first (modern browsers)
        if (dateInput.showPicker) {
          try {
            dateInput.showPicker();
          } catch (e) {
            // showPicker may fail, fallback to click
            dateInput.click();
          }
        } else {
          dateInput.click();
        }
      }
    },
    onDateChange(event) {
      const dateValue = event.target.value;
      this.selectedDate = dateValue;
      if (dateValue) {
        this.filters.date = 'specific';
      } else {
        this.filters.date = '';
      }
    },
    openDetails({ type, id }) {
      if (type === 'market') this.store.go('marketDetail', { id });
      else this.store.go('fairsDetail', { id });
    },
    clearAllFilters() {
      // Reset to default values from config
      const zoneDefault = this.config.filterZoneDefaultValue ? 
        (Array.isArray(this.config.filterZoneDefaultValue) ? this.config.filterZoneDefaultValue : [this.config.filterZoneDefaultValue]) 
        : [];
      const categoryDefault = this.config.filterCategoryDefaultValue ? 
        (Array.isArray(this.config.filterCategoryDefaultValue) ? this.config.filterCategoryDefaultValue : [this.config.filterCategoryDefaultValue]) 
        : [];
      
      this.filters.date = '';
      this.filters.typology = [];
      this.filters.zone = zoneDefault;
      this.filters.category = categoryDefault;
      this.selectedDate = '';
    },
  },
};
</script>
