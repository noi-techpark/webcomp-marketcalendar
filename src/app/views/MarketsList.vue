<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div>
    <!-- Breadcrumb -->


    <!-- Mobile: All controls -->
    <div class="d-md-none">
      <!-- Title + Filter Badge -->
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="wcmc-page-title wcmc-page-title-large mb-0">{{ t('markets') }}</h2>
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
            id="wcmc-date-selector-from-mobile"
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
            id="wcmc-date-selector-to-mobile"
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

    <!-- Desktop: Title + Controls Row -->
    <div class="d-none d-md-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between mb-3">
      <h2 class="wcmc-page-title mb-0">{{ t('markets') }}</h2>
      
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
            id="wcmc-date-selector-from-markets"
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
            id="wcmc-date-selector-to-markets"
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

        <!-- Frequency Filter -->
        <div class="wcmc-filter-group wcmc-filter-group-base position-relative d-flex flex-column gap-1 flex-fill min-w-0" ref="frequencyFilter">
          <label class="wcmc-filter-label fw-medium text-uppercase">{{ t('frequency') }}</label>
          <div 
            class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between" 
            @click.stop="toggleDropdown('frequency')"
          >
            <span class="flex-grow-1 text-start text-truncate me-2">{{ frequencyDisplayText }}</span>
            <svg class="wcmc-filter-chevron flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: dropdownOpen.frequency ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
              <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-show="dropdownOpen.frequency" class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleFrequency('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.frequency.length === 0" readonly>
              <span class="small">{{ t('allFrequencies') }}</span>
            </div>
            <div v-for="freq in availableFrequencies" :key="freq" :class="['wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2', validFrequencies.has(freq) ? 'wcmc-cursor-pointer' : 'wcmc-dropdown-item--disabled']" @click="validFrequencies.has(freq) && toggleFrequency(freq)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.frequency.includes(freq)" :disabled="!validFrequencies.has(freq)" readonly>
              <span class="small">{{ freq }}</span>
            </div>
          </div>
        </div>

        <!-- Period Filter -->
        <div class="wcmc-filter-group wcmc-filter-group-base position-relative d-flex flex-column gap-1 flex-fill min-w-0" ref="periodFilter">
          <label class="wcmc-filter-label fw-medium text-uppercase">{{ t('period') }}</label>
          <div 
            class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between" 
            @click.stop="toggleDropdown('period')"
          >
            <span class="flex-grow-1 text-start text-truncate me-2">{{ periodDisplayText }}</span>
            <svg class="wcmc-filter-chevron flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: dropdownOpen.period ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
              <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          
          <div v-show="dropdownOpen.period" class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
            <div class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="togglePeriod('all')">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.period.length === 0" readonly>
              <span class="small">{{ t('allPeriods') }}</span>
            </div>
            <div v-for="monthOption in filteredMonthOptions" :key="monthOption.idx" :class="['wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2', validPeriods.has(monthOption.idx) ? 'wcmc-cursor-pointer' : 'wcmc-dropdown-item--disabled']" @click="validPeriods.has(monthOption.idx) && togglePeriod(monthOption.idx)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.period.includes(monthOption.idx)" :disabled="!validPeriods.has(monthOption.idx)" readonly>
              <span class="small">{{ monthOption.label }}</span>
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
          <span v-for="tag in activeFilterTags" :key="tag.type + tag.value" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="tag.type === 'weekday' ? toggleWeekday(tag.value) : tag.type === 'zone' ? toggleZone(tag.value) : tag.type === 'frequency' ? toggleFrequency(tag.value) : tag.type === 'period' ? togglePeriod(tag.value) : toggleCategory(tag.value)">
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

    <ErrorAlert v-if="ds.error" :message="ds.error" />

    <MarketsListSkeleton v-if="ds.loading && normalized.length === 0" :cards-per-column="8" />

    <EmptyState v-else-if="!ds.loading && normalized.length > 0 && filtered.length === 0 && filters.weekday.length === 0" :lang="config.language" />

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

          <!-- Frequency Filter -->
          <div class="wcmc-mobile-filter-section mb-4">
            <h4 class="wcmc-mobile-filter-section-title text-uppercase mb-3">{{ t('frequency') }}</h4>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="frequencyFilter" id="frequencyAll" :checked="filters.frequency.length === 0" @change="filters.frequency = []">
              <label class="form-check-label" for="frequencyAll">{{ t('seeAll') }}</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="frequencyFilter" id="frequencySpecific" :checked="filters.frequency.length > 0">
              <label class="form-check-label" for="frequencySpecific">{{ t('specificFrequencies') }}</label>
            </div>
            <div v-if="filters.frequency.length > 0 || true" class="ms-4 mt-2">
              <div v-for="freq in availableFrequencies" :key="freq" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'freq-'+freq" :checked="filters.frequency.includes(freq)" :disabled="!validFrequencies.has(freq)" @change="validFrequencies.has(freq) && toggleFrequency(freq)">
                <label :class="['form-check-label', !validFrequencies.has(freq) && 'text-muted']" :for="'freq-'+freq">{{ freq }}</label>
              </div>
            </div>
          </div>

          <!-- Period Filter -->
          <div class="wcmc-mobile-filter-section mb-4">
            <h4 class="wcmc-mobile-filter-section-title text-uppercase mb-3">{{ t('period') }}</h4>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="periodFilter" id="periodAll" :checked="filters.period.length === 0" @change="filters.period = []">
              <label class="form-check-label" for="periodAll">{{ t('seeAll') }}</label>
            </div>
            <div class="form-check mb-2">
              <input class="form-check-input" type="radio" name="periodFilter" id="periodSpecific" :checked="filters.period.length > 0">
              <label class="form-check-label" for="periodSpecific">{{ t('specificPeriods') }}</label>
            </div>
            <div v-if="filters.period.length > 0 || true" class="ms-4 mt-2">
              <div v-for="monthOption in filteredMonthOptions" :key="monthOption.idx" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'period-'+monthOption.idx" :checked="filters.period.includes(monthOption.idx)" :disabled="!validPeriods.has(monthOption.idx)" @change="validPeriods.has(monthOption.idx) && togglePeriod(monthOption.idx)">
                <label :class="['form-check-label', !validPeriods.has(monthOption.idx) && 'text-muted']" :for="'period-'+monthOption.idx">{{ monthOption.label }}</label>
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

    <!-- Weekly view by day of week -->
    <div v-else class="wcmc-market-week-view row g-4">
      <div v-for="(dayIdx, dayName) in weekDays" :key="dayIdx" class="col-12 d-md-none d-flex px-1 flex-column">
        <!-- Mobile: Collapsible day section -->
        <div class="wcmc-market-day-column p-2 rounded">
          <div 
            class="wcmc-market-day-header d-flex align-items-center justify-content-between gap-2 mb-0" 
            style="cursor: pointer;"
            @click="toggleDayExpansion(dayIdx)"
          >
            <span class="wcmc-market-day-header__name flex-fill fw-bold text-uppercase">{{ dayName }}</span>
            <div class="d-flex align-items-center gap-2">
              <span v-if="marketsByDay[dayIdx] && marketsByDay[dayIdx].length > 0" class="wcmc-market-day-header__badge d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
                {{ marketsByDay[dayIdx].length }}
              </span>
              <svg 
                v-if="!isDayExpanded(dayIdx)"
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                style="transition: transform 0.2s;"
              >
                <path d="M8 4V12M4 8H12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg 
                v-else
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                style="transition: transform 0.2s;"
              >
                <path d="M4 8H12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-if="isDayExpanded(dayIdx)" class="wcmc-market-day-column__items d-flex flex-column gap-2 mt-3">
            <MarketDayCard
              v-for="item in marketsByDay[dayIdx]"
              :key="item.id"
              :item="item"
              :lang="config.language"
              @details="openDetails"
            />
          </div>
        </div>
      </div>
      <!-- Desktop: Grid layout - only show days with markets -->
      <div v-for="(dayIdx, dayName) in weekDaysWithMarkets" :key="'desktop-'+dayIdx" class="d-none d-md-flex px-1 flex-column" style="flex: 1 1 0; max-width: 33%;">
        <div class="wcmc-market-day-column p-2 rounded">
          <div class="wcmc-market-day-header d-flex align-items-center justify-content-between gap-2 mb-3">
            <span class="wcmc-market-day-header__name flex-fill fw-bold text-uppercase">{{ dayName }}</span>
            <span v-if="marketsByDay[dayIdx] && marketsByDay[dayIdx].length > 0" class="wcmc-market-day-header__badge d-flex align-items-center justify-content-center rounded-circle flex-shrink-0">
              {{ marketsByDay[dayIdx].length }}
            </span>
          </div>
          <div class="wcmc-market-day-column__items d-flex flex-column gap-2">
            <MarketDayCard
              v-for="item in marketsByDay[dayIdx]"
              :key="item.id"
              :item="item"
              :lang="config.language"
              @details="openDetails"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MarketDayCard from '../components/MarketDayCard.vue';
import MarketsListSkeleton from '../components/MarketsListSkeleton.vue';
import EmptyState from '../components/EmptyState.vue';
import ErrorAlert from '../components/ErrorAlert.vue';


import { normalizeOdhItem, getFrequency, getScheduleWeekdays, getScheduleMonths, isActiveInMonth } from '../../utils/normalize';

const TRANSLATIONS = {
  en: {
    markets: 'Markets',
    searchPlaceholder: 'What are you looking for?',
    searchPlaceholderNew: 'Write something...',
    search: 'Search...',
    selectDate: 'Select date',
    weekday: 'DAY OF THE WEEK',
    zone: 'ZONE',
    frequency: 'FREQUENCY',
    period: 'PERIOD',
    category: 'CATEGORY',
    allDays: 'All days',
    allLocations: 'All locations',
    allFrequencies: 'All frequencies',
    allPeriods: 'All periods',
    allCategories: 'All categories',
    selected: 'selected',
    today: 'Today',
    sevenDays: '7 Days',
    month: 'Month',
    year: 'Year',
    selectStartDate: 'Select start date',
    selectEndDate: 'Select end date',
    showPast: 'Show past',
    winter: 'Winter',
    summer: 'Summer',
    filters: 'Filters',
    resetFilters: 'Reset filters',
    seeAll: 'See all',
    specificDay: 'Specific day',
    specificLocations: 'Specific locations',
    specificFrequencies: 'Specific frequencies',
    specificPeriods: 'Specific periods',
    specificCategories: 'Specific categories',
    noResults: 'There are no results for the search',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  it: {
    markets: 'Mercati',
    searchPlaceholder: 'Cosa stai cercando?',
    searchPlaceholderNew: 'Scrivi qualcosa...',
    search: 'Cerca...',
    selectDate: 'Seleziona data',
    weekday: 'GIORNO DELLA SETTIMANA',
    zone: 'ZONA',
    frequency: 'FREQUENZA',
    period: 'PERIODO',
    category: 'CATEGORIA',
    allDays: 'Vedi tutti',
    allLocations: 'Tutte le località',
    allFrequencies: 'Tutte le frequenze',
    allPeriods: 'Tutti i periodi',
    allCategories: 'Tutte le categorie',
    selected: 'selezionati',
    today: 'Oggi',
    sevenDays: '7 GG',
    month: 'Mese',
    year: 'Anno',
    selectStartDate: 'Seleziona data inizio',
    selectEndDate: 'Seleziona data fine',
    showPast: 'Mostra passati',
    winter: 'Invernale',
    summer: 'Estivo',
    filters: 'Filtri',
    resetFilters: 'Reset filtri',
    seeAll: 'Vedi tutti',
    specificDay: 'Giorno specifico',
    specificLocations: 'Località specifiche',
    specificFrequencies: 'Frequenze specifiche',
    specificPeriods: 'Periodi specifici',
    specificCategories: 'Categorie specifiche',
    noResults: 'Non ci sono risultati per la ricerca',
    months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  },
  de: {
    markets: 'Märkte',
    searchPlaceholder: 'Was suchen Sie?',
    searchPlaceholderNew: 'Schreibe etwas...',
    search: 'Suchen...',
    selectDate: 'Datum auswählen',
    weekday: 'WOCHENTAG',
    zone: 'ZONE',
    frequency: 'HÄUFIGKEIT',
    period: 'ZEITRAUM',
    category: 'KATEGORIE',
    allDays: 'Alle Tage',
    allLocations: 'Alle Orte',
    allFrequencies: 'Alle Häufigkeiten',
    allPeriods: 'Alle Zeiträume',
    allCategories: 'Alle Kategorien',
    selected: 'ausgewählt',
    today: 'Heute',
    sevenDays: '7 Tage',
    month: 'Monat',
    year: 'Jahr',
    selectStartDate: 'Startdatum auswählen',
    selectEndDate: 'Enddatum auswählen',
    showPast: 'Vergangene anzeigen',
    winter: 'Winter',
    summer: 'Sommer',
    filters: 'Filter',
    resetFilters: 'Filter zurücksetzen',
    seeAll: 'Alle anzeigen',
    specificDay: 'Bestimmter Tag',
    specificLocations: 'Bestimmte Orte',
    specificFrequencies: 'Bestimmte Häufigkeiten',
    specificPeriods: 'Bestimmte Zeiträume',
    specificCategories: 'Bestimmte Kategorien',
    noResults: 'Es gibt keine Ergebnisse für die Suche',
    months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  },
};

const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
};

export default {
  name: 'MarketsList',
  components: { MarketDayCard, MarketsListSkeleton, EmptyState, ErrorAlert },
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
        frequency: [],
        period: [],
        category: categoryDefault,
        showPast: false, // Default OFF
      },
      dropdownOpen: {
        weekday: false,
        zone: false,
        frequency: false,
        period: false,
        category: false,
      },
      mobileFilterVisible: false,
      expandedDays: {},
      zoneSearchQuery: '',
      categorySearchQuery: '',
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
      if (this.dateRange.from || this.dateRange.to) count++;
      if (this.filters.showPast) count++;
      count += this.filters.weekday.length;
      count += this.filters.zone.length;
      count += this.filters.frequency.length;
      count += this.filters.period.length;
      count += this.filters.category.length;
      return count;
    },
    ds() {
      return this.store.state.markets;
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
    weekdayOptions() {
      return WEEKDAYS[this.lang] || WEEKDAYS.it;
    },
    filteredWeekdayOptions() {
      // Only show weekdays that have actual data when no filters are active
      const options = this.weekdayOptions;
      if (this.filters.weekday.length === 0 && 
          this.filters.zone.length === 0 && 
          this.filters.frequency.length === 0 && 
          this.filters.period.length === 0 && 
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
    weekDays() {
      // Return object with day names and their indices (0=Sunday, 1=Monday, etc.)
      // But we want to start with Monday (1) and end with Sunday (0)
      const days = WEEKDAYS[this.lang] || WEEKDAYS.it;
      return {
        [days[1]]: 1, // Monday
        [days[2]]: 2, // Tuesday
        [days[3]]: 3, // Wednesday
        [days[4]]: 4, // Thursday
        [days[5]]: 5, // Friday
        [days[6]]: 6, // Saturday
        [days[0]]: 0, // Sunday
      };
    },
    monthOptions() {
      return TRANSLATIONS[this.lang]?.months || TRANSLATIONS.it.months;
    },
    filteredMonthOptions() {
      // Only show months that have actual data when no filters are active
      const options = this.monthOptions;
      if (this.filters.period.length === 0 && 
          this.filters.zone.length === 0 && 
          this.filters.weekday.length === 0 && 
          this.filters.frequency.length === 0 && 
          this.filters.category.length === 0 && 
          !this.dateRange.from && !this.dateRange.to && 
          !this.query.trim()) {
        // Return array of { label, index } for months that have data
        return options
          .map((label, idx) => ({ label, idx }))
          .filter(item => this.validPeriods.has(item.idx));
      }
      // Return all options with their indices when filters are active
      return options.map((label, idx) => ({ label, idx }));
    },
    weekdayDisplayText() {
      if (this.filters.weekday.length === 0) return this.t('allDays');
      if (this.filters.weekday.length === 1) {
        // Weekday is an index here
        return this.weekdayOptions[this.filters.weekday[0]] || this.t('allDays');
      }
      return `${this.filters.weekday.length} ${this.t('selected')}`;
    },
    zoneDisplayText() {
      if (this.filters.zone.length === 0) return this.t('allLocations');
      if (this.filters.zone.length === 1) return this.filters.zone[0];
      return `${this.filters.zone.length} ${this.t('selected')}`;
    },
    frequencyDisplayText() {
      if (this.filters.frequency.length === 0) return this.t('allFrequencies');
      if (this.filters.frequency.length === 1) return this.filters.frequency[0];
      return `${this.filters.frequency.length} ${this.t('selected')}`;
    },
    periodDisplayText() {
      if (this.filters.period.length === 0) return this.t('allPeriods');
      if (this.filters.period.length === 1) {
         const m = this.monthOptions[this.filters.period[0]];
         return m ? m : this.filters.period[0];
      }
      return `${this.filters.period.length} ${this.t('selected')}`;
    },
    categoryDisplayText() {
      if (this.filters.category.length === 0) return this.t('allCategories');
      if (this.filters.category.length === 1) return this.filters.category[0];
      return `${this.filters.category.length} ${this.t('selected')}`;
    },
    activeFilterTags() {
      const tags = [];
      // Weekday
      this.filters.weekday.forEach(idx => {
        tags.push({ type: 'weekday', value: idx, label: this.weekdayOptions[idx] });
      });
      // Zone
      this.filters.zone.forEach(val => {
        tags.push({ type: 'zone', value: val, label: val });
      });
      // Frequency
      this.filters.frequency.forEach(val => {
        tags.push({ type: 'frequency', value: val, label: val });
      });
      // Period
      this.filters.period.forEach(val => {
        const label = this.monthOptions[val] || val;
        tags.push({ type: 'period', value: val, label });
      });
      // Category
      this.filters.category.forEach(val => {
        tags.push({ type: 'category', value: val, label: val });
      });
      // Date range is handled separately in the template
      return tags;
    },
    normalized() {
      return this.ds.itemsRaw.map((it) => normalizeOdhItem(it, { lang: this.config.language, type: 'market' }));
    },
    baseForZone() {
      return this.applyFilters(this.normalized, { ignoreZone: true });
    },
    availableZones() {
      // Only show zones that have actual data (use validZones when no filters are active)
      if (this.filters.zone.length === 0 && 
          this.filters.weekday.length === 0 && 
          this.filters.frequency.length === 0 && 
          this.filters.period.length === 0 && 
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
          this.filters.frequency.length === 0 && 
          this.filters.period.length === 0 && 
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
    availableFrequencies() {
      // Only show frequencies that have actual data (use validFrequencies when no filters are active)
      if (this.filters.frequency.length === 0 && 
          this.filters.zone.length === 0 && 
          this.filters.weekday.length === 0 && 
          this.filters.period.length === 0 && 
          this.filters.category.length === 0 && 
          !this.dateRange.from && !this.dateRange.to && 
          !this.query.trim()) {
        return Array.from(this.validFrequencies).sort();
      }
      const freqs = new Set();
      this.normalized.forEach((item) => {
        const freq = getFrequency(item.raw, this.lang);
        if (freq) freqs.add(freq);
      });
      return Array.from(freqs).sort();
    },
    // Computed properties for valid filter options based on current selections
    validWeekdays() {
      // Get items that match current filters (excluding weekday filter)
      const baseItems = this.applyFilters(this.normalized, { ignoreWeekday: true });
      const validDays = new Set();
      
      baseItems.forEach((item) => {
        const scheduleWeekdays = getScheduleWeekdays(item.raw);
        if (scheduleWeekdays.length > 0) {
          scheduleWeekdays.forEach(day => validDays.add(day));
        } else if (item.nextDate) {
          try {
            const itemDate = new Date(item.nextDate);
            validDays.add(itemDate.getDay());
          } catch {
            // Invalid date, skip
          }
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
    validFrequencies() {
      // Get items that match current filters (excluding frequency filter)
      const baseItems = this.applyFilters(this.normalized, { ignoreFrequency: true });
      const validFreqs = new Set();
      
      baseItems.forEach((item) => {
        const freq = getFrequency(item.raw, this.lang);
        if (freq) validFreqs.add(freq);
      });
      
      return validFreqs;
    },
    validPeriods() {
      // Get items that match current filters (excluding period filter)
      const baseItems = this.applyFilters(this.normalized, { ignorePeriod: true });
      const validPeriods = new Set();
      
      baseItems.forEach((item) => {
        const months = getScheduleMonths(item.raw);
        months.forEach(month => validPeriods.add(month));
      });
      
      return validPeriods;
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
    filtered() {
      return this.applyFilters(this.normalized);
    },
    marketsByDay() {
      // Group filtered items by day of week
      const byDay = {
        0: [], // Sunday
        1: [], // Monday
        2: [], // Tuesday
        3: [], // Wednesday
        4: [], // Thursday
        5: [], // Friday
        6: [], // Saturday
      };

      this.filtered.forEach((item) => {
        // First, try to get weekdays from schedule (most accurate)
        const scheduleWeekdays = getScheduleWeekdays(item.raw);
        
        if (scheduleWeekdays.length > 0) {
          // Use schedule weekdays - add item to all relevant days
          scheduleWeekdays.forEach((day) => {
            if (byDay[day] !== undefined) {
              byDay[day].push(item);
            }
          });
        } else if (item.nextDate) {
          // Fallback to nextDate if schedule weekdays not available
          try {
            const itemDate = new Date(item.nextDate);
            const day = itemDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
            if (byDay[day] !== undefined) {
              byDay[day].push(item);
            }
          } catch {
            // Invalid date, skip
          }
        }
      });

      return byDay;
    },
    weekDaysWithMarkets() {
      const days = WEEKDAYS[this.lang] || WEEKDAYS.it;
      
      // Order: Monday to Sunday
      const orderedDays = [
        { name: days[1], idx: 1 }, // Monday
        { name: days[2], idx: 2 }, // Tuesday
        { name: days[3], idx: 3 }, // Wednesday
        { name: days[4], idx: 4 }, // Thursday
        { name: days[5], idx: 5 }, // Friday
        { name: days[6], idx: 6 }, // Saturday
        { name: days[0], idx: 0 }, // Sunday
      ];
      
      // Check if any filters are active (excluding weekday filter for this check)
      const hasActiveFilters = this.query.trim() !== '' ||
        (this.dateRange.from || this.dateRange.to) ||
        this.filters.weekday.length > 0 ||
        this.filters.zone.length > 0 ||
        this.filters.frequency.length > 0 ||
        this.filters.period.length > 0 ||
        this.filters.category.length > 0;
      
      // Get selected weekday indices
      const selectedWeekdays = this.filters.weekday.map(d => Number(d));
      
      const result = {};
      
      orderedDays.forEach(({ name, idx }) => {
        // Show day if:
        // 1. No filters active (show all days)
        // 2. Day has markets
        // 3. Day is explicitly selected in weekday filter
        const hasMarkets = this.marketsByDay[idx] && this.marketsByDay[idx].length > 0;
        const isSelectedWeekday = selectedWeekdays.includes(idx);
        
        if (!hasActiveFilters || hasMarkets || isSelectedWeekday) {
          result[name] = idx;
        }
      });
      
      return result;
    },
  },
  async mounted() {
    // Load all markets - use a very high number to ensure all pages are loaded
    await this.store.ensureLoaded('market', 999999);
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  watch: {
    query() {
      // Reset on search change
    },
    filters: {
      deep: true,
      handler() {
        // Filters changed
      },
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
    validFrequencies: {
      handler() {
        // Remove invalid frequency selections when valid set changes
        if (this.filters.frequency.length > 0) {
          const valid = this.filters.frequency.filter(freq => this.validFrequencies.has(freq));
          if (valid.length !== this.filters.frequency.length) {
            this.$nextTick(() => {
              this.filters.frequency = valid;
            });
          }
        }
      },
      immediate: false,
    },
    validPeriods: {
      handler() {
        // Remove invalid period selections when valid set changes
        if (this.filters.period.length > 0) {
          const valid = this.filters.period.filter(period => this.validPeriods.has(period));
          if (valid.length !== this.filters.period.length) {
            this.$nextTick(() => {
              this.filters.period = valid;
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
  methods: {
    applyFilters(items, { ignoreZone = false, ignoreWeekday = false, ignoreFrequency = false, ignorePeriod = false, ignoreCategory = false } = {}) {
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
          // For markets, check if they operate during the date range
          // We need to check if the market operates on any day within the range
          if (!fromDate && !toDate) return true;
          
          // Get weekdays the market operates on
          const scheduleWeekdays = getScheduleWeekdays(item.raw);
          
          if (scheduleWeekdays.length > 0) {
            // Check if market operates on any day within the date range
            // and is active in any month within the range
            if (fromDate && toDate) {
              // Check all months in the range
              const fromMonth = fromDate.getMonth();
              const toMonth = toDate.getMonth();
              const fromYear = fromDate.getFullYear();
              const toYear = toDate.getFullYear();
              
              // Check if market is active in any month in the range
              let activeInRange = false;
              for (let year = fromYear; year <= toYear; year++) {
                const startMonth = year === fromYear ? fromMonth : 0;
                const endMonth = year === toYear ? toMonth : 11;
                for (let month = startMonth; month <= endMonth; month++) {
                  if (isActiveInMonth(item, month)) {
                    activeInRange = true;
                    break;
                  }
                }
                if (activeInRange) break;
              }
              
              if (!activeInRange) return false;
              
              // Check if any day in the range matches the market's operating days
              const currentDate = new Date(fromDate);
              while (currentDate <= toDate) {
                const dayOfWeek = currentDate.getDay();
                if (scheduleWeekdays.includes(dayOfWeek)) {
                  return true;
                }
                currentDate.setDate(currentDate.getDate() + 1);
              }
              return false;
            } else if (fromDate) {
              // Only from date specified
              const dayOfWeek = fromDate.getDay();
              const month = fromDate.getMonth();
              return scheduleWeekdays.includes(dayOfWeek) && isActiveInMonth(item, month);
            } else if (toDate) {
              // Only to date specified
              const dayOfWeek = toDate.getDay();
              const month = toDate.getMonth();
              return scheduleWeekdays.includes(dayOfWeek) && isActiveInMonth(item, month);
            }
          }
          
          // Fallback to nextDate for markets without schedule weekdays
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
      if (!ignoreWeekday && Array.isArray(this.filters.weekday) && this.filters.weekday.length > 0) {
        const targetDays = this.filters.weekday.map((d) => Number(d));
        result = result.filter((item) => {
          // First, try to get weekdays from schedule (most accurate)
          const scheduleWeekdays = getScheduleWeekdays(item.raw);

          if (scheduleWeekdays.length > 0) {
            // Use schedule weekdays if available - check if any selected day matches
            return scheduleWeekdays.some((day) => targetDays.includes(day));
          }

          // Fallback to nextDate if schedule weekdays not available
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          return targetDays.includes(itemDate.getDay());
        });
      }

      // Zone filter
      if (!ignoreZone && this.filters.zone.length > 0) {
        result = result.filter((item) => this.filters.zone.includes(item.municipality));
      }

      // Frequency filter
      if (!ignoreFrequency && this.filters.frequency.length > 0) {
        result = result.filter((item) => {
          const freq = getFrequency(item.raw, this.lang);
          return this.filters.frequency.includes(freq);
        });
      }

      // Period filter (Months)
      if (!ignorePeriod && this.filters.period.length > 0) {
        result = result.filter((item) => {
          // Check if item is active in ANY of the selected months
          const normalizedItem = item; // item is already normalized
          return this.filters.period.some((monthIdx) => isActiveInMonth(normalizedItem, Number(monthIdx)));
        });
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
    toggleFrequency(value) {
      if (value === 'all') {
        this.filters.frequency = [];
        return;
      }
      const idx = this.filters.frequency.indexOf(value);
      if (idx >= 0) {
        this.filters.frequency.splice(idx, 1);
      } else {
        this.filters.frequency.push(value);
      }
    },
    togglePeriod(value) {
      if (value === 'all') {
        this.filters.period = [];
        return;
      }
      const idx = this.filters.period.indexOf(value);
      if (idx >= 0) {
        this.filters.period.splice(idx, 1);
      } else {
        this.filters.period.push(value);
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
      const isInside = this.$refs.weekdayFilter?.contains(event.target) ||
                       this.$refs.zoneFilter?.contains(event.target) ||
                       this.$refs.frequencyFilter?.contains(event.target) ||
                       this.$refs.periodFilter?.contains(event.target) ||
                       this.$refs.categoryFilter?.contains(event.target);
      
      if (!isInside) {
        this.dropdownOpen.weekday = false;
        this.dropdownOpen.zone = false;
        this.dropdownOpen.frequency = false;
        this.dropdownOpen.period = false;
        this.dropdownOpen.category = false;
      }
    },
    isDayExpanded(dayIdx) {
      // Default to expanded if not set, or if explicitly set to true
      if (this.expandedDays[dayIdx] === undefined) {
        // Auto-expand first day with markets on initial load
        const daysWithMarkets = Object.keys(this.marketsByDay).filter(d => this.marketsByDay[d] && this.marketsByDay[d].length > 0);
        if (daysWithMarkets.length > 0 && Number(daysWithMarkets[0]) === dayIdx) {
          return true;
        }
        return false;
      }
      return this.expandedDays[dayIdx] === true;
    },
    toggleDayExpansion(dayIdx) {
      // Vue 3 handles reactivity automatically, no need for $set
      this.expandedDays = { ...this.expandedDays, [dayIdx]: !this.isDayExpanded(dayIdx) };
    },
    clearMenuFilters() {
      // Reset only filters inside the menu (weekday, zone, frequency, period, category)
      // Reset to default values from config
      const zoneDefault = this.config.filterZoneDefaultValue ? 
        (Array.isArray(this.config.filterZoneDefaultValue) ? this.config.filterZoneDefaultValue : [this.config.filterZoneDefaultValue]) 
        : [];
      const categoryDefault = this.config.filterCategoryDefaultValue ? 
        (Array.isArray(this.config.filterCategoryDefaultValue) ? this.config.filterCategoryDefaultValue : [this.config.filterCategoryDefaultValue]) 
        : [];
      
      this.filters.weekday = [];
      this.filters.zone = zoneDefault;
      this.filters.frequency = [];
      this.filters.period = [];
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
      this.filters.weekday = [];
      this.filters.zone = zoneDefault;
      this.filters.frequency = [];
      this.filters.period = [];
      this.filters.category = categoryDefault;
      this.filters.showPast = false;
    },
  },
};
</script>
