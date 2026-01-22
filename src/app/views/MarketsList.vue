<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div>
    <!-- Breadcrumb -->


    <!-- Mobile: All controls in single row -->
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
            id="wcmc-date-selector-mobile"
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
      
      <div class="d-flex align-items-center gap-3 ms-md-auto">
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
            id="wcmc-date-selector-markets"
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
            <div v-for="(day, idx) in weekdayOptions" :key="idx" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleWeekday(idx)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.weekday.includes(idx)" readonly>
              <span class="small">{{ day }}</span>
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
            <div v-for="freq in availableFrequencies" :key="freq" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="toggleFrequency(freq)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.frequency.includes(freq)" readonly>
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
            <div v-for="(month, idx) in monthOptions" :key="idx" class="wcmc-dropdown-item wcmc-cursor-pointer p-2 rounded mb-1 d-flex align-items-center gap-2" @click="togglePeriod(idx)">
              <input type="checkbox" class="form-check-input mt-0 wcmc-pointer-events-none" :checked="filters.period.includes(idx)" readonly>
              <span class="small">{{ month }}</span>
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
        <span v-for="tag in activeFilterTags" :key="tag.type + tag.value" class="wcmc-filter-tag d-inline-flex align-items-center gap-2 px-3 py-1 rounded" @click="tag.type === 'weekday' ? toggleWeekday(tag.value) : tag.type === 'zone' ? toggleZone(tag.value) : tag.type === 'frequency' ? toggleFrequency(tag.value) : tag.type === 'period' ? togglePeriod(tag.value) : toggleCategory(tag.value)">
          {{ tag.label }}
          <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><path d="M6.5 1.5L1.5 6.5M1.5 1.5L6.5 6.5" stroke="currentColor" stroke-width="1.5"/></svg>
        </span>
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
              <div v-for="(day, idx) in weekdayOptions" :key="idx" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'weekday-'+idx" :checked="filters.weekday.includes(idx)" @change="toggleWeekday(idx)">
                <label class="form-check-label" :for="'weekday-'+idx">{{ day }}</label>
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
                <input class="form-check-input" type="checkbox" :id="'freq-'+freq" :checked="filters.frequency.includes(freq)" @change="toggleFrequency(freq)">
                <label class="form-check-label" :for="'freq-'+freq">{{ freq }}</label>
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
              <div v-for="(month, idx) in monthOptions" :key="idx" class="form-check mb-2">
                <input class="form-check-input" type="checkbox" :id="'period-'+idx" :checked="filters.period.includes(idx)" @change="togglePeriod(idx)">
                <label class="form-check-label" :for="'period-'+idx">{{ month }}</label>
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


import { normalizeOdhItem, getFrequency, getScheduleWeekdays, isActiveInMonth } from '../../utils/normalize';

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
    winter: 'Winter',
    summer: 'Summer',
    filters: 'Filters',
    seeAll: 'See all',
    specificDay: 'Specific day',
    specificLocations: 'Specific locations',
    specificFrequencies: 'Specific frequencies',
    specificPeriods: 'Specific periods',
    specificCategories: 'Specific categories',
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
    winter: 'Invernale',
    summer: 'Estivo',
    filters: 'Filtri',
    seeAll: 'Vedi tutti',
    specificDay: 'Giorno specifico',
    specificLocations: 'Località specifiche',
    specificFrequencies: 'Frequenze specifiche',
    specificPeriods: 'Periodi specifici',
    specificCategories: 'Categorie specifiche',
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
    winter: 'Winter',
    summer: 'Sommer',
    filters: 'Filter',
    seeAll: 'Alle anzeigen',
    specificDay: 'Bestimmter Tag',
    specificLocations: 'Bestimmte Orte',
    specificFrequencies: 'Bestimmte Häufigkeiten',
    specificPeriods: 'Bestimmte Zeiträume',
    specificCategories: 'Bestimmte Kategorien',
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
      selectedDate: '',
      filters: {
        weekday: [],
        zone: zoneDefault,
        frequency: [],
        period: [],
        category: categoryDefault,
        date: '',
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
    formattedDate() {
      if (!this.selectedDate) return '';
      // Format date as dd/mm/yyyy
      const date = new Date(this.selectedDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    weekdayOptions() {
      return WEEKDAYS[this.lang] || WEEKDAYS.it;
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
      // Date
      if (this.filters.date) {
        // Handled separately or added here? Assuming separate specific handling for date in UI or kept separate
      }
      return tags;
    },
    normalized() {
      return this.ds.itemsRaw.map((it) => normalizeOdhItem(it, { lang: this.config.language, type: 'market' }));
    },
    baseForZone() {
      return this.applyFilters(this.normalized, { ignoreZone: true });
    },
    availableZones() {
      const zones = new Set();
      this.baseForZone.forEach((item) => {
        if (item.municipality) zones.add(item.municipality);
      });
      return Array.from(zones).sort();
    },
    availableCategories() {
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
      const freqs = new Set();
      this.normalized.forEach((item) => {
        const freq = getFrequency(item.raw, this.lang);
        if (freq) freqs.add(freq);
      });
      return Array.from(freqs).sort();
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
        this.filters.date !== '' ||
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
    // Load all markets (no pagination needed for weekly view)
    await this.store.ensureLoaded('market', this.config.pageSize * 5 || 100);
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
  },
  methods: {
    applyFilters(items, { ignoreZone = false } = {}) {
      let result = items;

      // Text search
      const q = String(this.query || '').trim().toLowerCase();
      if (q) {
        result = result.filter((n) => String(n.title || '').toLowerCase().includes(q));
      }

      // Date filter (today or specific date)
      // For both "today" and specific date, we check:
      // 1. If the market operates on the selected day of the week
      // 2. If the market is active in the selected month
      if (this.filters.date === 'today') {
        const now = new Date();
        const targetDayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
        const targetMonth = now.getMonth(); // 0=January, etc.
        result = result.filter((item) => {
          // Get weekdays the market operates on
          const scheduleWeekdays = getScheduleWeekdays(item.raw);

          if (scheduleWeekdays.length > 0) {
            // Check if market operates on this day of the week AND is active in this month
            const operatesOnDay = scheduleWeekdays.includes(targetDayOfWeek);
            const activeInMonth = isActiveInMonth(item, targetMonth);
            return operatesOnDay && activeInMonth;
          }

          // Fallback to nextDate for markets without schedule weekdays
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          return itemDate.toDateString() === today.toDateString();
        });
      } else if (this.filters.date === 'specific' && this.selectedDate) {
        const selectedDateObj = new Date(this.selectedDate);
        const targetDayOfWeek = selectedDateObj.getDay(); // 0=Sunday, 1=Monday, etc.
        const targetMonth = selectedDateObj.getMonth(); // 0=January, etc.
        result = result.filter((item) => {
          // Get weekdays the market operates on
          const scheduleWeekdays = getScheduleWeekdays(item.raw);

          if (scheduleWeekdays.length > 0) {
            // Check if market operates on this day of the week AND is active in this month
            const operatesOnDay = scheduleWeekdays.includes(targetDayOfWeek);
            const activeInMonth = isActiveInMonth(item, targetMonth);
            return operatesOnDay && activeInMonth;
          }

          // Fallback to nextDate for markets without schedule weekdays
          if (!item.nextDate) return false;
          const itemDate = new Date(item.nextDate);
          return itemDate.toDateString() === selectedDateObj.toDateString();
        });
      }

      // Weekday filter
      if (Array.isArray(this.filters.weekday) && this.filters.weekday.length > 0) {
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
      if (this.filters.frequency.length > 0) {
        result = result.filter((item) => {
          const freq = getFrequency(item.raw, this.lang);
          return this.filters.frequency.includes(freq);
        });
      }

      // Period filter (Months)
      if (this.filters.period.length > 0) {
        result = result.filter((item) => {
          // Check if item is active in ANY of the selected months
          const normalizedItem = item; // item is already normalized
          return this.filters.period.some((monthIdx) => isActiveInMonth(normalizedItem, Number(monthIdx)));
        });
      }

      // Category filter
      if (this.filters.category.length > 0) {
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
    onDateChange(event) {
      const dateValue = event.target.value;
      this.selectedDate = dateValue;
      if (dateValue) {
        this.filters.date = 'specific';
      } else {
        this.filters.date = '';
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
    toggleDropdown(name) {
      // Close all others, toggle current
      Object.keys(this.dropdownOpen).forEach(key => {
        this.dropdownOpen[key] = (key === name) ? !this.dropdownOpen[name] : false;
      });
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
    clearAllFilters() {
      // Reset to default values from config
      const zoneDefault = this.config.filterZoneDefaultValue ? 
        (Array.isArray(this.config.filterZoneDefaultValue) ? this.config.filterZoneDefaultValue : [this.config.filterZoneDefaultValue]) 
        : [];
      const categoryDefault = this.config.filterCategoryDefaultValue ? 
        (Array.isArray(this.config.filterCategoryDefaultValue) ? this.config.filterCategoryDefaultValue : [this.config.filterCategoryDefaultValue]) 
        : [];
      
      this.filters.date = '';
      this.filters.weekday = [];
      this.filters.zone = zoneDefault;
      this.filters.frequency = [];
      this.filters.period = [];
      this.filters.category = categoryDefault;
      this.selectedDate = '';
    },
  },
};
</script>
