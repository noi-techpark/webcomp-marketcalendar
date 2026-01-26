<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-market-day-card d-flex flex-row align-items-start gap-2 p-2 rounded mb-2" @click="$emit('details', item)" role="button" tabindex="0" @keydown.enter="$emit('details', item)">
    <!-- Image left side on mobile, right side on desktop -->
    <div
      class="wcmc-market-day-card__image flex-shrink-0 rounded overflow-hidden order-1 order-md-2"
      style="width: 25%; max-width: 100px; aspect-ratio: 1 / 1;"
    >
      <img
        v-if="item.image && !imageError"
        class="w-100 h-100"
        style="object-fit: cover;"
        :src="item.image"
        :alt="item.title"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        @error="handleImageError"
        @load="imageError = false"
      />
      <div v-else class="wcmc-market-day-card__image-placeholder w-100 h-100 d-flex align-items-center justify-content-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
      </div>
    </div>

    <!-- Content right side on mobile, left side on desktop -->
    <div class="wcmc-market-day-card__content d-flex flex-column gap-2 flex-fill min-w-0 order-2 order-md-1">
      <!-- Location with pushpin icon -->
      <div class="wcmc-market-day-card__location d-flex align-items-start gap-2">
        <svg class="wcmc-market-day-card__location-icon flex-shrink-0 align-self-center" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <h4 class="wcmc-market-day-card__title fw-bold text-uppercase mb-0" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;">{{ locationName }}</h4>
      </div>

      <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
        <span class="px-4">{{ regionName || '-' }}</span>
      </div>

      <!-- Frequency with calendar icon -->
      <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
        <svg class="wcmc-market-day-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
        </svg>
        <span>{{ frequency || '—' }}</span>
      </div>

      <!-- Months list with book icon -->
      <div v-if="monthsList.length > 0" class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
        <svg class="wcmc-market-day-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <span class="wcmc-market-day-card__months fst-italic">{{ monthsList }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getFrequency, getScheduleEntries, getScheduleMonths } from '../../utils/normalize';

const MONTHS_ABBR = {
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  it: ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'],
  de: ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'],
};

export default {
  name: 'MarketDayCard',
  props: {
    item: { type: Object, required: true },
    lang: { type: String, default: 'it' },
  },
  emits: ['details'],
  computed: {
    locationName() {
      // Prefer municipality if available and not empty, otherwise use title
      const location = (this.item.municipality && this.item.municipality.trim()) 
        ? this.item.municipality 
        : (this.item.title || '');
      return location.toUpperCase();
    },
    regionName() {
      return '';
      // return this.item.locationInfo != null ? this.item.locationInfo.regionInfo.name[this.lang] ;
    },
    frequency() {
      if (!this.item.raw) return '—';
      const freq = getFrequency(this.item.raw, this.lang);
      return freq || '—';
    },
    monthsList() {
      if (!this.item.raw) return '';
      
      const months = getScheduleMonths(this.item.raw, this.lang);
      if (!months.length) return '';
      
      const monthAbbr = MONTHS_ABBR[this.lang] || MONTHS_ABBR.it;
      
      // If all 12 months, show "TUTTO L'ANNO" / "ALL YEAR" / "GANZES JAHR"
      if (months.length === 12) {
        const allYear = {
          it: 'TUTTO L\'ANNO',
          en: 'ALL YEAR',
          de: 'GANZES JAHR',
        };
        return allYear[this.lang] || allYear.it;
      }
      
      return months.map((idx) => monthAbbr[idx]).join(', ');
    },
  },
  data() {
    return {
      imageError: false,
    };
  },
  methods: {
    handleImageError(event) {
      this.imageError = true;
      if (event.target) {
        event.target.style.display = 'none';
      }
    },
  },
};
</script>

