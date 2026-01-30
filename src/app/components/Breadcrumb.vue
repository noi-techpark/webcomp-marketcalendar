<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <nav aria-label="breadcrumb" class="wcmc-detail-breadcrumb pb-2">
    <ol class="breadcrumb mb-0">
      <template v-for="(item, index) in items" :key="index">
        <li
          v-if="item.route"
          class="breadcrumb-item"
        >
          <a
            href="#"
            class="wcmc-detail-breadcrumb-text text-decoration-none"
            @click.prevent="navigate(item.route, item.params)"
          >
            {{ item.label }}
          </a>
        </li>
        <li
          v-else
          class="breadcrumb-item active"
          aria-current="page"
        >
          <span class="wcmc-detail-breadcrumb-text">{{ item.label }}</span>
        </li>
      </template>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    items: {
      type: Array,
      required: true,
      validator: (items) => {
        return items.every(
          (item) =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.label === 'string' &&
            (item.route === undefined || typeof item.route === 'string')
        );
      },
    },
    separator: {
      type: String,
      default: '>',
    },
    store: {
      type: Object,
      default: null,
    },
  },
  methods: {
    navigate(route, params = {}) {
      if (this.store && typeof this.store.go === 'function') {
        this.store.go(route, params);
      }
    },
  },
};
</script>

<style>
.breadcrumb-item + .breadcrumb-item::before {
  content: var(--bs-breadcrumb-divider, ">");
  padding: 0 0.5rem;
}

.wcmc-root .breadcrumb-item + .breadcrumb-item::before {
  color: var(--text-color-dark, #ffffff);
}

.wcmc-root[data-bs-theme="light"] .breadcrumb-item + .breadcrumb-item::before {
  color: var(--text-color-light, #000000);
}
</style>

