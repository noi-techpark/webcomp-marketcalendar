<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-search-bar w-100">
    <div class="wcmc-search-bar__wrapper position-relative w-100">
      <input
        class="wcmc-search-bar__input form-control w-100 rounded"
        type="search"
        :placeholder="placeholder"
        :value="modelValue"
        style="height: 40px; padding: 0 40px 0 16px;"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <svg class="wcmc-search-bar__icon position-absolute" width="16" height="17" viewBox="0 0 24 24" fill="currentColor" style="right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none;">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: { type: String, default: '' },
    label: { type: String, default: 'Search' },
    placeholder: { type: String, default: 'Search by title…' },
  },
  emits: ['update:modelValue'],
};
</script>


