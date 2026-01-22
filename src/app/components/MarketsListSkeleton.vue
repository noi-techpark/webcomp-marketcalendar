<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-market-week-view row g-4">
    <div
      v-for="i in 7"
      :key="i"
      class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 col-xxl d-flex px-1 flex-column"
    >
      <div class="wcmc-market-day-column p-2 rounded border">
        <!-- Day Header -->
        <div class="wcmc-market-day-header d-flex align-items-center justify-content-between gap-2 mb-3">
          <div class="placeholder-glow">
            <span class="placeholder" style="width: 80px; height: 20px;"></span>
          </div>
          <div class="placeholder" style="width: 24px; height: 24px; border-radius: 50%;"></div>
        </div>
        
        <!-- Cards -->
        <div class="wcmc-market-day-column__items d-flex flex-column gap-2">
          <div
            v-for="j in cardsPerColumn"
            :key="j"
            class="wcmc-market-day-card d-flex flex-row align-items-start gap-3 p-3 rounded mb-2 border"
          >
            <!-- Content left side -->
            <div class="wcmc-market-day-card__content d-flex flex-column gap-2 flex-fill min-w-0">
              <!-- Location with pushpin icon -->
              <div class="wcmc-market-day-card__location d-flex align-items-start gap-2">
                <div class="placeholder" style="width: 16px; height: 16px; flex-shrink: 0;"></div>
                <div class="placeholder-glow flex-fill">
                  <span class="placeholder col-10"></span>
                  <span class="placeholder col-8"></span>
                </div>
              </div>

              <!-- Region -->
              <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
                <div class="placeholder-glow">
                  <span class="placeholder col-6"></span>
                </div>
              </div>

              <!-- Frequency with calendar icon -->
              <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
                <div class="placeholder" style="width: 16px; height: 16px; flex-shrink: 0;"></div>
                <div class="placeholder-glow">
                  <span class="placeholder col-5"></span>
                </div>
              </div>

              <!-- Months list with book icon -->
              <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
                <div class="placeholder" style="width: 16px; height: 16px; flex-shrink: 0;"></div>
                <div class="placeholder-glow">
                  <span class="placeholder col-8"></span>
                </div>
              </div>
            </div>

            <!-- Image right side -->
            <div class="wcmc-market-day-card__image flex-shrink-0 rounded overflow-hidden align-self-start" style="width: 64px; height: 64px;">
              <div class="placeholder w-100 h-100"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MarketsListSkeleton',
  props: { 
    cardsPerColumn: { 
      type: Number, 
      default: 8 
    } 
  },
};
</script>
