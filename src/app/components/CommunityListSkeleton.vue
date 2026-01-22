<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="d-flex flex-column gap-3">
    <div v-for="i in count" :key="i"
      class="row g-0 align-items-center py-2 py-md-2 py-lg-2 rounded wcmc-community-list-row">
      <!-- Mobile Layout: Icon, Name/CAP/Badges, Arrow -->
      <div class="col-12 d-md-none d-flex align-items-center gap-3 px-3">
        <!-- Logo/Icon -->
        <div class="flex-shrink-0 d-flex align-items-center justify-content-center">
          <div class="placeholder" style="width: 55px; height: 55px; border-radius: 4px;"></div>
        </div>

        <!-- Name, CAP, and Badges -->
        <div class="flex-grow-1 d-flex flex-column gap-2">
          <div class="placeholder-glow">
            <span class="placeholder col-8"></span>
          </div>
          <div class="d-flex align-items-center gap-3">
            <!-- CAP Column -->
            <div class="placeholder-glow">
              <span class="placeholder" style="width: 60px; height: 16px;"></span>
            </div>
            <!-- Counts Column -->
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center gap-2">
                <div class="placeholder wcmc-skeleton-circle"></div>
                <span class="placeholder" style="width: 40px; height: 14px;"></span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <div class="placeholder wcmc-skeleton-circle"></div>
                <span class="placeholder" style="width: 50px; height: 14px;"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Arrow -->
        <div class="flex-shrink-0 d-flex align-items-center justify-content-center">
          <div class="placeholder" style="width: 7px; height: 17px;"></div>
        </div>
      </div>

      <!-- Desktop Layout: All columns in row -->
      <!-- Logo Column -->
      <div class="d-none d-md-block col-md-2 col-lg-1 col-xl-1 d-flex align-items-center justify-content-center px-0">
        <div class="d-flex align-items-center justify-content-center">
          <div class="placeholder" style="width: 55px; height: 55px; border-radius: 4px;"></div>
        </div>
      </div>

      <!-- Name and CAP Column -->
      <div class="d-none d-md-block col-md-2 col-lg-2 col-xl-2 d-flex flex-column gap-2 px-3">
        <div class="placeholder-glow">
          <span class="placeholder col-8"></span>
        </div>
        <div class="placeholder-glow">
          <span class="placeholder col-6"></span>
        </div>
      </div>

      <!-- Website Column -->
      <div class="d-none d-md-block col-md-4 col-lg-4 col-xl-4 d-flex align-items-center gap-2 px-3">
        <div class="placeholder-glow d-flex align-items-center gap-2">
          <div class="placeholder" style="width: 14px; height: 14px;"></div>
          <span class="placeholder col-10"></span>
        </div>
      </div>

      <!-- Email Column -->
      <div class="d-none d-md-block col-md-2 col-lg-2 col-xl-2 d-flex align-items-center gap-2 px-3">
        <div class="placeholder-glow d-flex align-items-center gap-2">
          <div class="placeholder" style="width: 14px; height: 12px;"></div>
          <span class="placeholder col-9"></span>
        </div>
      </div>

      <!-- FIERE Badge Column -->
      <div class="d-none d-md-block col-md-1 col-lg-1 col-xl-1 px-2" style="min-width: 0;">
        <div class="d-flex flex-row align-items-center gap-1 flex-nowrap" style="white-space: nowrap;">
          <span class="placeholder flex-shrink-0" style="width: 40px; height: 12px;"></span>
          <div class="placeholder flex-shrink-0 wcmc-skeleton-circle"></div>
        </div>
      </div>

      <!-- MERCATI Badge Column -->
      <div class="d-none d-md-block col-md-1 col-lg-1 col-xl-1 px-2" style="min-width: 0;">
        <div class="d-flex flex-row align-items-center gap-1 flex-nowrap" style="white-space: nowrap;">
          <span class="placeholder flex-shrink-0" style="width: 50px; height: 12px;"></span>
          <div class="placeholder flex-shrink-0 wcmc-skeleton-circle"></div>
        </div>
      </div>

      <!-- Arrow Column -->
      <div class="d-none d-md-block col-md-1 col-lg-1 col-xl-1 d-flex align-items-center justify-content-center px-0">
        <div class="d-flex align-items-center justify-content-center">
          <div class="placeholder" style="width: 7px; height: 17px;"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommunityListSkeleton',
  props: {
    count: {
      type: Number,
      default: 8
    }
  },
};
</script>
