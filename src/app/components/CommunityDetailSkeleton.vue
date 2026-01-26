<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-community-detail__content">
    <div class="wcmc-community-detail__main">
      <!-- Main Row: Logo, Name, Info and Referent -->
      <div class="row g-0">
        <!-- Left Column: Logo, Name and Contact Info -->
        <div class="col-12 col-lg-9 col-md-8 mb-3 d-flex">
          <div class="wcmc-community-detail__header-name-logo-info rounded row g-0 p-4 h-100 w-100">
            <!-- Logo Column (Desktop) -->
            <div class="col-auto d-md-block d-none">
              <div class="wcmc-community-detail__header d-flex align-items-start">
                <div class="placeholder flex-shrink-0" style="width: 55px; height: 55px; border-radius: 4px;"></div>
              </div>
            </div>

            <!-- Mobile: Logo stacked above name -->
            <div class="col-12 d-md-none mb-3">
              <div class="wcmc-community-detail__header d-flex align-items-start">
                <div class="placeholder flex-shrink-0" style="width: 55px; height: 55px; border-radius: 4px;"></div>
              </div>
            </div>

            <!-- Name and Info Column -->
            <div class="col ps-md-3 ps-0">
              <div class="row g-0">
                <!-- Name Section -->
                <div class="col-12">
                  <div class="wcmc-community-detail__header-text d-flex flex-column gap-1">
                    <div class="placeholder-glow">
                      <span class="placeholder col-8" style="height: 28px;"></span>
                    </div>
                  </div>
                </div>

                <!-- Informazioni comunità -->
                <div class="col-12 mt-3">
                  <div class="row g-3 g-md-2">
                    <div v-for="i in 4" :key="i" class="col-6 col-md-6 col-lg-3">
                      <div class="wcmc-community-detail__info-item d-flex align-items-start gap-2">
                        <div class="placeholder flex-shrink-0" style="width: 14px; height: 14px; margin-top: 2px;"></div>
                        <div class="wcmc-community-detail__info-content d-flex flex-column gap-1 flex-fill">
                          <span class="placeholder col-6" style="height: 12px;"></span>
                          <span class="placeholder col-10" style="height: 14px;"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Referent Sidebar (Desktop) -->
        <div class="col-12 col-lg-3 col-md-4 ps-2 d-none d-md-block d-flex">
          <div class="mb-3 w-100">
            <div class="wcmc-community-detail__sidebar h-100">
              <div class="wcmc-community-detail__referent d-flex flex-column p-4 gap-3 h-100 rounded">
                <div class="placeholder-glow">
                  <span class="placeholder col-6" style="height: 22px;"></span>
                </div>
                <div class="placeholder-glow">
                  <span class="placeholder col-8"></span>
                  <span class="placeholder col-7"></span>
                </div>
                <div class="d-flex gap-2 mt-auto">
                  <div class="placeholder flex-fill" style="height: 38px; border-radius: 0.375rem;"></div>
                  <div class="placeholder flex-fill" style="height: 38px; border-radius: 0.375rem;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Referent Section (Mobile only) -->
      <div class="row g-0 d-md-none">
        <div class="col-12">
          <div class="mb-3">
            <div class="wcmc-community-detail__sidebar">
              <div class="wcmc-community-detail__referent d-flex flex-column p-4 gap-3 rounded">
                <div class="placeholder-glow">
                  <span class="placeholder col-6" style="height: 22px;"></span>
                </div>
                <div class="placeholder-glow">
                  <span class="placeholder col-8"></span>
                  <span class="placeholder col-7"></span>
                </div>
                <div class="d-flex gap-2 mt-auto">
                  <div class="placeholder flex-fill" style="height: 38px; border-radius: 0.375rem;"></div>
                  <div class="placeholder flex-fill" style="height: 38px; border-radius: 0.375rem;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map and Related Sections Container -->
      <div class="row g-0">
        <!-- Left Column: Map -->
        <div class="col-12 col-lg-4 mb-4 mb-lg-0">
          <div class="wcmc-community-detail__map-container w-100 py-2">
            <div class="placeholder w-100 h-100 rounded" style="min-height: 400px;"></div>
          </div>
        </div>

        <!-- Right Column: Related Sections -->
        <div class="col-12 col-lg-8 ps-lg-4">
          <div class="row g-0">
            <!-- Related Fairs Section -->
            <div class="col-12 mb-4">
              <div class="wcmc-community-detail__related-section wcmc-community-detail__related-section--fairs">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="placeholder-glow d-flex align-items-center gap-2">
                    <span class="placeholder col-6" style="height: 22px;"></span>
                    <span class="placeholder" style="width: 32px; height: 22px; border-radius: 999px;"></span>
                  </div>
                  <div class="d-flex gap-2">
                    <div class="placeholder" style="width: 36px; height: 36px; border-radius: 0.375rem;"></div>
                    <div class="placeholder" style="width: 36px; height: 36px; border-radius: 0.375rem;"></div>
                  </div>
                </div>
                <div
                  class="wcmc-community-detail__related-cards wcmc-slider-container d-flex flex-row gap-3 align-items-stretch flex-nowrap overflow-hidden pb-2"
                >
                  <div
                    v-for="i in relatedCardsCount"
                    :key="`fair-${i}`"
                    class="wcmc-community-detail__related-card flex-shrink-0 d-flex flex-column"
                  >
                    <div class="wcmc-fair-card d-flex flex-column rounded overflow-hidden h-100">
                      <div class="wcmc-fair-card__image-wrapper position-relative p-2">
                        <div class="placeholder w-100 rounded" style="aspect-ratio: 315 / 224;"></div>
                        <span class="placeholder position-absolute top-0 end-0 m-3" style="width: 64px; height: 18px; border-radius: 4px; top: 15px; right: 15px;"></span>
                      </div>
                      <div class="wcmc-fair-card__body d-flex flex-column gap-1 flex-fill min-h-0 px-2 pb-2">
                        <div class="placeholder-glow">
                          <span class="placeholder col-8"></span>
                          <span class="placeholder col-6"></span>
                          <span class="placeholder col-10"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Related Markets Section -->
            <div class="col-12">
              <div class="wcmc-community-detail__related-section wcmc-community-detail__related-section--markets">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="placeholder-glow d-flex align-items-center gap-2">
                    <span class="placeholder col-6" style="height: 22px;"></span>
                    <span class="placeholder" style="width: 32px; height: 22px; border-radius: 999px;"></span>
                  </div>
                  <div class="d-flex gap-2">
                    <div class="placeholder" style="width: 36px; height: 36px; border-radius: 0.375rem;"></div>
                    <div class="placeholder" style="width: 36px; height: 36px; border-radius: 0.375rem;"></div>
                  </div>
                </div>
                <div
                  class="wcmc-community-detail__related-cards wcmc-slider-container d-flex flex-row gap-3 align-items-stretch flex-nowrap overflow-hidden pb-2"
                >
                  <div
                    v-for="i in relatedCardsCount"
                    :key="`market-${i}`"
                    class="wcmc-community-detail__related-card flex-shrink-0 d-flex flex-column"
                  >
                    <div class="wcmc-fair-card d-flex flex-column rounded overflow-hidden h-100">
                      <div class="wcmc-fair-card__image-wrapper position-relative p-2">
                        <div class="placeholder w-100 rounded" style="aspect-ratio: 315 / 224;"></div>
                        <span class="placeholder position-absolute top-0 end-0 m-3" style="width: 64px; height: 18px; border-radius: 4px; top: 15px; right: 15px;"></span>
                      </div>
                      <div class="wcmc-fair-card__body d-flex flex-column gap-1 flex-fill min-h-0 px-2 pb-2">
                        <div class="placeholder-glow">
                          <span class="placeholder col-8"></span>
                          <span class="placeholder col-6"></span>
                          <span class="placeholder col-10"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommunityDetailSkeleton',
  props: {
    relatedCardsCount: { type: Number, default: 4 },
  },
};
</script>

