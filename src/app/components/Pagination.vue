<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <nav class="wcmc-pager d-flex gap-2 justify-content-center justify-content-md-end" aria-label="Pagination">
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

    <button class="wcmc-pager-btn is-active" type="button" aria-current="page" :disabled="true">
      {{ currentPage }}
    </button>

    <button
      v-if="hasNext"
      class="wcmc-pager-btn"
      type="button"
      :aria-label="`Go to page ${nextPageNumber}`"
      @click="goNextPageNumber"
    >
      {{ nextPageNumber }}
    </button>

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
  },
  emits: ['update:modelValue'],
  computed: {
    currentPage() {
      const n = Number(this.modelValue);
      return Number.isFinite(n) && n > 0 ? n : 1;
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


