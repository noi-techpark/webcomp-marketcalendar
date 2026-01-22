<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div>
    <h2 class="h6 mb-2">{{ title }}</h2>
    <div v-if="!entries.length" class="text-secondary small">No schedule available.</div>
    <ul v-else class="list-group">
      <li v-for="(e, idx) in entries" :key="idx" class="list-group-item d-flex justify-content-between gap-3">
        <span class="fw-semibold">{{ formatDate(e.start) }}</span>
        <span class="text-secondary">→</span>
        <span>{{ e.end ? formatDate(e.end) : '—' }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
function formatDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return String(iso);
  }
}

export default {
  name: 'ScheduleBlock',
  props: {
    entries: { type: Array, default: () => [] },
    title: { type: String, default: 'Schedule' },
  },
  methods: { formatDate },
};
</script>


