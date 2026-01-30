<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <nav v-if="hasResults || loading" class="wcmc-pager d-flex gap-2 justify-content-center justify-content-md-end" aria-label="Pagination">
    <!-- Skeleton state - only show if loading and we don't have pagination metadata yet -->
    <template v-if="loading && !hasPaginationMeta">
      <div class="wcmc-pager-btn wcmc-pager-btn--arrow wcmc-pager-skeleton">
        <div class="placeholder" style="width: 5px; height: 13px;"></div>
      </div>
      <div class="wcmc-pager-btn wcmc-pager-skeleton">
        <div class="placeholder" style="width: 20px; height: 20px;"></div>
      </div>
      <div class="wcmc-pager-btn wcmc-pager-skeleton">
        <div class="placeholder" style="width: 20px; height: 20px;"></div>
      </div>
      <div class="wcmc-pager-btn wcmc-pager-skeleton">
        <div class="placeholder" style="width: 20px; height: 20px;"></div>
      </div>
      <div class="wcmc-pager-btn wcmc-pager-skeleton">
        <div class="placeholder" style="width: 20px; height: 20px;"></div>
      </div>
      <div class="wcmc-pager-ellipsis wcmc-pager-skeleton">
        <div class="placeholder" style="width: 20px; height: 20px;"></div>
      </div>
      <div class="wcmc-pager-btn wcmc-pager-skeleton">
        <div class="placeholder" style="width: 20px; height: 20px;"></div>
      </div>
      <div class="wcmc-pager-btn wcmc-pager-btn--arrow wcmc-pager-skeleton">
        <div class="placeholder" style="width: 5px; height: 13px;"></div>
      </div>
    </template>

    <!-- Actual pagination -->
    <template v-else-if="hasResults">
      <button
        class="wcmc-pager-btn wcmc-pager-btn--arrow"
        type="button"
        :disabled="!hasPrev"
        aria-label="Previous page"
        @click="goPrev"
      >
        <svg width="5" height="13" viewBox="0 0 5 13" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 1L1 6.5L4 12"/>
        </svg>
      </button>

      <template v-for="(item, index) in pageNumbers" :key="index">
        <button
          v-if="item !== '...'"
          class="wcmc-pager-btn"
          :class="{ 'is-active': item === currentPage }"
          type="button"
          :aria-label="item === currentPage ? `Current page, page ${item}` : `Go to page ${item}`"
          :aria-current="item === currentPage ? 'page' : undefined"
          :disabled="item === currentPage"
          @click="setPage(item)"
        >
          {{ item }}
        </button>
        <span v-else class="wcmc-pager-ellipsis">...</span>
      </template>

      <button
        class="wcmc-pager-btn wcmc-pager-btn--arrow"
        type="button"
        :disabled="!hasNext"
        aria-label="Next page"
        @click="goNext"
      >
        <svg width="5" height="13" viewBox="0 0 5 13" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M1 1L4 6.5L1 12"/>
        </svg>
      </button>
    </template>
  </nav>
</template>

<script>
export default {
  name: 'Pagination',
  props: {
    modelValue: { type: Number, required: true },
    hasPrev: { type: Boolean, default: false },
    hasNext: { type: Boolean, default: false },
    nextPageNumber: { type: Number, required: true },
    totalPages: { type: Number, default: null },
    loading: { type: Boolean, default: false },
    hasResults: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  computed: {
    currentPage() {
      const n = Number(this.modelValue);
      return Number.isFinite(n) && n > 0 ? n : 1;
    },
    hasPaginationMeta() {
      // We have pagination metadata if totalPages is provided and is a valid number
      return this.totalPages !== null && this.totalPages > 0;
    },
    lastPage() {
      // If totalPages is provided, use it (from API response)
      if (this.totalPages !== null && this.totalPages > 0) {
        return this.totalPages;
      }
      // Fallback: if hasNext is false, current page is last
      if (!this.hasNext) {
        return this.currentPage;
      }
      // If we have next page but don't know total, show at least current + 2 pages
      // This ensures we always show a reasonable pagination
      return Math.max(this.currentPage + 2, 5);
    },
    pageNumbers() {
      const current = this.currentPage;
      const last = this.lastPage;
      const pages = [];

      // If there are 7 or fewer pages, show all
      if (last <= 7) {
        for (let i = 1; i <= last; i++) {
          pages.push(i);
        }
        return pages;
      }

      // Always show page 1
      pages.push(1);

      // Calculate the range around current page (show current and 1 page on each side)
      const delta = 1;
      let start = Math.max(2, current - delta);
      let end = Math.min(last - 1, current + delta);

      // If we're near the beginning (pages 1-3), show pages 2-4
      if (current <= 3) {
        start = 2;
        end = Math.min(4, last - 1);
      }

      // If we're near the end, show the last few pages before the end
      if (current >= last - 2) {
        start = Math.max(2, last - 3);
        end = last - 1;
      }

      // Add ellipsis before the range if there's a gap
      if (start > 2) {
        pages.push('...');
      }

      // Add the page range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after the range if there's a gap before last page
      if (end < last - 1) {
        pages.push('...');
      }

      // Always show last page (if it's not already included)
      if (last > 1 && last !== end) {
        pages.push(last);
      }

      return pages;
    },
  },
  methods: {
    setPage(n) {
      const next = Number(n);
      if (!Number.isFinite(next) || next <= 0) return;
      if (next === this.currentPage) return;
      this.$emit('update:modelValue', next);
    },
    goPrev() {
      if (!this.hasPrev) return;
      this.setPage(this.currentPage - 1);
    },
    goNext() {
      if (!this.hasNext) return;
      this.setPage(this.currentPage + 1);
    },
    goNextPageNumber() {
      if (!this.hasNext) return;
      this.setPage(this.nextPageNumber);
    },
  },
};
</script>


