<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div>
    <!-- Mobile: All controls -->
    <div class="d-md-none">
      <!-- Title + Filter Badge -->
      <div class="row align-items-center mb-3">
        <div class="col">
          <h2 class="wcmc-page-title wcmc-page-title-large mb-0">{{ t('fairs') }}</h2>
        </div>
        <div class="col-auto">
          <button
            type="button"
            class="btn bg-transparent rounded position-relative d-flex align-items-center justify-content-center wcmc-mobile-filter-button-theme"
            @click="mobileFilterVisible = true"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path fill-rule="evenodd" d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z" clip-rule="evenodd"/>
            </svg>
            <span v-if="activeFilterCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill wcmc-filter-badge-theme">{{ activeFilterCount }}</span>
          </button>
        </div>
      </div>
      
      <!-- Preset buttons row -->
      <div class="row g-2 mb-3">
        <div class="col-3">
          <button
            type="button"
            class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base w-100"
            :class="{ 'active': activePreset === 'today' }"
            @click="setPresetToday"
          >
            {{ t('today') }}
          </button>
        </div>
        <div class="col-3">
          <button
            type="button"
            class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base w-100"
            :class="{ 'active': activePreset === '7days' }"
            @click="setPreset7Days"
          >
            {{ t('sevenDays') }}
          </button>
        </div>
        <div class="col-3">
          <button
            type="button"
            class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base w-100"
            :class="{ 'active': activePreset === 'month' }"
            @click="setPresetMonth"
          >
            {{ t('month') }}
          </button>
        </div>
        <div class="col-3">
          <button
            type="button"
            class="btn wcmc-quick-filter wcmc-quick-filter--green wcmc-quick-filter-base w-100"
            :class="{ 'active': activePreset === 'year' }"
            @click="setPresetYear"
          >
            {{ t('year') }}
          </button>
        </div>
      </div>
      
      <!-- Date range inputs row -->
      <div class="row g-2 mb-3">
        <div class="col-6">
          <div class="wcmc-date-selector-wrapper position-relative h-100" @touchstart.prevent="handleDateTouchMobileFrom">
            <input
              id="wcmc-date-selector-from-mobile-fairs"
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
        </div>
        <div class="col-6">
          <div class="wcmc-date-selector-wrapper position-relative h-100" @touchstart.prevent="handleDateTouchMobileTo">
            <input
              id="wcmc-date-selector-to-mobile-fairs"
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
      </div>
      
      <!-- Show past toggle + Reset button row -->
      <div class="row g-2 mb-3 align-items-center">
        <div class="col">
          <label class="form-check form-switch mb-0">
            <input
              class="form-check-input"
              type="checkbox"
              role="switch"
              :checked="filters.showPast"
              @change="filters.showPast = $event.target.checked"
            />
            <span class="form-check-label small">{{ t('showPast') }}</span>
          </label>
        </div>
        <div class="col">
          <button
            type="button"
            class="btn btn-primary w-100"
            @click="clearAllFilters"
          >
            {{ t('resetFilters') }}
          </button>
        </div>
      </div>
      
      <!-- Search bar row -->
      <div class="row g-2 mb-3">
        <div class="col-12">
          <div class="wcmc-search-wrapper">
            <div class="wcmc-search-box position-relative d-flex align-items-center">
              <input
                id="wcmc-search-input-mobile"
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
    </div>

    <!-- Desktop: Title + Controls Row -->
    <div class="d-none d-md-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between mb-3">
      <h2 class="wcmc-page-title mb-0">{{ t('fairs') }}</h2>
      
      <div class="d-flex align-items-center gap-3 ms-md-auto flex-wrap">
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
            id="wcmc-date-selector-from-fairs"
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
            id="wcmc-date-selector-to-fairs"
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
                id="wcmc-search-input"
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
        <!-- Weekday Filter -->
        <div class="wcmc-filter-group wcmc-filter-group-base position-relative d-flex flex-column gap-1 flex-fill min-w-0" ref="weekdayFilter">
          <label class="wcmc-filter-label fw-medium text-uppercase">{{ t('weekday') }}</label>
          <div 
            class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between" 
            @click.stop="toggleDropdown('weekday')"
          >
            <span class="flex-grow-1 text-start text-truncate me-2">{{ weekdayDisplayText }}</span>
            <svg class="wcmc-filter-chevron flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: dropdownOpen.weekday ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
              <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-show="dropdownOpen.weekday" class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleWeekday('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.weekday.length === 0" readonly>
              <span class="small">{{ t('allDays') }}</span>
            </div>
            <div v-for="dayOption in filteredWeekdayOptions" :key="dayOption.idx" :class="['wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2', validWeekdays.has(dayOption.idx) ? 'wcmc-cursor-pointer' : 'wcmc-dropdown-item--disabled']" @click="validWeekdays.has(dayOption.idx) && toggleWeekday(dayOption.idx)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.weekday.includes(dayOption.idx)" :disabled="!validWeekdays.has(dayOption.idx)" readonly>
              <span class="small">{{ dayOption.label }}</span>
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
            <!-- Search input for zones -->
            <div class="mb-2">
              <input
                type="text"
                class="form-control form-control-sm"
                :placeholder="t('search')"
                :value="zoneSearchQuery"
                @input="zoneSearchQuery = $event.target.value"
                @click.stop
              />
            </div>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleZone('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.zone.length === 0" readonly>
              <span class="small">{{ t('allLocations') }}</span>
            </div>
            <div v-for="zone in filteredZonesForSearch" :key="zone" :class="['wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2', validZones.has(zone) ? 'wcmc-cursor-pointer' : 'wcmc-dropdown-item--disabled']" @click="validZones.has(zone) && toggleZone(zone)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.zone.includes(zone)" :disabled="!validZones.has(zone)" readonly>
              <span class="small">{{ zone }}</span>
            </div>
            <div v-if="filteredZonesForSearch.length === 0 && zoneSearchQuery.trim()" class="text-muted text-center p-2 small">
              {{ t('noResults') }}
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
            <!-- Search input for categories -->
            <div class="mb-2">
              <input
                type="text"
                class="form-control form-control-sm"
                :placeholder="t('search')"
                :value="categorySearchQuery"
                @input="categorySearchQuery = $event.target.value"
                @click.stop
              />
            </div>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleCategory('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.category.length === 0" readonly>
              <span class="small">{{ t('allCategories') }}</span>
            </div>
            <div v-for="cat in filteredCategoriesForSearch" :key="cat" :class="['wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2', validCategories.has(cat) ? 'wcmc-cursor-pointer' : 'wcmc-dropdown-item--disabled']" @click="validCategories.has(cat) && toggleCategory(cat)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.category.includes(cat)" :disabled="!validCategories.has(cat)" readonly>
              <span class="small">{{ cat }}</span>
            </div>
            <div v-if="filteredCategoriesForSearch.length === 0 && categorySearchQuery.trim()" class="text-muted text-center p-2 small">
              {{ t('noResults') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Active filter tags (Desktop) -->
      <div v-if="hasActiveFilters" class="wcmc-filter-tags d-none d-md-flex flex-wrap gap-2 align-items-center justify-content-between mt-4 pt-4 border-top">
        <div class="d-flex flex-wrap gap-2">
          <span v-if="dateRange.from || dateRange.to" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="dateRange.from = ''; dateRange.to = ''; activePreset = null">
            {{ formattedDateFrom }} - {{ formattedDateTo }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
          <span v-if="filters.showPast" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="filters.showPast = false">
            {{ t('showPast') }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
          <span v-for="(dayIdx, i) in filters.weekday" :key="'wd'+i" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="toggleWeekday(dayIdx)">
            {{ weekdayOptions[dayIdx] }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
          <span v-for="(z, i) in filters.zone" :key="'z'+i" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="toggleZone(z)">
            {{ z }}
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
          </span>
          <span v-for="(c, i) in filters.category" :key="'c'+i" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="toggleCategory(c)">
            {{ c }}
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
          <!-- Date Filter -->


          <!-- Weekday Filter -->
          <div class="wcmc-mobile-filter-section mb-4">
            <h4 class="wcmc-mobile-filter-section-title text-uppercase mb-3">{{ t('weekday') }}</h4>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="weekdayFilter" id="weekdayAll" :checked="filters.weekday.length === 0" @change="filters.weekday = []">
              <label class="form-check-label" for="weekdayAll">{{ t('seeAll') }}</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="weekdayFilter" id="weekdaySpecific" :checked="filters.weekday.length > 0">
              <label class="form-check-label" for="weekdaySpecific">{{ t('specificDay') }}</label>
            </div>
            <div v-if="filters.weekday.length > 0 || true" class="ms-4 mt-2">
              <div v-for="dayOption in filteredWeekdayOptions" :key="dayOption.idx" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'weekday-'+dayOption.idx" :checked="filters.weekday.includes(dayOption.idx)" :disabled="!validWeekdays.has(dayOption.idx)" @change="validWeekdays.has(dayOption.idx) && toggleWeekday(dayOption.idx)">
                <label :class="['form-check-label', !validWeekdays.has(dayOption.idx) && 'text-muted']" :for="'weekday-'+dayOption.idx">{{ dayOption.label }}</label>
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
              <!-- Search input for zones -->
              <div class="mb-3">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :placeholder="t('search')"
                  :value="zoneSearchQuery"
                  @input="zoneSearchQuery = $event.target.value"
                />
              </div>
              <div v-for="zone in filteredZonesForSearch" :key="zone" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'zone-'+zone" :checked="filters.zone.includes(zone)" :disabled="!validZones.has(zone)" @change="validZones.has(zone) && toggleZone(zone)">
                <label :class="['form-check-label', !validZones.has(zone) && 'text-muted']" :for="'zone-'+zone">{{ zone }}</label>
              </div>
              <div v-if="filteredZonesForSearch.length === 0 && zoneSearchQuery.trim()" class="text-muted text-center p-2 small">
                {{ t('noResults') || 'No results found' }}
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
              <!-- Search input for categories -->
              <div class="mb-3">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :placeholder="t('search')"
                  :value="categorySearchQuery"
                  @input="categorySearchQuery = $event.target.value"
                />
              </div>
              <div v-for="cat in filteredCategoriesForSearch" :key="cat" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'cat-'+cat" :checked="filters.category.includes(cat)" :disabled="!validCategories.has(cat)" @change="validCategories.has(cat) && toggleCategory(cat)">
                <label :class="['form-check-label', !validCategories.has(cat) && 'text-muted']" :for="'cat-'+cat">{{ cat }}</label>
              </div>
              <div v-if="filteredCategoriesForSearch.length === 0 && categorySearchQuery.trim()" class="text-muted text-center p-2 small">
                {{ t('noResults') || 'No results found' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ErrorAlert v-if="ds.error" :message="ds.error" />

    <SkeletonList v-if="ds.loading && normalized.length === 0" :count="8" />

    <EmptyState v-else-if="!ds.loading && normalized.length > 0 && filtered.length === 0" :lang="config.language" />

    <CardGrid v-else-if="filtered.length > 0" :items="visible">
      <template #card="{ item }">
        <ItemCard :item="item" :lang="config.language" @details="openDetails" />
      </template>
    </CardGrid>

    <div class="d-flex justify-content-center justify-content-md-end pt-4">
      <Pagination v-model="page" :has-prev="hasPrev" :has-next="hasNext" :next-page-number="page + 1" :total-pages="totalPages" :loading="ds.loading" :has-results="filtered.length > 0" />
    </div>
  </div>
</template>

<script>
import CardGrid from '../components/CardGrid.vue';
import ItemCard from '../components/ItemCard.vue';
import SkeletonList from '../components/SkeletonList.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import Pagination from '../components/Pagination.vue';


import { normalizeOdhItem } from '../../utils/normalize';

const TRANSLATIONS = {
  en: {
    fairs: 'Fairs',
    searchPlaceholder: 'What are you looking for?',
    searchPlaceholderNew: 'Write something...',
    search: 'Search...',
    selectDate: 'Select date',
    date: 'DATE',
    weekday: 'DAY OF THE WEEK',
    zone: 'ZONE',
    category: 'CATEGORY',
    seeAll: 'See all',
    today: 'Today',
    sevenDays: '7 Days',
    month: 'Month',
    year: 'Year',
    selectStartDate: 'Select start date',
    selectEndDate: 'Select end date',
    showPast: 'Show past',
    thisWeek: 'This week',
    thisMonth: 'This month',
    allDays: 'All days',
    allLocations: 'All locations',
    allCategories: 'All categories',
    selected: 'selected',
    filters: 'Filters',
    resetFilters: 'Reset filters',
    setDateRange: 'Set date range',
    from: 'From',
    to: 'To',
    specificDay: 'Specific day',
    specificLocations: 'Specific locations',
    specificCategories: 'Specific categories',
    noResults: 'There are no results for the search',
  },
  it: {
    fairs: 'Fiere',
    searchPlaceholder: 'Cosa stai cercando?',
    searchPlaceholderNew: 'Scrivi qualcosa...',
    search: 'Cerca...',
    selectDate: 'Seleziona data',
    date: 'DATA',
    weekday: 'GIORNO DELLA SETTIMANA',
    zone: 'ZONA',
    category: 'CATEGORIA',
    seeAll: 'Vedi tutti',
    today: 'Oggi',
    sevenDays: '7 GG',
    month: 'Mese',
    year: 'Anno',
    selectStartDate: 'Seleziona data inizio',
    selectEndDate: 'Seleziona data fine',
    showPast: 'Mostra passati',
    thisWeek: 'Questa settimana',
    thisMonth: 'Questo mese',
    allDays: 'Tutti i giorni',
    allLocations: 'Tutte le località',
    allCategories: 'Tutte le categorie',
    selected: 'selezionati',
    filters: 'Filtri',
    resetFilters: 'Reset filtri',
    setDateRange: 'Imposta intervallo date',
    from: 'Da',
    to: 'A',
    specificDay: 'Giorno specifico',
    specificLocations: 'Località specifiche',
    specificCategories: 'Specifiche categorie',
    noResults: 'Non ci sono risultati per la ricerca',
  },
  de: {
    fairs: 'Messen',
    searchPlaceholder: 'Was suchen Sie?',
    searchPlaceholderNew: 'Schreiben Sie etwas...',
    search: 'Suchen...',
    selectDate: 'Datum auswählen',
    date: 'DATUM',
    weekday: 'WOCHENTAG',
    zone: 'ZONE',
    category: 'KATEGORIE',
    seeAll: 'Alle anzeigen',
    today: 'Heute',
    sevenDays: '7 Tage',
    month: 'Monat',
    year: 'Jahr',
    selectStartDate: 'Startdatum auswählen',
    selectEndDate: 'Enddatum auswählen',
    showPast: 'Vergangene anzeigen',
    thisWeek: 'Diese Woche',
    thisMonth: 'Diesen Monat',
    allDays: 'Alle Tage',
    allLocations: 'Alle Orte',
    allCategories: 'Alle Kategorien',
    selected: 'ausgewählt',
    filters: 'Filter',
    resetFilters: 'Filter zurücksetzen',
    setDateRange: 'Datumsbereich festlegen',
    from: 'Von',
    to: 'Bis',
    specificDay: 'Bestimmter Tag',
    specificLocations: 'Bestimmte Orte',
    specificCategories: 'Bestimmte Kategorien',
    noResults: 'Es gibt keine Ergebnisse für die Suche',
  },
};

const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
};

export default {
  name: 'FairsList',
  components: { CardGrid, ItemCard, SkeletonList, EmptyState, ErrorAlert, Pagination },
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
        weekday: [],
        zone: zoneDefault,
        category: categoryDefault,
        showPast: false, // Default OFF
      },
      dropdownOpen: {
        weekday: false,
        zone: false,
        category: false,
      },
      mobileFilterVisible: false,
      zoneSearchQuery: '',
      categorySearchQuery: '',
    };
  },
  computed: {
    filterVisible() {
      return this.config.filterVisibility !== false; // Default to true if not set
    },
    lang() {
      return this.config.language || 'it';
    },
    activeFilterCount() {
      let count = 0;
      if (this.dateRange.from || this.dateRange.to) count++;
      if (this.filters.showPast) count++;
      count += this.filters.weekday.length;
      count += this.filters.zone.length;
      count += this.filters.category.length;
      return count;
    },
    ds() {
      return this.store.state.fairs;
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
    pageSize() {
      return this.config.pageSize || 8;
    },
    page: {
      get() {
        return this.store.state.ui.fairs.page || 1;
      },
      set(v) {
        this.store.setListPage('fairs', v);
      },
    },
    weekdayOptions() {
      return WEEKDAYS[this.lang] || WEEKDAYS.it;
    },
    filteredWeekdayOptions() {
      // Only show weekdays that have actual data when no filters are active
      const options = this.weekdayOptions;
      if (this.filters.weekday.length === 0 && 
          this.filters.zone.length === 0 && 
          this.filters.category.length === 0 && 
          !this.dateRange.from && !this.dateRange.to && 
          !this.query.trim()) {
        // Return array of { label, index } for weekdays that have data
        return options
          .map((label, idx) => ({ label, idx }))
          .filter(item => this.validWeekdays.has(item.idx));
      }
      // Return all options with their indices when filters are active
      return options.map((label, idx) => ({ label, idx }));
    },
    weekdayDisplayText() {
      if (this.filters.weekday.length === 0) return this.t('allDays');
      if (this.filters.weekday.length === 1) {
        return this.weekdayOptions[this.filters.weekday[0]] || this.t('allDays');
      }
      return `${this.filters.weekday.length} ${this.t('selected')}`;
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
    normalized() {
      if (!this.ds.itemsRaw || !Array.isArray(this.ds.itemsRaw)) {
        return [];
      }
      return this.ds.itemsRaw.map((it) =>
        normalizeOdhItem(it, { lang: this.config.language, type: 'yearmarket' })
      );
    },
    baseForZone() {
      return this.applyFilters(this.normalized, { ignoreZone: true });
    },
    availableZones() {
      // Only show zones that have actual data (use validZones when no filters are active)
      if (this.filters.zone.length === 0 && 
          this.filters.weekday.length === 0 && 
          this.filters.category.length === 0 && 
          !this.dateRange.from && !this.dateRange.to && 
          !this.query.trim()) {
        return Array.from(this.validZones).sort();
      }
      const zones = new Set();
      this.baseForZone.forEach((item) => {
        if (item.municipality) zones.add(item.municipality);
      });
      return Array.from(zones).sort();
    },
    filteredZonesForSearch() {
      if (!this.zoneSearchQuery.trim()) {
        return this.availableZones;
      }
      const query = this.zoneSearchQuery.trim().toLowerCase();
      return this.availableZones.filter(zone => 
        zone.toLowerCase().includes(query)
      );
    },
    filteredCategoriesForSearch() {
      if (!this.categorySearchQuery.trim()) {
        return this.availableCategories;
      }
      const query = this.categorySearchQuery.trim().toLowerCase();
      return this.availableCategories.filter(cat => 
        cat.toLowerCase().includes(query)
      );
    },
    availableCategories() {
      // Only show categories that have actual data (use validCategories when no filters are active)
      if (this.filters.category.length === 0 && 
          this.filters.zone.length === 0 && 
          this.filters.weekday.length === 0 && 
          !this.dateRange.from && !this.dateRange.to && 
          !this.query.trim()) {
        return Array.from(this.validCategories).sort();
      }
      const cats = new Set();
      this.normalized.forEach((item) => {
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
    // Computed properties for valid filter options based on current selections
    validWeekdays() {
      // Get items that match current filters (excluding weekday filter)
      const baseItems = this.applyFilters(this.normalized, { ignoreWeekday: true });
      const validDays = new Set();
      
      baseItems.forEach((item) => {
        if (!item.nextDate) return;
        try {
          const itemDate = new Date(item.nextDate);
          validDays.add(itemDate.getDay());
        } catch {
          // Invalid date, skip
        }
      });
      
      return validDays;
    },
    validZones() {
      // Get items that match current filters (excluding zone filter)
      const baseItems = this.applyFilters(this.normalized, { ignoreZone: true });
      const validZones = new Set();
      
      baseItems.forEach((item) => {
        if (item.municipality) validZones.add(item.municipality);
      });
      
      return validZones;
    },
    validCategories() {
      // Get items that match current filters (excluding category filter)
      const baseItems = this.applyFilters(this.normalized, { ignoreCategory: true });
      const validCats = new Set();
      
      baseItems.forEach((item) => {
        const raw = item.raw;
        const tags = raw?.ODHTags || raw?.Tags || [];
        if (Array.isArray(tags)) {
          tags.forEach((tag) => {
            const name = tag?.Id || tag?.Name || tag;
            if (typeof name === 'string' && name) validCats.add(name);
          });
        }
      });
      
      return validCats;
    },
    hasActiveFilters() {
      return (this.dateRange.from || this.dateRange.to) || this.filters.showPast || this.filters.weekday.length > 0 || this.filters.zone.length > 0 || this.filters.category.length > 0;
    },
    filtered() {
      return this.applyFilters(this.normalized);
    },
    startIdx() {
      return (this.page - 1) * this.pageSize;
    },
    endIdx() {
      return this.page * this.pageSize;
    },
    visible() {
      return this.filtered.slice(this.startIdx, this.endIdx);
    },
    hasPrev() {
      return this.page > 1;
    },
    hasNext() {
      if (this.filtered.length === 0) return false;
      return this.endIdx < this.filtered.length;
    },
    totalPages() {
      // If filters are active, always use filtered results count
      if (this.hasActiveFilters || (this.query && this.query.trim().length > 0)) {
        // Calculate based on filtered results
        if (this.filtered.length === 0) return 1;
        return Math.ceil(this.filtered.length / this.pageSize);
      }
      
      // No filters active - use TotalPages from API response if available
      if (this.ds.paginationMeta && this.ds.paginationMeta.TotalPages !== null && this.ds.paginationMeta.TotalPages > 0) {
        return this.ds.paginationMeta.TotalPages;
      }
      
      // Fallback to computed value based on filtered results
      if (this.filtered.length === 0) return 1;
      return Math.ceil(this.filtered.length / this.pageSize);
    },
    breadcrumbItems() {
      return [
        {
          label: this.t('fairs'),
        },
      ];
    },
  },
  watch: {
    query() {
      this.page = 1;
    },
    filters: {
      deep: true,
      handler() {
        this.page = 1;
      },
    },
    async page(next, prev) {
      const n = Number(next);
      const p = Number(prev);
      if (!Number.isFinite(n) || n <= 0) return;
      // Only load more data when going forward, not backwards
      // Backwards navigation works with already loaded data
      if (Number.isFinite(p) && n > p) {
        await this.store.ensureLoaded('yearmarket', n * this.pageSize);
      }
    },
    availableZones: {
      immediate: true,
      handler() {
        // Avoid clearing configured defaults before data is actually loaded
        if (!this.ds?.done && (!this.ds?.itemsRaw || this.ds.itemsRaw.length === 0)) return;
        this.pruneZoneSelection();
      },
    },
    validWeekdays: {
      handler() {
        // Remove invalid weekday selections when valid set changes
        if (this.filters.weekday.length > 0) {
          const valid = this.filters.weekday.filter(day => this.validWeekdays.has(day));
          if (valid.length !== this.filters.weekday.length) {
            this.$nextTick(() => {
              this.filters.weekday = valid;
            });
          }
        }
      },
      immediate: false,
    },
    validZones: {
      handler() {
        // Remove invalid zone selections when valid set changes
        if (this.filters.zone.length > 0) {
          const valid = this.filters.zone.filter(zone => this.validZones.has(zone));
          if (valid.length !== this.filters.zone.length) {
            this.$nextTick(() => {
              this.filters.zone = valid;
            });
          }
        }
      },
      immediate: false,
    },
    validCategories: {
      handler() {
        // Remove invalid category selections when valid set changes
        if (this.filters.category.length > 0) {
          const valid = this.filters.category.filter(cat => this.validCategories.has(cat));
          if (valid.length !== this.filters.category.length) {
            this.$nextTick(() => {
              this.filters.category = valid;
            });
          }
        }
      },
      immediate: false,
    },
  },
  async mounted() {
    // Load all fairs - use a very high number to ensure all pages are loaded
    // The ensureLoaded function will stop when nextPageUrl is null (all pages fetched)
    await this.store.ensureLoaded('yearmarket', 999999);
    // Add click outside listener for dropdowns
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    applyFilters(items, { ignoreZone = false, ignoreWeekday = false, ignoreCategory = false } = {}) {
      let result = items;

      // Text search
      const q = String(this.query || '').trim().toLowerCase();
      if (q) {
        result = result.filter((n) => String(n.title || '').toLowerCase().includes(q));
      }

      // Show past filter
      if (!this.filters.showPast) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        result = result.filter((item) => {
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate >= today;
        });
      }

      // Date range filter
      if (this.dateRange.from || this.dateRange.to) {
        const fromDate = this.dateRange.from ? new Date(this.dateRange.from) : null;
        const toDate = this.dateRange.to ? new Date(this.dateRange.to) : null;
        
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) {
          toDate.setHours(23, 59, 59, 999);
        }
        
        result = result.filter((item) => {
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          itemDate.setHours(0, 0, 0, 0);
          
          if (fromDate && toDate) {
            return itemDate >= fromDate && itemDate <= toDate;
          } else if (fromDate) {
            return itemDate >= fromDate;
          } else if (toDate) {
            return itemDate <= toDate;
          }
          
          return true;
        });
      }

      // Weekday filter
      if (!ignoreWeekday && this.filters.weekday.length > 0) {
        // Multi-select using OR logic (items that match ANY selected day)
        result = result.filter((item) => {
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          const dayIdx = itemDate.getDay();
          // We store indices in this.filters.weekday
          return this.filters.weekday.includes(dayIdx);
        });
      }

      // Zone filter
      if (!ignoreZone && this.filters.zone.length > 0) {
        result = result.filter((item) => this.filters.zone.includes(item.municipality));
      }

      // Category filter
      if (!ignoreCategory && this.filters.category.length > 0) {
        result = result.filter((item) => {
          const raw = item.raw;
          const tags = raw?.ODHTags || raw?.Tags || [];
          if (!Array.isArray(tags)) return false;
          return tags.some((tag) => {
            const name = tag?.Id || tag?.Name || tag;
            return this.filters.category.includes(name);
          });
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
    t(key) {
      const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.it;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    openDetails(item) {
      this.store.go('fairsDetail', { id: item.id });
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
      // Clear search queries when closing dropdowns
      if (name !== 'zone' && this.dropdownOpen.zone === false) {
        this.zoneSearchQuery = '';
      }
      if (name !== 'category' && this.dropdownOpen.category === false) {
        this.categorySearchQuery = '';
      }
    },
    toggleWeekday(value) {
      if (value === 'all') {
        this.filters.weekday = [];
        return;
      }
      const idx = this.filters.weekday.indexOf(value);
      if (idx >= 0) {
        this.filters.weekday.splice(idx, 1);
      } else {
        this.filters.weekday.push(value);
      }
      // Do not close dropdown
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
    clearMenuFilters() {
      // Reset only filters inside the menu (weekday, zone, category)
      this.filters.weekday = [];
      this.filters.zone = [];
      this.filters.category = [];
    },
    clearAllFilters() {
      // Reset all filters including date range, showPast, and query
      this.dateRange.from = '';
      this.dateRange.to = '';
      this.activePreset = null;
      this.query = '';
      this.filters.weekday = [];
      this.filters.zone = [];
      this.filters.category = [];
      this.filters.showPast = false;
    },
    handleClickOutside(event) {
      // Check if click is inside any filter ref
      const isInside = this.$refs.weekdayFilter?.contains(event.target) ||
                       this.$refs.zoneFilter?.contains(event.target) ||
                       this.$refs.categoryFilter?.contains(event.target);
      
      if (!isInside) {
        this.dropdownOpen.weekday = false;
        this.dropdownOpen.zone = false;
        this.dropdownOpen.category = false;
      }
    },
  },
};
</script>


