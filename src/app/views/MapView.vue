<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-map-view d-flex flex-column h-100 min-h-0 pb-3">
    <!-- Breadcrumb removed -->

    <!-- Mobile: All controls -->
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
      
      <!-- Preset buttons row -->
      <div class="d-flex gap-2 mb-3">
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base flex-fill"
          :class="{ 'active': activePreset === 'today' }"
          @click="setPresetToday"
        >
          {{ t('today') }}
        </button>
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base flex-fill"
          :class="{ 'active': activePreset === '7days' }"
          @click="setPreset7Days"
        >
          {{ t('sevenDays') }}
        </button>
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base flex-fill"
          :class="{ 'active': activePreset === 'month' }"
          @click="setPresetMonth"
        >
          {{ t('month') }}
        </button>
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base flex-fill"
          :class="{ 'active': activePreset === 'year' }"
          @click="setPresetYear"
        >
          {{ t('year') }}
        </button>
      </div>
      
      <!-- Date range inputs row -->
      <div class="d-flex gap-2 mb-3">
        <div class="wcmc-date-selector-wrapper position-relative wcmc-flex-grow-min" @touchstart.prevent="handleDateTouchMobileFrom">
          <input
            id="wcmc-date-selector-from-mobile-map"
            name="date-selector-from-mobile"
            type="text"
            class="wcmc-date-selector wcmc-input-base wcmc-pointer-events-none form-control fst-italic w-100"
            :placeholder="t('selectStartDate')"
            :value="formattedDateFrom"
            readonly
          />
          <input
            type="date"
            class="wcmc-date-input-overlay"
            :value="dateRange.from"
            @change="onDateFromChange"
            ref="dateInputMobileFrom"
          />
          <svg class="wcmc-date-selector-icon position-absolute wcmc-icon-centered" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; pointer-events: none;">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </div>
        
        <div class="wcmc-date-selector-wrapper position-relative wcmc-flex-grow-min" @touchstart.prevent="handleDateTouchMobileTo">
          <input
            id="wcmc-date-selector-to-mobile-map"
            name="date-selector-to-mobile"
            type="text"
            class="wcmc-date-selector wcmc-input-base wcmc-pointer-events-none form-control fst-italic w-100"
            :placeholder="t('selectEndDate')"
            :value="formattedDateTo"
            readonly
          />
          <input
            type="date"
            class="wcmc-date-input-overlay"
            :value="dateRange.to"
            @change="onDateToChange"
            ref="dateInputMobileTo"
          />
          <svg class="wcmc-date-selector-icon position-absolute wcmc-icon-centered" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; pointer-events: none;">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </div>
      </div>
      
      <!-- Show past toggle + Reset button row -->
      <div class="d-flex gap-2 mb-3 align-items-center">
        <div class="d-flex align-items-center gap-2 flex-fill">
          <label class="form-check form-switch mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :checked="filters.showPast"
              :disabled="markets.loading || fairs.loading"
              @change="filters.showPast = $event.target.checked"
            />
            <span class="form-check-label small">{{ t('showPast') }}</span>
          </label>
        </div>
        <button
          type="button"
          class="btn btn-primary flex-fill"
          @click="clearAllFilters"
        >
          {{ t('resetFilters') }}
        </button>
      </div>
      
      <!-- Search bar row -->
      <div class="d-flex gap-2 mb-3">
        <div class="wcmc-search-wrapper w-100">
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

      <!-- Header row: Preset buttons + Date range + Show past + Search -->
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <!-- Preset buttons -->
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green"
          :class="{ 'active': activePreset === 'today' }"
          @click="setPresetToday"
        >
          {{ t('today') }}
        </button>
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green"
          :class="{ 'active': activePreset === '7days' }"
          @click="setPreset7Days"
        >
          {{ t('sevenDays') }}
        </button>
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green"
          :class="{ 'active': activePreset === 'month' }"
          @click="setPresetMonth"
        >
          {{ t('month') }}
        </button>
        <button
          type="button"
          class="btn wcmc-quick-filter wcmc-quick-filter--green"
          :class="{ 'active': activePreset === 'year' }"
          @click="setPresetYear"
        >
          {{ t('year') }}
        </button>
        
        <!-- Date range inputs -->
        <div class="wcmc-date-selector-wrapper position-relative wcmc-cursor-pointer" @click="openDatePickerFrom">
          <input
            id="wcmc-date-selector-from-map"
            name="date-selector-from"
            type="text"
            class="wcmc-date-selector form-control fst-italic"
            :placeholder="t('selectStartDate')"
            :value="formattedDateFrom"
            readonly
            @click="openDatePickerFrom"
            ref="dateDisplayFrom"
          />
          <input
            type="date"
            class="position-absolute top-0 start-0 w-100 h-100 opacity-0 wcmc-cursor-pointer"
            style="z-index: 10;"
            :value="dateRange.from"
            @change="onDateFromChange"
            ref="dateInputFrom"
            tabindex="-1"
          />
          <svg class="wcmc-date-selector-icon position-absolute wcmc-icon-centered" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; pointer-events: none; z-index: 2;">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </div>
        
        <div class="wcmc-date-selector-wrapper position-relative wcmc-cursor-pointer" @click="openDatePickerTo">
          <input
            id="wcmc-date-selector-to-map"
            name="date-selector-to"
            type="text"
            class="wcmc-date-selector form-control fst-italic"
            :placeholder="t('selectEndDate')"
            :value="formattedDateTo"
            readonly
            @click="openDatePickerTo"
            ref="dateDisplayTo"
          />
          <input
            type="date"
            class="position-absolute top-0 start-0 w-100 h-100 opacity-0 wcmc-cursor-pointer"
            style="z-index: 10;"
            :value="dateRange.to"
            @change="onDateToChange"
            ref="dateInputTo"
            tabindex="-1"
          />
          <svg class="wcmc-date-selector-icon position-absolute wcmc-icon-centered" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; pointer-events: none; z-index: 2;">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </div>
        
        <!-- Show past toggle -->
        <div class="d-flex align-items-center gap-2">
          <label class="form-check form-switch mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :checked="filters.showPast"
              :disabled="markets.loading || fairs.loading"
              @change="filters.showPast = $event.target.checked"
            />
            <span class="form-check-label small">{{ t('showPast') }}</span>
          </label>
        </div>
        
        <!-- Search box + Reset button -->
        <div class="d-flex align-items-center gap-2">
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
          <button
            type="button"
            class="btn btn-sm btn-primary wcmc-hide-above-1024"
            @click="clearAllFilters"
          >
            {{ t('resetFilters') }}
          </button>
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
            <div v-for="typ in availableTypologies" :key="typ.value" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleTypology(typ.value)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.typology.includes(typ.value)" readonly>
              <span class="small">{{ typ.label }}</span>
              <span class="rounded-circle d-inline-block" :style="{ width: '10px', height: '10px', backgroundColor: typ.color}"></span>
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
            <div v-for="cat in availableCategories" :key="cat.Id" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleCategory(cat.Id)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.category.includes(cat.Id)" readonly>
              <span class="small">{{ cat.Name }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Active filter tags (Desktop) -->
      <div v-if="activeFilterTags.length > 0 || dateRange.from || dateRange.to || filters.showPast" class="wcmc-filter-tags d-none d-md-flex flex-wrap gap-2 align-items-center justify-content-between mt-4 pt-4 border-top">
        <div class="d-flex flex-wrap gap-2">
          <span v-if="dateRange.from || dateRange.to" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="dateRange.from = ''; dateRange.to = ''; activePreset = null">
            {{ formattedDateFrom }} - {{ formattedDateTo }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
          <span v-if="filters.showPast" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="filters.showPast = false">
            {{ t('showPast') }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
          <span v-for="tag in activeFilterTags" :key="tag.type + tag.value" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="tag.type === 'typology' ? toggleTypology(tag.value) : tag.type === 'zone' ? toggleZone(tag.value) : toggleCategory(tag.value)">
            {{ tag.label }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
        </div>
        <button
          type="button"
          class="btn btn-link p-0 text-decoration-none d-flex align-items-center gap-2"
          @click="clearAllFilters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          <span class="small">{{ t('resetFilters') }}</span>
        </button>
      </div>
    </div>

    <!-- Mobile Filter Modal -->
    <div v-if="mobileFilterVisible" class="wcmc-mobile-filter-overlay" @click.self="mobileFilterVisible = false">
      <div class="wcmc-mobile-filter-panel">
        <!-- Filter Header -->
        <div class="wcmc-mobile-filter-header d-flex align-items-center justify-content-between p-3 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <h3 class="mb-0 fw-bold">{{ t('filters') }}</h3>
            <button type="button" class="btn btn-link p-0 text-decoration-none" @click="clearMenuFilters">
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
              <div v-for="typ in availableTypologies" :key="typ.value" class="form-check mb-2 d-flex align-items-center">
                <input class="form-check-input" type="checkbox" :id="'typ-'+typ.value" :checked="filters.typology.includes(typ.value)" @change="toggleTypology(typ.value)">
                <label class="form-check-label ms-2 flex-grow-1" :for="'typ-'+typ.value">{{ typ.label }}</label>
                <span class="rounded-circle d-inline-block ms-2" :style="{ width: '8px', height: '8px', backgroundColor: typ.color }"></span>
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
              <div v-for="cat in availableCategories" :key="cat.Id" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'cat-'+cat.Id" :checked="filters.category.includes(cat.Id)" @change="toggleCategory(cat.Id)">
                <label class="form-check-label" :for="'cat-'+cat.Id">{{ cat.Name }}</label>
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
import { buildActivityPoiRawfilter } from '../../api/odhClient';

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
    sevenDays: '7 Days',
    month: 'Month',
    year: 'Year',
    selectStartDate: 'Select start date',
    selectEndDate: 'Select end date',
    showPast: 'Show past',
    selected: 'selected',
    selectDate: 'Select date',
    searchPlaceholderNew: 'Write something...',
    search: 'Search...',
    filters: 'Filters',
    resetFilters: 'Reset filters',
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
    sevenDays: '7 GG',
    month: 'Mese',
    year: 'Anno',
    selectStartDate: 'Seleziona data inizio',
    selectEndDate: 'Seleziona data fine',
    showPast: 'Mostra passati',
    selected: 'selezionati',
    selectDate: 'Seleziona data',
    searchPlaceholderNew: 'Scrivi qualcosa...',
    search: 'Cerca...',
    filters: 'Filtri',
    resetFilters: 'Reset filtri',
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
    sevenDays: '7 Tage',
    month: 'Monat',
    year: 'Jahr',
    selectStartDate: 'Startdatum auswählen',
    selectEndDate: 'Enddatum auswählen',
    showPast: 'Vergangene anzeigen',
    selected: 'ausgewählt',
    selectDate: 'Datum auswählen',
    searchPlaceholderNew: 'Schreibe etwas...',
    search: 'Suchen...',
    filters: 'Filter',
    resetFilters: 'Filter zurücksetzen',
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
      dateRange: {
        from: '',
        to: '',
      },
      activePreset: null, // 'today', '7days', 'month', 'year', or null
      filters: {
        typeMarkets: true,
        typeFairs: true,
        zone: zoneDefault,
        typology: [],
        category: categoryDefault,
        showPast: false, // Default OFF
      },
      dropdownOpen: {
        zone: false,
        typology: false,
        category: false,
      },
      mobileFilterVisible: false,
      minItems: 999999, // Load all items for map view
    };
  },
  computed: {
    filterVisible() {
      // Explicitly check if filterVisibility is true (default to true if undefined)
      return this.config.filterVisibility === true || this.config.filterVisibility === undefined;
    },
    lang() {
      return this.store.state.language || this.config.language || 'it';
    },
    activeFilterCount() {
      let count = 0;
      if (this.dateRange.from || this.dateRange.to) count++;
      if (this.filters.showPast) count++;
      count += this.filters.typology.length;
      count += this.filters.zone.length;
      count += this.filters.category.length;
      return count;
    },
    formattedDateFrom() {
      if (!this.dateRange.from) return '';
      // Format date as dd/mm/yyyy
      const date = new Date(this.dateRange.from);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    formattedDateTo() {
      if (!this.dateRange.to) return '';
      // Format date as dd/mm/yyyy
      const date = new Date(this.dateRange.to);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    dateRawfilter() {
      return buildActivityPoiRawfilter({
        showPast: this.filters.showPast,
        dateFrom: this.dateRange.from || undefined,
        dateTo: this.dateRange.to || undefined,
        categoryTagIds: this.filters.category && this.filters.category.length > 0 ? this.filters.category : undefined,
      });
    },
    markets() {
      return this.store.state.markets;
    },
    fairs() {
      return this.store.state.fairs;
    },
    normalizedMarkets() {
      return this.markets.itemsRaw.map((it) => normalizeOdhItem(it, { lang: this.lang, type: 'market' }));
    },
    normalizedFairs() {
      return this.fairs.itemsRaw.map((it) => normalizeOdhItem(it, { lang: this.lang, type: 'yearmarket' }));
    },
    allNormalized() {
      return [...this.normalizedMarkets, ...this.normalizedFairs];
    },
    filterMetadataMunicipalities() {
      return this.store.state.filterMetadata?.municipalities || [];
    },
    filterMetadataTags() {
      return this.store.state.filterMetadata?.tags || [];
    },
    availableZones() {
      return this.filterMetadataMunicipalities
        .map((m) => this.municipalityDisplayName(m))
        .filter(Boolean)
        .sort();
    },
    availableTypologies() {
      // Return markets and fairs as typology options with colors
      return [
        { label: this.t('markets'), value: this.t('markets'), color: '#f29650' },
        { label: this.t('fairs'), value: this.t('fairs'), color: '#1d4d96' },
      ];
    },
    availableCategories() {
      return this.filterMetadataTags;
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
      if (this.filters.category.length === 1) return this.categoryDisplayName(this.filters.category[0]);
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
        tags.push({ type: 'category', value: val, label: this.categoryDisplayName(val) });
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
    await this.store.ensureFilterMetadataLoaded();
    const mapPageSize = 50;
    await Promise.all([
      this.store.ensureLoaded('market', this.minItems, {
        rawfilter: this.dateRawfilter,
        pageSize: mapPageSize,
        search: this.query?.trim() || undefined,
      }),
      this.store.ensureLoaded('yearmarket', this.minItems, {
        rawfilter: this.dateRawfilter,
        pageSize: mapPageSize,
        search: this.query?.trim() || undefined,
      }),
    ]);
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    dateRawfilter() {
      this.store.resetList('market');
      this.store.resetList('yearmarket');
      const mapPageSize = 50;
      const search = this.query?.trim() || undefined;
      this.store.ensureLoaded('market', this.minItems, { rawfilter: this.dateRawfilter, pageSize: mapPageSize, search });
      this.store.ensureLoaded('yearmarket', this.minItems, { rawfilter: this.dateRawfilter, pageSize: mapPageSize, search });
    },
    query() {
      this.store.resetList('market');
      this.store.resetList('yearmarket');
      const mapPageSize = 50;
      const search = this.query?.trim() || undefined;
      this.store.ensureLoaded('market', this.minItems, { rawfilter: this.dateRawfilter, pageSize: mapPageSize, search });
      this.store.ensureLoaded('yearmarket', this.minItems, { rawfilter: this.dateRawfilter, pageSize: mapPageSize, search });
    },
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
    applyFilters(items) {
      let result = items;
      // Query and category are applied via API (search + rawfilter) for both market and yearmarket.

      // Zone / municipality filter (client-side)
      if (this.filters.zone.length > 0) {
        result = result.filter((item) => this.filters.zone.includes(item.municipality));
      }

      // Typology filter (markets vs fairs) – client-side
      if (this.filters.typology.length > 0) {
        const marketsLabel = this.t('markets');
        const fairsLabel = this.t('fairs');
        result = result.filter((item) => {
          if (this.filters.typology.includes(marketsLabel) && item.type === 'market') return true;
          if (this.filters.typology.includes(fairsLabel) && item.type === 'yearmarket') return true;
          return false;
        });
      }

      return result;
    },
    municipalityDisplayName(m) {
      const raw = m?.RawName ?? m?.Name;
      if (!raw) return '';
      if (typeof raw === 'string') return raw;
      const language = this.lang || 'it';
      let s = raw[language] || raw.en || raw.it || raw.de;
      if (!s) {
        const first = Object.values(raw).find((v) => typeof v === 'string' && String(v).trim());
        s = first ? String(first).trim() : '';
      }
      return s || String(m?.Name || m?.Id || '');
    },
    categoryDisplayName(id) {
      const tag = this.filterMetadataTags.find((t) => t.Id === id);
      return tag?.Name || id;
    },
    pruneZoneSelection() {
      if (!Array.isArray(this.filters.zone) || this.filters.zone.length === 0) return;
      const allowed = new Set(this.availableZones);
      const next = this.filters.zone.filter((z) => allowed.has(z));
      if (next.length !== this.filters.zone.length) {
        this.filters.zone = next;
      }
    },
    formatDateForInput(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    setPresetToday() {
      const today = new Date();
      const dateStr = this.formatDateForInput(today);
      this.dateRange.from = dateStr;
      this.dateRange.to = dateStr;
      this.activePreset = 'today';
    },
    setPreset7Days() {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 7);
      this.dateRange.from = this.formatDateForInput(today);
      this.dateRange.to = this.formatDateForInput(endDate);
      this.activePreset = '7days';
    },
    setPresetMonth() {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setMonth(endDate.getMonth() + 1);
      this.dateRange.from = this.formatDateForInput(today);
      this.dateRange.to = this.formatDateForInput(endDate);
      this.activePreset = 'month';
    },
    setPresetYear() {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setFullYear(endDate.getFullYear() + 1);
      this.dateRange.from = this.formatDateForInput(today);
      this.dateRange.to = this.formatDateForInput(endDate);
      this.activePreset = 'year';
    },
    onDateFromChange(event) {
      this.dateRange.from = event.target.value;
      this.activePreset = null; // Clear preset when manually changed
    },
    onDateToChange(event) {
      this.dateRange.to = event.target.value;
      this.activePreset = null; // Clear preset when manually changed
    },
    openDatePickerFrom() {
      if (this.$refs.dateInputFrom) {
        this.$refs.dateInputFrom.showPicker?.();
        if (!this.$refs.dateInputFrom.showPicker) {
          this.$refs.dateInputFrom.focus();
          this.$refs.dateInputFrom.click();
        }
      }
    },
    openDatePickerTo() {
      if (this.$refs.dateInputTo) {
        this.$refs.dateInputTo.showPicker?.();
        if (!this.$refs.dateInputTo.showPicker) {
          this.$refs.dateInputTo.focus();
          this.$refs.dateInputTo.click();
        }
      }
    },
    handleDateTouchMobileFrom() {
      const dateInput = this.$refs.dateInputMobileFrom;
      if (dateInput) {
        dateInput.focus();
        if (dateInput.showPicker) {
          try {
            dateInput.showPicker();
          } catch (e) {
            dateInput.click();
          }
        } else {
          dateInput.click();
        }
      }
    },
    handleDateTouchMobileTo() {
      const dateInput = this.$refs.dateInputMobileTo;
      if (dateInput) {
        dateInput.focus();
        if (dateInput.showPicker) {
          try {
            dateInput.showPicker();
          } catch (e) {
            dateInput.click();
          }
        } else {
          dateInput.click();
        }
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
    openDetails({ type, id }) {
      if (type === 'market') this.store.go('marketDetail', { id });
      else this.store.go('fairsDetail', { id });
    },
    clearMenuFilters() {
      // Reset only filters inside the menu (typology, zone, category)
      // Reset to default values from config
      const zoneDefault = this.config.filterZoneDefaultValue ? 
        (Array.isArray(this.config.filterZoneDefaultValue) ? this.config.filterZoneDefaultValue : [this.config.filterZoneDefaultValue]) 
        : [];
      const categoryDefault = this.config.filterCategoryDefaultValue ? 
        (Array.isArray(this.config.filterCategoryDefaultValue) ? this.config.filterCategoryDefaultValue : [this.config.filterCategoryDefaultValue]) 
        : [];
      
      this.filters.typology = [];
      this.filters.zone = zoneDefault;
      this.filters.category = categoryDefault;
    },
    clearAllFilters() {
      // Reset all filters including date range, showPast, and query
      // Reset to default values from config
      const zoneDefault = this.config.filterZoneDefaultValue ? 
        (Array.isArray(this.config.filterZoneDefaultValue) ? this.config.filterZoneDefaultValue : [this.config.filterZoneDefaultValue]) 
        : [];
      const categoryDefault = this.config.filterCategoryDefaultValue ? 
        (Array.isArray(this.config.filterCategoryDefaultValue) ? this.config.filterCategoryDefaultValue : [this.config.filterCategoryDefaultValue]) 
        : [];
      
      this.dateRange.from = '';
      this.dateRange.to = '';
      this.activePreset = null;
      this.query = '';
      this.filters.typology = [];
      this.filters.zone = zoneDefault;
      this.filters.category = categoryDefault;
      this.filters.showPast = false;
    },
  },
};
</script>
