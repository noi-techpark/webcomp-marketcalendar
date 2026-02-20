<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-fair-card d-flex flex-column rounded overflow-hidden h-100" @click="$emit('details', item)"
    role="button" tabindex="0" @keydown.enter="$emit('details', item)">
    <!-- Image with category badge -->
    <div class="wcmc-fair-card__image-wrapper position-relative" :class="largePadding ? 'p-3' : 'p-2'">
      <img v-if="item.image && !imageError" class="wcmc-fair-card__image w-100 rounded d-block" :src="item.image"
        :alt="item.title" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        style="aspect-ratio: 315 / 224; object-fit: cover;" @error="handleImageError" @load="imageError = false" />
      <div v-if="!item.image || imageError"
        class="wcmc-fair-card__image wcmc-fair-card__image--placeholder w-100 d-flex align-items-center justify-content-center rounded"
        style="aspect-ratio: 315 / 224;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      </div>
      <span v-if="categoryLabel"
        class="wcmc-category-badge position-absolute top-0 end-0 px-1 py-1 rounded fw-medium text-uppercase text-medium"
        :class="largePadding ? 'm-4' : 'm-3'" style="top: 15px; right: 15px;">{{ categoryLabel }}</span>
    </div>

    <!-- Card content -->
    <div class="wcmc-fair-card__body d-flex flex-column gap-1 flex-fill min-h-0"
      :class="largePadding ? 'px-3 pb-3' : 'px-2 pb-2'">
      <!-- Fair Name - Always show for communityFair variant, otherwise show when not communityFair -->
      <div v-if="item.title" class="wcmc-fair-card__title fw-bold mb-2 w-100" :lang="lang">
        <template v-for="(part, index) in formattedTitle" :key="index">
          <span v-if="index > 0" class="wcmc-title-separator">/</span>
          <span class="wcmc-title-part">{{ part }}</span>
        </template>
      </div>

      <div v-if="item.nextDate" class="wcmc-fair-card__meta d-flex align-items-center gap-2 w-100">
        <svg class="wcmc-fair-card__icon flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
        </svg>
        <span class="wcmc-fair-card__month fw-semibold text-uppercase">{{ monthName }}</span>
      </div>

      <div v-if="item.nextDate" class="wcmc-fair-card__date ps-4 mb-1 w-100">
        {{ formattedFullDate }}{{ (formattedEndDate && formattedEndDate !== formattedFullDate) ? ` -
        ${formattedEndDate}` : ''
        }}
      </div>

      <!-- Location - Hidden for communityFair variant -->
      <div v-if="item.municipality && variant !== 'communityFair'"
        class="wcmc-fair-card__location d-flex align-items-center gap-2 fw-semibold text-uppercase w-100">
        <svg class="wcmc-fair-card__icon flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
        <span class="flex-fill" style="word-wrap: break-word; overflow-wrap: break-word;">{{ locationName }}{{
          locationProvince }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getScheduleMonths } from '../../utils/normalize';

const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
};

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
};

export default {
  name: 'ItemCard',
  props: {
    item: { type: Object, required: true },
    badge: { type: String, default: '' },
    lang: { type: String, default: 'it' },
    variant: { type: String, default: 'default' }, // 'default' or 'communityFair'
    largePadding: { type: Boolean, default: false },
  },
  emits: ['details'],
  computed: {
    categoryLabel() {
      // Try to get category from raw data
      const raw = this.item.raw;
      if (!raw) return this.badge || null;

      // Check for ODHTags or other category fields
      const tags = raw.ODHTags || raw.Tags || [];
      if (Array.isArray(tags) && tags.length > 0) {
        const tag = tags[0];
        const tagName = tag?.Id || tag?.Name || tag;
        if (typeof tagName === 'string') return tagName.toUpperCase();
      }

      return this.badge || null;
    },
    monthName() {
      // First, try to get months from schedule
      if (this.item.raw) {
        const scheduleMonths = getScheduleMonths(this.item.raw, this.lang);
        if (scheduleMonths.length === 12) {
          // Full year
          const allYear = {
            it: 'TUTTO L\'ANNO',
            en: 'ALL YEAR',
            de: 'GANZES JAHR',
          };
          return allYear[this.lang] || allYear.it;
        }
        if (scheduleMonths.length > 0) {
          // Show first month from schedule
          const lang = this.lang || 'it';
          const months = MONTHS[lang] || MONTHS.it;
          return months[scheduleMonths[0]].toUpperCase();
        }
      }

      // Fallback to nextDate
      if (!this.item.nextDate) return '';
      try {
        const date = new Date(this.item.nextDate);
        const monthIdx = date.getMonth();
        const lang = this.lang || 'it';
        const months = MONTHS[lang] || MONTHS.it;
        return months[monthIdx].toUpperCase();
      } catch {
        return '';
      }
    },
    formattedFullDate() {
      if (!this.item.nextDate) return '';
      return this.formatDateForDisplay(this.item.nextDate);
    },
    formattedEndDate() {
      const end = this.item.endDate || this.item.schedule?.[0]?.end || this.item.raw?.OperationSchedule?.[0]?.Stop;
      if (!end) return '';
      return this.formatDateForDisplay(end);
    },
    locationName() {
      return (this.item.municipality || '').toUpperCase() || '—';
    },
    locationProvince() {
      // Add province code if available, otherwise default to (BZ)
      return ' (BZ)';
    },
    formattedTitle() {
      if (!this.item.title) return [];
      const title = this.item.title.toUpperCase();
      // Split on "/" first
      return title.split('/').map(part => part.trim()).filter(part => part.length > 0);
    },
  },
  data() {
    return {
      imageError: false,
    };
  },
  methods: {
    formatDateForDisplay(dateInput) {
      try {
        const date = new Date(dateInput);
        if (!Number.isFinite(date.getTime())) return '';
        const lang = this.lang || 'it';
        const weekdays = WEEKDAYS[lang] || WEEKDAYS.it;
        const weekday = weekdays[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${weekday} ${day}/${month}/${year}`;
      } catch {
        return typeof dateInput === 'string' ? dateInput : '';
      }
    },
    handleImageError(event) {
      // Hide broken image and show placeholder instead
      this.imageError = true;
      if (event.target) {
        event.target.style.display = 'none';
      }
    },
  },
};
</script>
