<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="row g-3">
    <div v-for="item in items" :key="itemKey(item)" class="col-6 col-md-6 col-lg-3">
      <slot name="card" :item="item" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardGrid',
  props: {
    items: { type: Array, default: () => [] },
    itemKey: { type: Function, default: (it) => it?.id || it?.Id },
  },
};
</script>


