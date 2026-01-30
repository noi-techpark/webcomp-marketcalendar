<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="row g-3">
    <div v-for="i in count" :key="i" class="col-6 col-md-6 col-lg-3">
      <div class="card h-100">
        <div class="ratio ratio-16x9 bg-light"></div>
        <div class="card-body">
          <div class="placeholder-glow">
            <span class="placeholder col-8"></span>
            <span class="placeholder col-6"></span>
            <span class="placeholder col-10"></span>
            <span class="placeholder col-5"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonList',
  props: { count: { type: Number, default: 6 } },
};
</script>


