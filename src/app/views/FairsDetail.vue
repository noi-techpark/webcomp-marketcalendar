<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-detail">
    <!-- Breadcrumb -->
    <Breadcrumb :items="breadcrumbItems" :store="store" />

    <ErrorAlert v-if="ds.error" :message="ds.error" />

    <SkeletonList v-if="ds.loading && !item" :count="3" />

    <div v-else-if="!item" class="alert alert-warning">Item not found.</div>

    <div v-else>
      <!-- Title -->
     

      <!-- MOBILE Hero Section -->
      <div class="d-xl-none wcmc-detail-mobile-hero rounded overflow-hidden position-relative mb-4" 
           :style="mobileHeroBackgroundStyle">
        <!-- Dark Overlay -->
        <div class="wcmc-detail-mobile-overlay position-absolute top-0 start-0 w-100 h-100"></div>
        
        <!-- Content -->
        <div class="position-relative p-3 wcmc-z-index-1">
          <!-- Title and Actions -->
          <div class="d-flex justify-content-between align-items-start mb-4">
            <h1 class="wcmc-detail-mobile-title text-white mb-0 me-3">{{ item.title }}</h1>
            <div class="d-flex gap-2 flex-shrink-0">
              <button class="btn btn-primary d-flex align-items-center gap-2" type="button" @click="addToCalendar">
                <span>Aggiungi</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
              </button>
              <button class="btn btn-primary p-2" type="button" @click="shareEvent" title="Share">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Info Sections -->
          <div class="wcmc-detail-mobile-info">
            <!-- Month/Date -->
            <div v-if="monthName" class="wcmc-detail-mobile-info-section mb-3">
              <div class="d-flex align-items-start gap-2">
                <svg class="flex-shrink-0 mt-1" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
                <div>
                  <div class="text-white text-uppercase fw-bold mb-1">{{ monthName }}</div>
                  <div class="text-white opacity-75">{{ fullDate || "-" }}</div>
                </div>
              </div>
            </div>

            <!-- Schedule -->
            <div v-if="openingHours || USE_MOCK_DATA" class="wcmc-detail-mobile-info-section mb-3">
              <div class="d-flex align-items-start gap-2">
                <svg class="flex-shrink-0 mt-1" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <div>
                  <div class="text-white text-uppercase fw-bold mb-1">{{ t('schedule') }}</div>
                  <div class="text-white opacity-75">{{ openingHours || "-" }}</div>
                </div>
              </div>
            </div>

            <!-- Location -->
            <div v-if="item.municipality" class="wcmc-detail-mobile-info-section mb-3">
              <div class="d-flex align-items-start gap-2">
                <svg class="flex-shrink-0 mt-1" width="16" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div>
                  <div class="text-white text-uppercase fw-bold mb-1">{{ locationWithProvince }}</div>
                  <a v-if="districtGoogleMapsUrl" :href="districtGoogleMapsUrl" target="_blank" 
                     class="text-white opacity-75 text-decoration-underline">
                    {{ fullAddress || "-" }}
                  </a>
                  <div v-else class="text-white opacity-75">{{ fullAddress || "-" }}</div>
                </div>
              </div>
            </div>

            <!-- Frequency -->
            <div v-if="raw" class="wcmc-detail-mobile-info-section mb-3">
              <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
                <svg class="wcmc-market-day-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                </svg>
                <span class="text-white">{{ frequency }}</span>
              </div>
            </div>

            <!-- Typology -->
            <div v-if="categoryBadges.length > 0 || USE_MOCK_DATA" class="wcmc-detail-mobile-info-section mb-3">
              <div class="text-white text-uppercase fw-bold mb-2">{{ t('typology') }}</div>
              <span class="wcmc-detail-typology-badge badge text-uppercase">{{ categoryBadges[0] || "-" }}</span>
              <div v-if="displayCategories.length > 0" class="mt-2 text-white opacity-75">
                {{ displayCategories.join(', ') }}
              </div>
            </div>

            <!-- Gallery Link -->
            <div v-if="validCarouselImages.length > 1" class="wcmc-detail-mobile-info-section mb-3">
              <a href="#" @click.prevent="scrollToGallery" class="text-white text-decoration-underline fw-medium">
                Vai alla gallery
              </a>
            </div>

            <!-- Notes -->
            <div v-if="notes || USE_MOCK_DATA" class="wcmc-detail-mobile-info-section mb-3">
              <div class="text-white text-uppercase fw-bold mb-1">{{ t('notes') }}</div>
              <div class="text-white opacity-75">{{ notes || 'Parcheggio consigliato lato chiesa (gratuito.)' }}</div>
            </div>

            <!-- Download -->
            <div v-if="pdfUrl || USE_MOCK_DATA" class="wcmc-detail-mobile-info-section">
              <div class="text-white text-uppercase fw-bold mb-1">{{ t('download') }}</div>
              <a v-if="pdfUrl" :href="pdfUrl" class="text-white opacity-75 text-decoration-underline" target="_blank">
                {{ t('downloadPdf') }}
              </a>
              <span v-else class="text-white opacity-75">-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MOBILE Map Section -->
      <div v-if="mapCoords" class="d-xl-none wcmc-detail-mobile-map rounded overflow-hidden mb-4 p-2">
        <div class="p-3 pb-0">
          <h2 class="text-uppercase fw-bold mb-3 wcmc-section-title">{{ t('locationAndServices') }}</h2>
        </div>
        <div class="wcmc-detail-rect5-map position-relative w-100 overflow-hidden wcmc-map-container-height" style="color: #000">
          <div v-if="mapIframeUrl" class="card-body p-0 h-100">
            <p id="twrap" class="card-text text-center mb-0 h-100">
              <iframe id="tframe" class="w-100 h-100" style="border: none;" frameborder="0" :src="mapIframeUrl"></iframe>
            </p>
          </div>
        </div>
      </div>

      <!-- DESKTOP Hero Section -->
      <div class="d-none d-xl-block wcmc-detail-hero-card rounded p-4 mb-4">
        <div class="row g-4">

          <!-- LEFT: Carousel & Thumbnails -->
          <div class="col-12 col-lg-2 col-xl-2">
            <div class="mb-3">
              <div v-if="validCarouselImages.length > 0" :id="`fairCarousel-${id}`" class="carousel slide rounded overflow-hidden wcmc-aspect-ratio-1"
                ref="heroCarousel">
                <!-- Slides -->
                <div class="carousel-inner h-100">
                  <div v-for="(img, idx) in validCarouselImages" :key="`slide-${idx}`" class="carousel-item h-100"
                    :class="{ active: idx === 0 }">
                    <img v-if="!imageErrors[img]" 
                      :src="img" 
                      class="d-block w-100 h-100 wcmc-object-fit-cover wcmc-lightbox-trigger"
                      :alt="`${item.title} - Image ${idx + 1}`"
                      @error="handleImageError($event, img)"
                      @load="handleImageLoad(img)"
                      @click="openLightbox(idx)" />
                    <div v-else class="wcmc-fair-card__image--placeholder w-100 h-100 d-flex align-items-center justify-content-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Controls -->
                <button v-if="validCarouselImages.length > 1" class="carousel-control-prev" type="button"
                  :data-bs-target="`#fairCarousel-${id}`" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button v-if="validCarouselImages.length > 1" class="carousel-control-next" type="button"
                  :data-bs-target="`#fairCarousel-${id}`" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
              <!-- Placeholder when no images -->
              <div v-else class="wcmc-fair-card__image--placeholder w-100 rounded overflow-hidden wcmc-aspect-ratio-1 d-flex align-items-center justify-content-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
              </div>
            </div>

            <!-- Thumbnail Gallery with Pagination -->
            <div v-if="validCarouselImages.length > 0" class="wcmc-thumbnail-gallery w-100">

              <!-- Navigation Arrows + Thumbnails Container -->
              <div class="d-flex align-items-center gap-2">

                <!-- Left Arrow -->
                <button v-if="totalThumbnailPages > 1" @click="prevThumbnailPage" class="wcmc-thumb-nav-btn d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  aria-label="Previous thumbnails">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M11 1l-7 7 7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>

                <!-- Thumbnails -->
                <div class="d-flex gap-2 flex-grow-1">
                  <div v-for="(img, idx) in visibleThumbnails" :key="`thumb-${currentThumbnailPage}-${idx}`"
                    class="wcmc-thumbnail flex-shrink-0 rounded overflow-hidden wcmc-gallery-item" :class="{
                      'wcmc-thumbnail--active': getGlobalThumbnailIndex(idx) === activeSlideIndex,
                       'wcmc-thumbnail--dimmed': getGlobalThumbnailIndex(idx) !== activeSlideIndex
                     }" @click="goToSlide(getGlobalThumbnailIndex(idx))">
                    <img v-if="!imageErrors[img]"
                      class="w-100 h-100 wcmc-object-fit-cover" 
                      :src="img" 
                      :alt="`Thumbnail ${getGlobalThumbnailIndex(idx) + 1}`"
                      @error="handleImageError($event, img)"
                      @load="handleImageLoad(img)" />
                    <div v-else class="wcmc-fair-card__image--placeholder w-100 h-100 d-flex align-items-center justify-content-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Right Arrow -->
                <button v-if="totalThumbnailPages > 1" @click="nextThumbnailPage" class="wcmc-thumb-nav-btn d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  aria-label="Next thumbnails">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 1l7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
              </div>

              <!-- Dot Indicators -->
              <div v-if="totalThumbnailPages > 1" class="wcmc-thumb-dots d-flex gap-2 justify-content-center mt-2">
                <button v-for="pageIdx in thumbnailPageDots" :key="`dot-${pageIdx}`" @click="goToThumbnailPage(pageIdx)"
                  class="wcmc-thumb-dot rounded-circle border-0 p-0 wcmc-pagination-dot-base" :class="{ 'wcmc-thumb-dot--active': pageIdx === currentThumbnailPage }"
                  :aria-label="`Go to thumbnail page ${pageIdx + 1}`"></button>
              </div>
            </div>
          </div>

          <!-- RIGHT: Information -->
          <div class="col-12 col-lg-10 col-xl-10">
            <!-- Header: Actions -->
            <div class="row">
              <span class="wcmc-detail-title fs-4 mb-4 col-8">{{ item.title }}</span>
              <div class="d-flex justify-content-end align-items-start mb-4 gap-3 col-4">
                <div class="d-flex gap-2">
                  <button class="btn btn-primary" type="button" @click="addToCalendar">
                    {{ t('addToCalendar') }}
                  </button>
                  <button class="btn btn-primary" type="button" @click="shareEvent" title="Share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                    </svg>
                  </button>
                </div>
             </div>
            </div>

            <!-- Info Grid: 3 columns -->
            <div class="row g-4">

              <!-- Column 1: Date & Schedule -->
              <div class="col-12 col-md-3">
                <div v-if="monthName" class="text-uppercase fw-semibold mb-2">
                  <svg width="14" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                  </svg>
                  {{ monthName }}
                </div>
                <div v-if="fullDate" class="mb-3">
                  <span class="small wcmc-padding-left-dynamic-1">{{ fullDate || "-" }}</span>
                </div>

                <div v-if="openingHours || USE_MOCK_DATA" class="mb-3">
                  <div class="d-flex align-items-center gap-2 text-uppercase small fw-semibold mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    {{ t('schedule') }}
                  </div>
                  <div class="small wcmc-padding-left-dynamic-1">{{ openingHours || "-" }}</div>
                </div>
              </div>

              <!-- Column 2: Location & Frequency -->
              <div class="col-12 col-md-3">
                <div v-if="item.municipality" class="d-flex align-items-center gap-2 text-uppercase fw-semibold mb-3">
                  <svg width="10" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {{ locationWithProvince }}
                </div>

                <div v-if="fullAddress || USE_MOCK_DATA" class="mb-3">
                  <a 
                    v-if="districtGoogleMapsUrl" 
                    :href="districtGoogleMapsUrl" 
                    target="_blank"
                    class="small text-decoration-underline wcmc-padding-left-dynamic-2 wcmc-color-inherit"
                  >
                    {{ fullAddress || "-" }}
                  </a>
                  <div 
                    v-else 
                    class="small text-decoration-underline wcmc-padding-left-dynamic-2"
                  >
                    {{ fullAddress || "_" }}
                  </div>
                </div>

                <div v-if="raw" class="mb-3">
                  <div class="wcmc-market-day-card__meta d-flex align-items-center gap-2">
                    <svg class="wcmc-market-day-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                    <span>{{ frequency }}</span>
                  </div>
                </div>
              </div>

              <!-- Column 3: Categories -->
              <div class="col-12 col-md-3">
                <div v-if="categoryBadges.length > 0 || USE_MOCK_DATA" class="mb-3">
                  <div class="text-uppercase small fw-semibold mb-2">{{ t('typology') }}</div>
                  <span class="wcmc-detail-typology-badge badge text-uppercase">{{ categoryBadges[0] || "-" }}</span>
                </div>

                <div v-if="displayCategories.length > 0" class="mb-3 pt-3">
                  <div class="d-flex flex-wrap gap-2">
                    <span v-for="(badge, idx) in displayCategories" :key="idx"
                      class="wcmc-detail-category-item text-uppercase">
                      {{ badge }}
                    </span>
                  </div>
                </div>
              </div>
              <!-- Column 4: Notes -->
              <div class="col-12 col-md-3">
                <div v-if="notes || USE_MOCK_DATA" class="mb-3">
                  <div class="text-uppercase small fw-semibold mb-1">{{ t('notes') }}</div>
                  <div class="small">{{ notes || 'Parcheggio consigliato lato chiesa (gratuito.)' }}</div>
                </div>

                <div v-if="pdfUrl || USE_MOCK_DATA" class="mb-3">
                  <div class="text-uppercase small fw-semibold mb-1">{{ t('download') }}</div>
                  <a v-if="pdfUrl" :href="pdfUrl" class="wcmc-detail-link small" target="_blank">
                    {{ t('downloadPdf') }}
                  </a>
                  <span v-else class="small">-</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- More Information "MAGGIORI INFORMAZIONI" (x:48, y:1176 = x:28, y:1074 relative to Rectangle 5) -->
        <div v-if="additionalInfo" class="wcmc-detail-rect5-more-info mt-5">
          <h2 class="wcmc-detail-section-title fw-semibold text-uppercase mb-3">{{ t('moreInfo') }}</h2>
          <p class="wcmc-detail-section-content">{{ additionalInfo || "-" }}</p>
        </div>

        <!-- Location and Services "LOCATION E SERVIZI DISPONIBILI" (x:45, y:531 = x:25, y:429 relative to Rectangle 5) -->
        <div class="wcmc-detail-rect5-location-services mt-5">
          <h2 class="wcmc-detail-section-title fw-semibold text-uppercase mb-3">{{ t('locationAndServices') }}</h2>

          <!-- Map (1359x577px at x:45, y:561) -->
          <div v-if="mapCoords" class="wcmc-detail-rect5-map position-relative w-100 rounded overflow-hidden mt-4 wcmc-detail-map-height" style="color: #000">
            <div v-if="mapIframeUrl" class="card-body p-0 h-100">
              <p id="twrap" class="card-text text-center mb-0 h-100">
                <iframe id="tframe" class="w-100 h-100" style="border: none;" frameborder="0" :src="mapIframeUrl"></iframe>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Exhibitors Section -->
      <div class="wcmc-detail-exhibitors-section mt-5 p-3 rounded">
        
        <div class="alert alert-info" v-if="config.debug">
          Debug: Found {{ exhibitors.length }} exhibitors
          <pre>{{ JSON.stringify(exhibitors.slice(0, 2), null, 2) }}</pre>
        </div>

        <!-- Header: Title -->
        <div class="mb-3">
          <h2 class="wcmc-detail-section-title mb-0 d-flex align-items-center gap-2">
            <span>{{ t('exhibitors') }}</span>
            <span class="badge rounded-pill wcmc-exhibitors-count-badge">
              {{ exhibitors.length }}
            </span>
          </h2>
        </div>

        <!-- Filters Row -->
        <div class="d-flex gap-2 mb-3 wcmc-flex-nowrap">
          <!-- Category Filter Multiselect -->
          <div class="wcmc-filter-group position-relative wcmc-flex-1">
            <div 
              class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center justify-content-between wcmc-cursor-pointer wcmc-user-select-none" 
              @click="toggleCategoryDropdown"
              :class="{ 'border-primary': isCategoryDropdownOpen }"
            >
              <div class="text-truncate">
                <span v-if="exhibitorCategoryFilters.length === 0">{{ t('allCategories') }}</span>
                <span v-else>
                  {{ exhibitorCategoryFilters.length === 1 ? exhibitorCategoryFilters[0] : `${exhibitorCategoryFilters.length} ${t('categoriesSelected')}` }}
                </span>
              </div>
              <svg class="wcmc-filter-chevron ms-2 flex-shrink-0" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" :style="{ transform: isCategoryDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }">
                <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- Dropdown Menu -->
            <div v-if="isCategoryDropdownOpen" class="wcmc-multiselect-dropdown wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1" @click.stop>
              <!-- Search input for categories -->
              <div class="mb-2">
                <input
                  type="text"
                  class="form-control form-control-sm"
                  :placeholder="t('search')"
                  :value="categorySearchQuery"
                  @input="categorySearchQuery = $event.target.value"
                  @click.stop
                />
              </div>
              <div class="form-check mb-2">
                 <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="cat-all" 
                  :checked="exhibitorCategoryFilters.length === 0"
                  @change="toggleAllCategories"
                >
                <label class="form-check-label w-100 small wcmc-cursor-pointer" for="cat-all">
                  {{ t('allCategories') }}
                </label>
              </div>
              <hr class="my-1">
              <div v-for="cat in filteredExhibitorCategoriesForSearch" :key="cat" class="form-check mb-1">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  :id="`cat-${cat}`" 
                  :value="cat" 
                  v-model="exhibitorCategoryFilters"
                >
                <label class="form-check-label w-100 small wcmc-cursor-pointer" :for="`cat-${cat}`">
                  {{ cat }}
                </label>
              </div>
              <div v-if="filteredExhibitorCategoriesForSearch.length === 0 && categorySearchQuery.trim()" class="text-muted text-center p-2 small">
                {{ t('noResults') }}
              </div>
            </div>

            <!-- Overlay to close dropdown -->
            <div v-if="isCategoryDropdownOpen" class="position-fixed top-0 start-0 w-100 h-100 wcmc-cursor-default" style="z-index: 999;" @click="isCategoryDropdownOpen = false"></div>
          </div>
          
          <!-- Search Input -->
          <div class="wcmc-search-wrapper wcmc-flex-1">
            <div class="wcmc-search-box position-relative d-flex align-items-center">
              <input
                id="wcmc-exhibitor-search"
                name="exhibitor-search"
                type="search"
                class="wcmc-search-input form-control"
                placeholder="Cerca..."
                v-model="exhibitorSearchQuery"
              />
              <svg class="wcmc-search-icon position-absolute wcmc-icon-right" width="16" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- MOBILE Exhibitors List -->
        <div class="d-xl-none">
          <!-- Headers -->
          <div class="wcmc-mobile-exhibitors-headers pb-3">
            <div class="d-flex align-items-center justify-content-between text-uppercase wcmc-sort-select-base">
              <span>NOME ESPOSITORE / CATEGORIA / POSTEGGIO / INDIRIZZO / COORDINATE</span>
              <button class="btn btn-sm border-0 p-0 wcmc-sort-btn-size" @click="toggleSort('name')">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 3l3 3H5l3-3z"/>
                  <path d="M8 13l-3-3h6l-3 3z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Exhibitor Cards -->
          <div class="wcmc-mobile-exhibitors-list">
            <div v-for="(exhibitor, idx) in paginatedExhibitors" :key="idx" 
                 class="wcmc-mobile-exhibitor-card py-3 mb-0">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h3 class="wcmc-mobile-exhibitor-name mb-0">{{ exhibitor.name }}</h3>
                <span v-if="exhibitor.category" class="wcmc-exhibitor-category-badge badge text-uppercase flex-shrink-0 ms-2">
                  {{ exhibitor.category }}
                </span>
              </div>
              <div class="wcmc-mobile-exhibitor-details">
                <div class="d-flex flex-wrap gap-3 small">
                  <span v-if="exhibitor.stall">{{ exhibitor.stall }}</span>
                  <span v-if="exhibitor.stall && exhibitor.address" class="opacity-50">|</span>
                  <span v-if="exhibitor.address">{{ exhibitor.address }}</span>
                </div>
                <div v-if="exhibitor.gpsInfo">
                  <a :href="`https://www.google.com/maps?q=${exhibitor.gpsInfo.lat},${exhibitor.gpsInfo.lon}`"
                     target="_blank" 
                     class="text-decoration-underline small wcmc-color-inherit">
                    {{ exhibitor.gpsInfo.lat }}, {{ exhibitor.gpsInfo.lon }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- DESKTOP Table -->
        <div class="table-responsive d-none d-xl-block">
          <table class="table align-middle wcmc-exhibitors-table">
            <thead>
              <tr>
                <th scope="col" class="sortable wcmc-cursor-pointer" @click="toggleSort('name')">
                  {{ t('exhibitorName') }}
                  <img
                    :key="theme"
                    :src="theme === 'light' ? orderLightSvg : orderDarkSvg"
                    alt="Order"
                    class="wcmc-th-sort-icon"
                  />
                </th>
                <th scope="col">{{ t('category') }}</th>
                <th scope="col">{{ t('stall') }}</th>
                <th scope="col">{{ t('address') }}</th>
                <th scope="col">COORDINATE GPS</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(exhibitor, idx) in paginatedExhibitors" :key="idx">
                <td>{{ exhibitor.name }}</td>
                <td>
                  <span v-if="exhibitor.category" class="wcmc-exhibitor-category-badge badge text-uppercase">
                    {{ exhibitor.category }}
                  </span>
                </td>
                <td>{{ exhibitor.stall }}</td>
                <td>{{ exhibitor.address }}</td>
                <td>
                  <a v-if="exhibitor.gpsInfo"
                    :href="`https://www.google.com/maps?q=${exhibitor.gpsInfo.lat},${exhibitor.gpsInfo.lon}`"
                    target="_blank" 
                    class="text-decoration-underline wcmc-color-inherit">
                    {{ exhibitor.gpsInfo.lat }}, {{ exhibitor.gpsInfo.lon }}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <nav v-if="exhibitorsPages > 1" aria-label="Exhibitors pagination" class="wcmc-pager d-flex gap-2 justify-content-center justify-content-md-end mt-3">
          <button
            class="wcmc-pager-btn wcmc-pager-btn--arrow"
            type="button"
            :disabled="exhibitorsPage === 1"
            aria-label="Previous page"
            @click="exhibitorsPage = exhibitorsPage - 1"
          >
            <svg width="5" height="13" viewBox="0 0 5 13" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 1L1 6.5L4 12"/>
            </svg>
          </button>

          <button 
            v-for="page in visibleExhibitorPages" 
            :key="page"
            class="wcmc-pager-btn"
            :class="{ 'is-active': page === exhibitorsPage }"
            type="button"
            :disabled="page === '...' || page === exhibitorsPage"
            :aria-label="page === '...' ? undefined : `Go to page ${page}`"
            :aria-current="page === exhibitorsPage ? 'page' : undefined"
            @click="page !== '...' && page !== exhibitorsPage && (exhibitorsPage = page)"
          >
            {{ page }}
          </button>

          <button
            class="wcmc-pager-btn wcmc-pager-btn--arrow"
            type="button"
            :disabled="exhibitorsPage >= exhibitorsPages"
            aria-label="Next page"
            @click="exhibitorsPage = exhibitorsPage + 1"
          >
            <svg width="5" height="13" viewBox="0 0 5 13" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M1 1L4 6.5L1 12"/>
            </svg>
          </button>
        </nav>
      </div>

      <!-- Image Gallery Section -->
      <div class="d-xl-none mt-4">
        <div v-if="validCarouselImages.length > 0" class="row g-2">
          <!-- Main Carousel (Left) -->
          <div class="col-9 col-lg-10">
             <div :id="`fairCarousel-${id}`" class="carousel slide rounded overflow-hidden wcmc-carousel-height" ref="heroCarousel">
                <!-- Slides -->
                <div class="carousel-inner h-100">
                  <div v-for="(img, idx) in validCarouselImages" :key="`slide-${idx}`" class="carousel-item h-100" :class="{ active: idx === 0 }">
                    <img v-if="!imageErrors[img]"
                      :src="img" 
                      class="d-block w-100 h-100 wcmc-object-fit-cover wcmc-lightbox-trigger" 
                      :alt="`${item.title} - Image ${idx + 1}`"
                      @error="handleImageError($event, img)"
                      @load="handleImageLoad(img)"
                      @click="openLightbox(idx)" />
                    <div v-else class="wcmc-fair-card__image--placeholder w-100 h-100 d-flex align-items-center justify-content-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <!-- Controls -->
                <button v-if="validCarouselImages.length > 1" class="carousel-control-prev" type="button" :data-bs-target="`#fairCarousel-${id}`" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button v-if="validCarouselImages.length > 1" class="carousel-control-next" type="button" :data-bs-target="`#fairCarousel-${id}`" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
          </div>

          <!-- Vertical Thumbnails (Right) -->
          <div class="col-3 col-lg-2">
              <div v-if="validCarouselImages.length > 0" class="wcmc-thumbnail-gallery h-100">
                  <div class="d-flex flex-column gap-2 h-100">
                      <!-- Thumbnails (showing first 4 or visible ones based on height) -->
                      <!-- Force overflow hidden or allow scroll if needed, but styling implies static list -->
                      <div v-for="(img, idx) in validCarouselImages.slice(0, 4)" :key="`thumb-mobile-${idx}`" 
                           class="wcmc-thumbnail flex-shrink-0 rounded overflow-hidden position-relative wcmc-thumbnail-item" 
                           :class="{ 
                             'wcmc-thumbnail--active': idx === activeSlideIndex, 
                             'wcmc-thumbnail--dimmed': idx !== activeSlideIndex 
                           }" 
                           @click="goToSlide(idx)">
                        <img v-if="!imageErrors[img]"
                          class="w-100 h-100 wcmc-object-fit-cover" 
                          :src="img" 
                          :alt="`Thumbnail ${idx + 1}`"
                          @error="handleImageError($event, img)"
                          @load="handleImageLoad(img)" />
                        <div v-else class="wcmc-fair-card__image--placeholder w-100 h-100 d-flex align-items-center justify-content-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21,15 16,10 5,21"/>
                          </svg>
                        </div>
                        <!-- Active Border/Overlay if needed, currently handled by class -->
                        <div v-if="idx === activeSlideIndex" class="position-absolute top-0 start-0 w-100 h-100 rounded"></div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
        <!-- Placeholder when no images -->
        <div v-else class="wcmc-fair-card__image--placeholder w-100 rounded overflow-hidden wcmc-carousel-height d-flex align-items-center justify-content-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        </div>
      </div>

      <!-- Similar/Nearby Fairs Section -->
      <div v-if="similarFairs.length > 0 || nearbyFairs.length > 0" class="wcmc-related-fairs-section mt-2 py-4 px-3">
        <!-- Tabs -->
        <div class="wcmc-related-tabs d-flex gap-2 mb-4 ">
          <button 
            @click="similarFairsTab = 'similar'" 
            :class="{ active: similarFairsTab === 'similar' }"
            class="wcmc-tab-btn border-0 rounded px-4 py-3 fw-medium">
            {{ t('similarFairs') }}
          </button>
          <button 
            @click="similarFairsTab = 'nearby'" 
            :class="{ active: similarFairsTab === 'nearby' }"
            class="wcmc-tab-btn border-0 rounded px-4 py-3 fw-medium">
            {{ t('nearbyFairs') }}
          </button>
        </div>

        <!-- Slider Container -->
        <div v-if="isLoadingRelated" class="text-center py-5">
          <div class="spinner-border" role="status"></div>
        </div>
        
        <div v-else-if="displayedRelatedFairs.length > 0" class="wcmc-slider-container position-relative ">
          <!-- Left Arrow -->
          <button class="wcmc-slider-arrow wcmc-slider-arrow-left position-absolute top-50 translate-middle-y border-0 bg-transparent d-flex align-items-center justify-content-center wcmc-slider-arrow-pos-left" @click="slideLeft" :disabled="isSliding">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <!-- Cards Slider -->
          <div class="wcmc-slider-track d-flex gap-4 overflow-x-auto align-items-stretch p-2 wcmc-slider-track-base" ref="sliderTrack">
            <div 
              v-for="fair in displayedRelatedFairs" 
              :key="fair.id"
              class="flex-shrink-0 wcmc-slider-card-item wcmc-flex-min-width-0">
              <ItemCard 
                :item="fair" 
                :lang="config.language" 
                :large-padding="true"
                @details="(item) => navigateToFair(item.id)" 
              />
            </div>
          </div>

          <!-- Right Arrow -->
          <button class="wcmc-slider-arrow wcmc-slider-arrow-right position-absolute top-50 translate-middle-y border-0 bg-transparent d-flex align-items-center justify-content-center wcmc-slider-arrow-pos-right" @click="slideRight" :disabled="isSliding">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div v-else class="text-center text-muted py-4">
          No {{ similarFairsTab === 'similar' ? 'similar' : 'nearby' }} fairs found.
        </div>
      </div>

      <!-- Contact Information Card -->
      <div v-if="hasContactInfo" class="wcmc-detail-hero-card rounded p-4 mt-4">
        <!-- Desktop Layout -->
        <div class="d-none d-xl-block">
          <div class="row">
            <!-- LEFT: Logo/Icon -->
            <div class="col-lg-1">
              <div v-if="communityContactData?.logoUrl" class="wcmc-contact-logo-container rounded overflow-hidden wcmc-logo-container">
                <img :src="communityContactData.logoUrl" :alt="communityContactData.name || 'Logo'" class="wcmc-logo-img w-100 h-100" />
              </div>
              <div v-else class="wcmc-contact-logo-container rounded w-100 h-100 wcmc-logo-placeholder">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="wcmc-logo-svg">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D2D2D" stroke-width="2" fill="none"/>
                </svg>
              </div>
            </div>

            <!-- RIGHT: Textual Information -->
            <div class="col-lg-11">
              <!-- Top Row: Community Information -->
              <div v-if="communityContactData" class="row mb-4">
                <div class="col-12 mb-3">
                  <h3 class="text-uppercase fw-semibold mb-0 wcmc-contact-title">{{ communityContactData.name || t('communityName') }}</h3>
                </div>
                <div class="col-lg-3 mb-2 mb-lg-0">
                  <div class="small">{{ communityContactData.address || "-" }}</div>
                </div>
                <div class="col-lg-3 mb-2 mb-lg-0">
                  <div v-if="communityContactData.website" class="small">
                    <a :href="communityContactData.website" target="_blank" class="wcmc-detail-link text-decoration-underline text-break">{{ communityContactData.website }}</a>
                  </div>
                  <div v-else class="small">-</div>
                </div>
                <div class="col-lg-3 mb-2 mb-lg-0">
                  <div v-if="communityContactData.phone" class="small">
                    <a :href="`tel:${communityContactData.phone}`" class="wcmc-detail-link text-decoration-underline">{{ communityContactData.phone }}</a>
                  </div>
                  <div v-else class="small">-</div>
                </div>
                <div class="col-lg-3">
                  <div v-if="communityContactData.pec" class="small">{{ communityContactData.pec }}</div>
                  <div v-else class="small">-</div>
                </div>
              </div>

              <!-- Bottom Row: Referent Information -->
              <div v-if="referentContactData" class="row">
                <div class="col-12 mb-3">
                  <h3 class="text-uppercase fw-semibold mb-0 wcmc-contact-title">{{ t('contactPerson') }}</h3>
                </div>
                <div class="col-lg-3 mb-2 mb-lg-0">
                  <div class="small">{{ referentContactData.name || "-" }}</div>
                </div>
                <div class="col-lg-3 mb-2 mb-lg-0">
                  <div v-if="referentContactData.phone" class="small">
                    <a :href="`tel:${referentContactData.phone}`" class="wcmc-detail-link text-decoration-underline">{{ referentContactData.phone }}</a>
                  </div>
                  <div v-else class="small">-</div>
                </div>
                <div class="col-lg-3 mb-2 mb-lg-0">
                  <div v-if="referentContactData.email" class="small">
                    <a :href="`mailto:${referentContactData.email}`" class="wcmc-detail-link text-decoration-underline text-break">{{ referentContactData.email }}</a>
                  </div>
                  <div v-else class="small">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile/Tablet Layout -->
        <div class="d-xl-none">
          <!-- Logo -->
          <div class="mb-4">
            <div v-if="communityContactData?.logoUrl" class="wcmc-contact-logo-container rounded overflow-hidden wcmc-logo-container" style="width: 80px; height: 80px;">
              <img :src="communityContactData.logoUrl" :alt="communityContactData.name || 'Logo'" class="wcmc-logo-img w-100 h-100" />
            </div>
            <div v-else class="wcmc-contact-logo-container rounded wcmc-logo-placeholder" style="width: 80px; height: 80px;">
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="wcmc-logo-svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#2D2D2D" stroke-width="2" fill="none"/>
              </svg>
            </div>
          </div>

          <!-- Community Information -->
          <div v-if="communityContactData" class="mb-4">
            <h3 class="text-uppercase fw-semibold mb-3 wcmc-contact-title">{{ communityContactData.name || t('communityName') }}</h3>
            <div class="d-flex flex-column gap-2">
              <div v-if="communityContactData.address" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">{{ t('address') }}</span>
                <span>{{ communityContactData.address }}</span>
              </div>
              <div v-if="communityContactData.phone" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">{{ t('phone') }}</span>
                <a :href="`tel:${communityContactData.phone}`" class="wcmc-detail-link text-decoration-underline">{{ communityContactData.phone }}</a>
              </div>
              <div v-if="communityContactData.website" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">{{ t('website') }}</span>
                <a :href="communityContactData.website" target="_blank" class="wcmc-detail-link text-decoration-underline text-break">{{ communityContactData.website }}</a>
              </div>
              <div v-if="communityContactData.pec" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">PEC</span>
                <span>{{ communityContactData.pec }}</span>
              </div>
            </div>
          </div>

          <!-- Referent Information -->
          <div v-if="referentContactData" class="mb-4">
            <h3 class="text-uppercase fw-semibold mb-3 wcmc-contact-title">{{ t('contactPerson') }}</h3>
            <div class="d-flex flex-column gap-2">
              <div v-if="referentContactData.name" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">{{ t('nameSurname') }}</span>
                <span>{{ referentContactData.name }}</span>
              </div>
              <div v-if="referentContactData.phone" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">{{ t('phone') }}</span>
                <a :href="`tel:${referentContactData.phone}`" class="wcmc-detail-link text-decoration-underline">{{ referentContactData.phone }}</a>
              </div>
              <div v-if="referentContactData.email" class="small">
                <span class="text-uppercase fw-semibold d-block mb-1">{{ t('email') }}</span>
                <a :href="`mailto:${referentContactData.email}`" class="wcmc-detail-link text-decoration-underline text-break">{{ referentContactData.email }}</a>
              </div>
            </div>
          </div>

          
        </div>
      </div>

    </div>

    <!-- Lightbox Modal -->
    <div v-if="lightboxOpen" class="wcmc-lightbox-modal" @click="closeLightbox" @keydown.esc="closeLightbox">
      <div class="wcmc-lightbox-content" @click.stop>
        <!-- Close Button -->
        <button class="wcmc-lightbox-close" @click="closeLightbox" aria-label="Close lightbox">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Previous Button -->
        <button 
          v-if="validCarouselImages.length > 1"
          class="wcmc-lightbox-nav wcmc-lightbox-prev" 
          @click.stop="prevLightboxImage"
          aria-label="Previous image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <!-- Image -->
        <div class="wcmc-lightbox-image-wrapper">
          <img 
            v-if="currentLightboxImage"
            :src="currentLightboxImage" 
            :alt="`${item.title} - Image ${lightboxIndex + 1}`"
            class="wcmc-lightbox-image"
            @error="handleImageError($event, currentLightboxImage)" />
        </div>

        <!-- Next Button -->
        <button 
          v-if="validCarouselImages.length > 1"
          class="wcmc-lightbox-nav wcmc-lightbox-next" 
          @click.stop="nextLightboxImage"
          aria-label="Next image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        <!-- Image Counter -->
        <div v-if="validCarouselImages.length > 1" class="wcmc-lightbox-counter">
          {{ lightboxIndex + 1 }} / {{ validCarouselImages.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { normalizeOdhItem, getExhibitors, getFrequency, getOpeningHours, getFullAddress } from '../../utils/normalize';
import SkeletonList from '../components/SkeletonList.vue';
import ErrorAlert from '../components/ErrorAlert.vue';
import ItemCard from '../components/ItemCard.vue';
import { loadExternalScriptOnce } from '../../utils/loadExternalScriptOnce';
import { Carousel } from 'bootstrap';
import orderDarkSvg from '../svgs/order_dark.svg';
import orderLightSvg from '../svgs/order_light.svg';

// Set to true to see mock data for testing the layout
const USE_MOCK_DATA = true;

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
};

const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
};

const TRANSLATIONS = {
  en: {
    schedule: 'SCHEDULE',
    frequency: 'FREQUENCY',
    category: 'CATEGORY',
    address: 'ADDRESS',
    typology: 'TYPOLOGY',
    moreInfo: 'MORE INFORMATION',
    locationAndServices: 'LOCATION AND SERVICES',
    notes: 'NOTES',
    download: 'DOWNLOAD',
    downloadPdf: 'Download PDF poster',
    exhibitors: 'Exhibitors',
    exhibitorName: 'Exhibitor Name',
    stall: 'Stall',
    whatAreYouLookingFor: 'Search...',
    allCategories: 'All categories',
    categoriesSelected: 'selected',
    takeMeThere: 'Take me there',
    addToCalendar: 'Add to calendar',
    communityName: 'COMMUNITY NAME',
    contact: 'Contact',
    contactPerson: 'CONTACT PERSON',
    nameSurname: 'Name Surname',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    pec: 'PEC',
    noContactInfo: 'No contact info.',
    similarFairs: 'Similar fairs',
    nearbyFairs: 'Nearby fairs',
    fairs: 'Fairs',
    markets: 'Markets',
    detail: 'Detail',
    search: 'Search...',
    noResults: 'No results found',
  },
  it: {
    schedule: 'ORARI',
    frequency: 'FREQUENZA',
    category: 'CATEGORIA',
    address: 'INDIRIZZO',
    typology: 'TIPOLOGIA',
    moreInfo: 'MAGGIORI INFORMAZIONI',
    locationAndServices: 'LOCATION E SERVIZI DISPONIBILI',
    notes: 'NOTE',
    download: 'DOWNLOAD',
    downloadPdf: 'Scarica locandina PDF',
    exhibitors: 'Espositori',
    exhibitorName: 'Nome espositore',
    stall: 'Posteggio',
    whatAreYouLookingFor: 'Cerca...',
    allCategories: 'Tutte le categorie',
    categoriesSelected: 'selezionate',
    takeMeThere: 'Portami qui',
    addToCalendar: 'Aggiungi al calendario',
    communityName: 'NOME COMUNITà',
    contact: 'Contatta',
    contactPerson: 'REFERENTE',
    nameSurname: 'Nome Cognome',
    phone: 'Telefono',
    email: 'Mail',
    website: 'Sito web',
    pec: 'PEC',
    noContactInfo: 'No contact info.',
    similarFairs: 'Fiere simili',
    nearbyFairs: 'Fiere vicine',
    fairs: 'Fiere',
    markets: 'Mercati',
    detail: 'Dettaglio',
    search: 'Cerca...',
    noResults: 'Nessun risultato trovato',
  },
  de: {
    schedule: 'ZEITPLAN',
    frequency: 'HÄUFIGKEIT',
    category: 'KATEGORIE',
    address: 'ADRESSE',
    typology: 'TYPOLOGIE',
    moreInfo: 'WEITERE INFORMATIONEN',
    locationAndServices: 'STANDORT UND VERFÜGBARE DIENSTE',
    notes: 'HINWEISE',
    download: 'DOWNLOAD',
    downloadPdf: 'PDF-Plakat herunterladen',
    exhibitors: 'Aussteller',
    exhibitorName: 'Ausstellername',
    stall: 'Stand',
    whatAreYouLookingFor: 'Suche...',
    allCategories: 'Alle Kategorien',
    categoriesSelected: 'ausgewählt',
    takeMeThere: 'Bring mich dorthin',
    addToCalendar: 'Zum Kalender hinzufügen',
    communityName: 'GEMEINDENAME',
    contact: 'Kontakt',
    contactPerson: 'ANSPRECHPARTNER',
    nameSurname: 'Name Nachname',
    phone: 'Telefon',
    email: 'E-Mail',
    website: 'Website',
    pec: 'PEC',
    noContactInfo: 'Keine Kontaktinformationen.',
    similarFairs: 'Ähnliche Messen',
    nearbyFairs: 'Messen in der Nähe',
    fairs: 'Messen',
    markets: 'Märkte',
    detail: 'Detail',
    search: 'Suchen...',
    noResults: 'Keine Ergebnisse gefunden',
  },
};

function pickLang(obj, lang) {
  if (!obj || typeof obj !== 'object') return null;
  return obj?.[lang] ?? obj?.en ?? obj?.it ?? obj?.de ?? null;
}

function contactToLines(rawContact) {
  if (!rawContact) return [];
  if (typeof rawContact === 'string') return [{ label: 'Contact', value: rawContact }];
  const lines = [];
  const email = rawContact?.Email ?? rawContact?.email;
  const phone = rawContact?.Phone ?? rawContact?.phone;
  const url = rawContact?.Url ?? rawContact?.Website ?? rawContact?.web;
  if (email) lines.push({ label: 'Email', value: String(email) });
  if (phone) lines.push({ label: 'Phone', value: String(phone) });
  if (url) lines.push({ label: 'Web', value: String(url) });
  return lines;
}

import Breadcrumb from '../components/Breadcrumb.vue';

export default {
  name: 'FairsDetail',
  components: { SkeletonList, ErrorAlert, Breadcrumb, ItemCard },
  props: {
    config: { type: Object, required: true },
    store: { type: Object, required: true },
    id: { type: String, required: true },
  },
  data() {
    return {
      scriptReady: false,
      embedError: '',
      exhibitorSearchQuery: '',
      exhibitorCategoryFilters: [], // Changed from string to array
      isCategoryDropdownOpen: false,
      categorySearchQuery: '',
      exhibitorsPage: 1,
      exhibitorsPerPage: 10,
      exhibitorSortColumn: 'name',
      exhibitorSortDirection: 'asc',
      detailItem: null,
      loadingDetail: false,
      detailError: null,
      carouselInstance: null,
      currentThumbnailPage: 0,  // Track which page of thumbnails is shown
      activeSlideIndex: 0,       // Track which slide is active in main carousel
      contactForm: {
        address: '',
        name: '',
        phone: '',
        phone2: '',
        email: '',
        website: '',
        pec: '',
      },
      similarFairsTab: 'similar', // 'similar' or 'nearby'
      similarFairs: [],
      nearbyFairs: [],
      loadingSimilar: false,
      loadingNearby: false,
      tourismAssociationData: null,
      loadingTourismAssociation: false,
      isSliding: false,
      districtData: null,
      loadingDistrict: false,
      orderDarkSvg,
      orderLightSvg,
      imageErrors: {}, // Track image errors by URL: { [url]: true }
      lightboxOpen: false,
      lightboxIndex: 0,
    };
  },
  computed: {
    USE_MOCK_DATA() {
      return USE_MOCK_DATA;
    },
    lang() {
      return this.config.language || 'it';
    },
    theme() {
      const currentTheme = this.config.theme || 'light';
      const availableThemes = this.config.availableThemes || ['light', 'dark'];
      if (availableThemes.includes(currentTheme)) return currentTheme;
      return availableThemes[0] || 'light';
    },
    dataType() {
      // Detect if this is a market or fair based on ID
      // Market IDs typically contain ':market' while fair IDs contain ':yearmarket'
      const idStr = String(this.id || '');
      return idStr.includes(':market:') && !idStr.includes(':yearmarket:') ? 'market' : 'yearmarket';
    },
    ds() {
      // Use markets state if market type, otherwise fairs state
      return this.dataType === 'market' ? this.store.state.markets : this.store.state.fairs;
    },
    raw() {
      // Use detailed item if available, otherwise fall back to list data
      return this.detailItem || this.store.findById(this.dataType, this.id);
    },
    item() {
      return this.raw ? normalizeOdhItem(this.raw, { lang: this.config.language, type: this.dataType }) : null;
    },
    locationWithProvince() {
      if (!this.item?.municipality) return '';
      const municipality = this.item.municipality.toUpperCase();
      // Try to extract province code from ContactInfos or use BZ as default
      const provinceCode = 'BZ'; // Could be extracted from raw.ContactInfos if available
      return `${municipality} (${provinceCode})`;
    },
    fairsMapZoom() {
      return this.config.fairsMapZoom || 15;
    },
    displayCategories() {
      if (this.categoryBadges.length > 0) {
        return this.categoryBadges;
      }
      // Mock categories for testing
      if (USE_MOCK_DATA) {
        return [
          'Artigianato locale, alimenti locali',
          'Artigianato locale',
          'alimenti locali',
          'Artigianato locale, alimenti locali',
          'Artigianato locale'
        ];
      }
      return [];
    },
    monthName() {
      if (!this.item?.nextDate) return null;
      try {
        const date = new Date(this.item.nextDate);
        const monthIdx = date.getMonth();
        const months = MONTHS[this.lang] || MONTHS.it;
        return months[monthIdx].toUpperCase();
      } catch {
        return null;
      }
    },
    fullDate() {
      if (!this.item?.nextDate) return null;
      try {
        const date = new Date(this.item.nextDate);
        const weekdays = WEEKDAYS[this.lang] || WEEKDAYS.it;
        const weekday = weekdays[date.getDay()];
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${weekday} ${day}/${month}/${year}`;
      } catch {
        return null;
      }
    },
    openingHours() {
      return this.raw ? getOpeningHours(this.raw, this.lang) : null;
    },
    frequency() {
      if (!this.raw) return '—';
      const freq = getFrequency(this.raw, this.lang);
      return freq || '—';
    },
    fullAddress() {
      // Compose address from LocationInfo.TvInfo.Name and DistrictInfo.Name
      if (!this.raw?.LocationInfo) {
        // Fallback to original getFullAddress if LocationInfo not available
        return this.raw ? getFullAddress(this.raw, this.lang) : null;
      }
      
      // Get location name from TvInfo.Name (e.g., "Bolzano")
      const locationName = pickLang(this.raw.LocationInfo?.TvInfo?.Name, this.lang);
      // Get district name from DistrictInfo.Name (e.g., "Don Bosco")
      const districtName = pickLang(this.raw.LocationInfo?.DistrictInfo?.Name, this.lang);
      
      if (locationName && districtName) {
        return `${locationName}, ${districtName}`;
      }
      if (locationName) {
        return locationName;
      }
      if (districtName) {
        return districtName;
      }
      
      // Fallback to original getFullAddress if LocationInfo/DistrictInfo not available
      return this.raw ? getFullAddress(this.raw, this.lang) : null;
    },
    districtCoordinates() {
      // Get coordinates from districtData
      if (!this.districtData) return null;
      const lat = this.districtData?.Latitude || this.districtData?.lat;
      const lon = this.districtData?.Longitude || this.districtData?.lon;
      if (lat && lon) {
        return { lat: Number(lat), lon: Number(lon) };
      }
      return null;
    },
    districtGoogleMapsUrl() {
      // Create Google Maps search URL with coordinates
      if (!this.districtCoordinates) return null;
      return `https://www.google.com/maps?q=${this.districtCoordinates.lat},${this.districtCoordinates.lon}`;
    },
    categoryBadges() {
      if (!this.raw) return [];
      const tags = this.raw.ODHTags || this.raw.Tags || [];
      if (!Array.isArray(tags)) return [];
      return tags
        .map((tag) => {
          const name = tag?.Id || tag?.Name || tag;
          return typeof name === 'string' ? name.toUpperCase() : null;
        })
        .filter(Boolean);
    },
    additionalInfo() {
      const detail = pickLang(this.raw?.Detail, this.lang);
      return detail?.BaseText || detail?.Description || null;
    },
    notes() {
      const detail = pickLang(this.raw?.Detail, this.lang);
      return detail?.Notes || this.raw?.Notes || null;
    },
    pdfUrl() {
      return this.raw?.PdfUrl || this.raw?.DocumentUrl || null;
    },
    imageGallery() {
      if (!this.raw?.ImageGallery) return [];
      return this.raw.ImageGallery.map((img) => img?.ImageUrl || img?.Url).filter(Boolean);
    },
    displayGalleryImages() {
      const realImages = this.imageGallery.slice(0, 3);

      // If we have real images, use them
      if (realImages.length >= 3) {
        return realImages;
      }

      // If using mock data and we have the main image, duplicate it for gallery
      if (USE_MOCK_DATA && this.item?.image) {
        return [this.item.image, this.item.image, this.item.image];
      }

      return realImages;
    },
    carouselImages() {
      // Collect all available images for the hero carousel
      const images = [];

      // Add main image
      if (this.item?.image) {
        images.push(this.item.image);
      }

      // Add gallery images (avoid duplicates)
      if (this.imageGallery.length > 0) {
        this.imageGallery.forEach(img => {
          if (!images.includes(img)) {
            images.push(img);
          }
        });
      }

      return images;
    },
    validCarouselImages() {
      // Filter out images that failed to load
      return this.carouselImages.filter(img => !this.imageErrors[img]);
    },
    mobileHeroBackgroundStyle() {
      // Use first carousel image as background for mobile hero
      if (this.validCarouselImages.length > 0) {
        return {
          backgroundImage: `url(${this.validCarouselImages[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
      return {
        background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)',
        minHeight: '600px'
      };
    },
    thumbnailsPerPage() {
      return 3; // Max thumbnails visible at once
    },
    totalThumbnailPages() {
      return Math.ceil(this.validCarouselImages.length / this.thumbnailsPerPage);
    },
    visibleThumbnails() {
      const start = this.currentThumbnailPage * this.thumbnailsPerPage;
      return this.validCarouselImages.slice(start, start + this.thumbnailsPerPage);
    },
    thumbnailPageDots() {
      return Array.from({ length: this.totalThumbnailPages }, (_, i) => i);
    },
    exhibitors() {
      const realExhibitors = this.raw ? getExhibitors(this.raw) : [];
      
      // Return fake data for testing if no real exhibitors or USE_MOCK_DATA is true
      if (USE_MOCK_DATA || realExhibitors.length === 0) {
        return [
          {
            name: 'Mario Rossi - Artigianato Locale',
            category: 'Artigianato',
            stall: 'A12',
            address: 'Via del Mercato, 15',
            gpsInfo: { lat: 46.4983, lon: 11.3548 }
          },
          {
            name: 'Giovanni Bianchi - Formaggi Tipici',
            category: 'Alimentari',
            stall: 'B05',
            address: 'Piazza del Duomo, 8',
            gpsInfo: { lat: 46.4991, lon: 11.3552 }
          },
          {
            name: 'Anna Verdi - Miele e Confetture',
            category: 'Alimentari',
            stall: 'C18',
            address: 'Via Portici, 22',
            gpsInfo: { lat: 46.4978, lon: 11.3545 }
          },
          {
            name: 'Luigi Neri - Ceramiche Artigianali',
            category: 'Artigianato',
            stall: 'A25',
            address: 'Via dei Forni, 3',
            gpsInfo: { lat: 46.4989, lon: 11.3558 }
          },
          {
            name: 'Sofia Blu - Erbe e Spezie',
            category: 'Alimentari',
            stall: 'B33',
            address: 'Corso Libertà, 45',
            gpsInfo: { lat: 46.4975, lon: 11.3542 }
          },
          {
            name: 'Paolo Gialli - Legno Intagliato',
            category: 'Artigianato',
            stall: 'D07',
            address: 'Via delle Arti, 12',
            gpsInfo: { lat: 46.4995, lon: 11.3561 }
          },
          {
            name: 'Elena Rosa - Pane e Dolci Tradizionali',
            category: 'Alimentari',
            stall: 'C42',
            address: 'Via del Forno, 7',
            gpsInfo: { lat: 46.4981, lon: 11.3549 }
          },
          {
            name: 'Marco Viola - Tessuti Artigianali',
            category: 'Artigianato',
            stall: 'A38',
            address: 'Piazza delle Erbe, 19',
            gpsInfo: { lat: 46.4992, lon: 11.3555 }
          },
          {
            name: 'Laura Arancione - Vino Locale',
            category: 'Alimentari',
            stall: 'B51',
            address: 'Via della Cantina, 14',
            gpsInfo: { lat: 46.4972, lon: 11.3538 }
          },
          {
            name: 'Roberto Verde - Ferro Battuto',
            category: 'Artigianato',
            stall: 'D22',
            address: 'Via del Fabbro, 6',
            gpsInfo: { lat: 46.4998, lon: 11.3565 }
          },
          {
            name: 'Francesca Celeste - Olio Extravergine',
            category: 'Alimentari',
            stall: 'C29',
            address: 'Via degli Ulivi, 11',
            gpsInfo: { lat: 46.4986, lon: 11.3551 }
          },
          {
            name: 'Alessandro Indaco - Sculture in Pietra',
            category: 'Artigianato',
            stall: 'A44',
            address: 'Via della Pietra, 9',
            gpsInfo: { lat: 46.4994, lon: 11.3559 }
          },
          {
            name: 'Giulia Turchese - Salumi e Affettati',
            category: 'Alimentari',
            stall: 'B16',
            address: 'Via del Salumiere, 5',
            gpsInfo: { lat: 46.4979, lon: 11.3546 }
          },
          {
            name: 'Davide Magenta - Vetro Soffiato',
            category: 'Artigianato',
            stall: 'D35',
            address: 'Via del Vetraio, 18',
            gpsInfo: { lat: 46.4996, lon: 11.3563 }
          },
          {
            name: 'Chiara Ciano - Frutta e Verdura Bio',
            category: 'Alimentari',
            stall: 'C08',
            address: 'Via dell\'Orto, 13',
            gpsInfo: { lat: 46.4984, lon: 11.3547 }
          }
        ];
      }
      
      return realExhibitors;
    },
    availableExhibitorCategories() {
      const categories = new Set();
      this.exhibitors.forEach(ex => {
        if (ex.category) categories.add(ex.category);
      });
      return Array.from(categories).sort();
    },
    filteredExhibitorCategoriesForSearch() {
      if (!this.categorySearchQuery.trim()) {
        return this.availableExhibitorCategories;
      }
      const query = this.categorySearchQuery.trim().toLowerCase();
      return this.availableExhibitorCategories.filter(cat => 
        cat.toLowerCase().includes(query)
      );
    },
    filteredExhibitors() {
      let filtered = this.exhibitors;
      
      // Category filter
      if (this.exhibitorCategoryFilters.length > 0) {
        filtered = filtered.filter(ex => this.exhibitorCategoryFilters.includes(ex.category));
      }
      
      // Search filter
      if (this.exhibitorSearchQuery.trim()) {
        const query = this.exhibitorSearchQuery.toLowerCase();
        filtered = filtered.filter((ex) => {
          return (
            ex.name.toLowerCase().includes(query) ||
            ex.stall.toLowerCase().includes(query) ||
            ex.address.toLowerCase().includes(query) ||
            (ex.category && ex.category.toLowerCase().includes(query))
          );
        });
      }
      
      return filtered;
    },
    sortedAndFilteredExhibitors() {
      const filtered = this.filteredExhibitors;
      const sorted = [...filtered].sort((a, b) => {
        const aVal = String(a[this.exhibitorSortColumn] || '').toLowerCase();
        const bVal = String(b[this.exhibitorSortColumn] || '').toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return this.exhibitorSortDirection === 'asc' ? comparison : -comparison;
      });
      return sorted;
    },
    exhibitorsPages() {
      return Math.ceil(this.sortedAndFilteredExhibitors.length / this.exhibitorsPerPage);
    },
    paginatedExhibitors() {
      const start = (this.exhibitorsPage - 1) * this.exhibitorsPerPage;
      const end = start + this.exhibitorsPerPage;
      return this.sortedAndFilteredExhibitors.slice(start, end);
    },
    visibleExhibitorPages() {
      const pages = [];
      const total = this.exhibitorsPages;
      const current = this.exhibitorsPage;

      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push('...');
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(total);
        }
      }

      return pages.filter((p) => p !== '...' || pages.indexOf(p) === 0 || pages.indexOf(p) === pages.length - 1);
    },
    filterIcons() {
      const icons = [
        { label: 'Artigianato', color: '#10FFE7', path: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
        { label: 'Alimentari', color: '#90EE90', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z' },
        { label: 'Servizi', color: '#87CEEB', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
      ];
      return icons.slice(0, Math.min(this.categoryBadges.length, 6));
    },
    communityInfo() {
      if (!this.raw) return null;
      const municipality = this.raw?.LocationInfo?.MunicipalityInfo;
      return {
        name: pickLang(municipality?.Name, this.lang) || this.item?.municipality,
        image: this.raw?.ImageGallery?.[1]?.ImageUrl || null,
      };
    },
    contactLines() {
      const ci = pickLang(this.raw?.ContactInfos, this.lang);
      return contactToLines(ci);
    },
    coords() {
      return this.item?.coords || null;
    },
    mapCoords() {
      // Prefer districtCoordinates (from DistrictInfo) over item coords
      // This ensures the map uses the same coordinates as the Google Maps link
      return this.districtCoordinates || this.coords || null;
    },
    currentFairTags() {
      // Extract ODHTag IDs from current fair for filtering
      const tags = this.raw?.ODHTags || this.raw?.Tags || [];
      return tags.map(tag => tag?.Id || tag).filter(Boolean);
    },
    displayedRelatedFairs() {
      return this.similarFairsTab === 'similar' ? this.similarFairs : this.nearbyFairs;
    },
    isLoadingRelated() {
      return this.similarFairsTab === 'similar' ? this.loadingSimilar : this.loadingNearby;
    },
    contactInfo() {
      // First try to get contact info from TourismAssociation, then fall back to raw ContactInfos
      if (this.tourismAssociationData) {
        const ci = pickLang(this.tourismAssociationData?.ContactInfos, this.lang);
        if (ci) {
          return {
            phone: ci?.Phonenumber ?? ci?.Phone ?? ci?.phone ?? null,
            website: ci?.Url ?? ci?.Website ?? ci?.web ?? null,
            email: ci?.Email ?? ci?.email ?? null,
            pec: ci?.PEC ?? ci?.pec ?? null,
            referentName: ci?.CompanyName ?? ci?.Name ?? ci?.ContactName ?? null,
            address: ci?.Address ?? ci?.address ?? null,
            city: ci?.City ?? ci?.city ?? null,
            zipCode: ci?.ZipCode ?? ci?.zipCode ?? null,
            logoUrl: ci?.LogoUrl ?? ci?.logoUrl ?? null,
          };
        }
      }
      
      // Fallback to raw ContactInfos
      if (!this.raw) return null;
      const ci = pickLang(this.raw?.ContactInfos, this.lang);
      if (!ci) return null;
      return {
        phone: ci?.Phone ?? ci?.phone ?? null,
        website: ci?.Url ?? ci?.Website ?? ci?.web ?? null,
        email: ci?.Email ?? ci?.email ?? null,
        pec: ci?.PEC ?? ci?.pec ?? null,
        referentName: ci?.CompanyName ?? ci?.Name ?? ci?.ContactName ?? null,
        logoUrl: ci?.LogoUrl ?? ci?.logoUrl ?? null,
      };
    },
    communityContactData() {
      if (!this.raw || !this.communityInfo) return null;
      
      // Build address from TourismAssociation if available
      let address = this.fullAddress;
      if (this.contactInfo?.address) {
        const parts = [this.contactInfo.address];
        if (this.contactInfo.zipCode) parts.push(this.contactInfo.zipCode);
        if (this.contactInfo.city) parts.push(this.contactInfo.city);
        address = parts.join(', ');
      }
      
      return {
        name: this.communityInfo.name || this.item?.municipality || null,
        address: address || null,
        website: this.contactInfo?.website || null,
        phone: this.contactInfo?.phone || null,
        pec: this.contactInfo?.pec || null,
        logoUrl: this.contactInfo?.logoUrl || null,
      };
    },
    referentContactData() {
      if (!this.contactInfo) return null;
      return {
        name: this.contactInfo.referentName || null,
        phone: this.contactInfo.phone || null,
        email: this.contactInfo.email || null,
      };
    },
    hasContactInfo() {
      return this.communityContactData || this.referentContactData;
    },
    breadcrumbItems() {
      const listRoute = this.dataType === 'market' ? 'marketsList' : 'fairsList';
      const listLabel = this.dataType === 'market' ? this.t('markets') : this.t('fairs');
      return [
        {
          label: listLabel,
          route: listRoute,
        },
        {
          label: this.t('detail'),
        },
      ];
    },
    mapMarkerColor() {
      // Get the appropriate marker color based on data type (fair or market)
      const cssVarName = this.dataType === 'market' 
        ? '--color-indicator-position-markets-map' 
        : '--color-indicator-position-fairs-map';
      const fallback = this.dataType === 'market' ? '#F39650' : '#024C96';
      
      try {
        // CSS variables are set on .wcmc-root in shadow DOM
        const rootEl = document.querySelector('webcomp-market-calendar')?.shadowRoot?.querySelector('.wcmc-root');
        if (rootEl) {
          const computedStyle = getComputedStyle(rootEl);
          const color = computedStyle.getPropertyValue(cssVarName).trim();
          if (color) return color;
        }
      } catch (e) {
        // Fallback on error
      }
      return fallback;
    },
    currentLightboxImage() {
      if (this.lightboxIndex >= 0 && this.lightboxIndex < this.validCarouselImages.length) {
        return this.validCarouselImages[this.lightboxIndex];
      }
      return null;
    },
    mapIframeUrl() {
      if (!this.mapCoords) return null;
      
      // Helper function to escape HTML attribute values
      const escapeHtmlAttr = (str) => {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      };
      
      // Build the web component HTML with attributes
      const categoryFilter = ['essen trinken', 'mobilität'].join(',');
      const language = this.config.language || 'it';
      const lat = String(this.mapCoords.lat);
      const lon = String(this.mapCoords.lon);
      const radius = '10000';
      const zoom = String(this.fairsMapZoom || 15);
      const markerColor = this.mapMarkerColor || '#024C96';
      
      // Build the web component tag as HTML string with properly escaped attributes
      const componentHtml = `<odh-activity-poi category-filter="${escapeHtmlAttr(categoryFilter)}" directions="" language="${escapeHtmlAttr(language)}" lat="${escapeHtmlAttr(lat)}" lon="${escapeHtmlAttr(lon)}" radius="${escapeHtmlAttr(radius)}" show-current-location="true" showradius="false" zoom="${escapeHtmlAttr(zoom)}" marker-color="${escapeHtmlAttr(markerColor)}"></odh-activity-poi>\n`;
      
      // Base64 encode the HTML
      const base64Attribs = btoa(unescape(encodeURIComponent(componentHtml)));
      
      // Build the iframe URL
      const baseUrl = 'https://api.webcomponents.opendatahub.com/preview/0e5fbede-4a21-4dd3-bf85-7d2be71dfb12/latest';
      return `${baseUrl}?attribs=${encodeURIComponent(base64Attribs)}`;
    },
  },
  watch: {
    async id(newId, oldId) {
      if (newId !== oldId) {
        // Reload all data when ID changes
        await this.loadAllData();
      }
    },
    exhibitorSearchQuery() {
      this.exhibitorsPage = 1;
    },
    exhibitorCategoryFilter() {
      this.exhibitorsPage = 1;
    },
    coords: {
      immediate: true,
      async handler() {
        await this.ensureEmbedLoaded();
      },
    },
    mapCoords: {
      immediate: true,
      async handler() {
        await this.ensureEmbedLoaded();
      },
    },
    scriptReady(newVal) {
      // Component handles its own styling now
    },
  },
  async mounted() {
    // Add keyboard event listener for lightbox navigation
    document.addEventListener('keydown', this.handleLightboxKeydown);
    await this.loadAllData();
  },
  beforeUnmount() {
    // Remove keyboard event listener
    document.removeEventListener('keydown', this.handleLightboxKeydown);
    // Clean up body overflow style
    document.body.style.overflow = '';
    // Clean up carousel instance
    if (this.carouselInstance) {
      this.carouselInstance.dispose();
      this.carouselInstance = null;
    }
  },
  methods: {
    t(key) {
      const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.it;
      return dict[key] || TRANSLATIONS.en[key] || key;
    },
    scrollToGallery() {
      // Scroll to the desktop hero carousel section
      const desktopHero = document.querySelector('.d-none.d-md-block.wcmc-detail-hero-card');
      if (desktopHero) {
        desktopHero.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    handleImageError(event, imgUrl) {
      // Hide the broken image element (same pattern as ItemCard)
      if (event.target) {
        event.target.style.display = 'none';
      }
      // Mark image as failed
      this.imageErrors[imgUrl] = true;
    },
    handleImageLoad(imgUrl) {
      // Remove error flag if image loads successfully
      if (this.imageErrors[imgUrl]) {
        delete this.imageErrors[imgUrl];
      }
    },
    initCarousel() {
      // Initialize Bootstrap carousel
      const carouselElement = this.$refs.heroCarousel;
      if (carouselElement && this.validCarouselImages.length > 1) {
        this.carouselInstance = new Carousel(carouselElement, {
          interval: false, // Disable auto-play
          wrap: true,      // Loop back to start
          keyboard: true,  // Keyboard navigation
          pause: 'hover',  // Pause on hover
        });
      }
    },
    goToSlide(index) {
      // Navigate to specific slide when thumbnail is clicked
      if (this.carouselInstance) {
        this.carouselInstance.to(index);
        this.activeSlideIndex = index;
        // Ensure the thumbnail page containing this index is visible
        const pageForIndex = Math.floor(index / this.thumbnailsPerPage);
        if (pageForIndex !== this.currentThumbnailPage) {
          this.currentThumbnailPage = pageForIndex;
        }
      }
    },
    getGlobalThumbnailIndex(localIndex) {
      // Convert local thumbnail index (0-2) to global carousel index
      return this.currentThumbnailPage * this.thumbnailsPerPage + localIndex;
    },
    nextThumbnailPage() {
      // Move to next page of thumbnails (with wrap-around)
      if (this.currentThumbnailPage < this.totalThumbnailPages - 1) {
        this.currentThumbnailPage++;
      } else {
        this.currentThumbnailPage = 0; // Wrap to first page
      }
    },
    prevThumbnailPage() {
      // Move to previous page of thumbnails (with wrap-around)
      if (this.currentThumbnailPage > 0) {
        this.currentThumbnailPage--;
      } else {
        this.currentThumbnailPage = this.totalThumbnailPages - 1; // Wrap to last page
      }
    },
    goToThumbnailPage(pageIndex) {
      // Jump to specific thumbnail page
      if (pageIndex >= 0 && pageIndex < this.totalThumbnailPages) {
        this.currentThumbnailPage = pageIndex;
      }
    },
    syncThumbnailPage() {
      // Ensure the thumbnail page matches the active slide
      const pageForActiveSlide = Math.floor(this.activeSlideIndex / this.thumbnailsPerPage);
      if (pageForActiveSlide !== this.currentThumbnailPage) {
        this.currentThumbnailPage = pageForActiveSlide;
      }
    },
    async loadDetailData() {
      this.loadingDetail = true;
      this.detailError = null;
      try {
        const detail = await this.store.fetchDetailById(this.id);
        if (detail) {
          this.detailItem = detail;
          
          // Fetch TourismAssociation data if available
          const tvInfoSelf = detail?.LocationInfo?.TvInfo?.Self;
          if (tvInfoSelf) {
            await this.loadTourismAssociation(tvInfoSelf);
          }
          
          // Fetch DistrictInfo data if available to get coordinates
          const districtSelf = detail?.LocationInfo?.DistrictInfo?.Self;
          if (districtSelf) {
            await this.loadDistrict(districtSelf);
          }
        }
      } catch (e) {
        this.detailError = e?.message || String(e);
        console.warn('[FairsDetail] Failed to load detail:', this.detailError);
      } finally {
        this.loadingDetail = false;
      }
    },
    async loadDistrict(selfUrl) {
      this.loadingDistrict = true;
      try {
        // Extract district ID from Self URL
        // URL format: https://tourism.api.opendatahub.testingmachine.eu/v1/District/{ID}
        const urlParts = selfUrl.split('/');
        const districtId = urlParts[urlParts.length - 1];
        
        if (districtId) {
          const data = await this.store.fetchDistrict(districtId, {
            language: this.config.language,
          });
          this.districtData = data;
        }
      } catch (e) {
        console.warn('[FairsDetail] Failed to load District:', e?.message || String(e));
        // Don't set error state, just log it
      } finally {
        this.loadingDistrict = false;
      }
    },
    async loadTourismAssociation(url) {
      this.loadingTourismAssociation = true;
      try {
        const data = await this.store.fetchTourismAssociation(url, {
          language: this.config.language,
        });
        this.tourismAssociationData = data;
      } catch (e) {
        console.warn('[FairsDetail] Failed to load TourismAssociation:', e?.message || String(e));
        // Don't set error state, just log it - contact info will fall back to raw ContactInfos
      } finally {
        this.loadingTourismAssociation = false;
      }
    },
    async ensureEmbedLoaded() {
      if (!this.mapCoords) return;
      if (this.scriptReady) return;
      try {
        this.embedError = '';
        await loadExternalScriptOnce({
          id: 'odh-activity-poi-bundle',
          src: 'https://cdn.webcomponents.opendatahub.com/dist/0e5fbede-4a21-4dd3-bf85-7d2be71dfb12/bundle.js',
        });
        this.scriptReady = true;
      } catch (e) {
        this.embedError = e?.message || String(e);
      }
    },
    navigateToLocation() {
      if (!this.mapCoords) return;
      const url = `https://www.google.com/maps?q=${this.mapCoords.lat},${this.mapCoords.lon}`;
      window.open(url, '_blank');
    },
    addToCalendar() {
      if (!this.item?.nextDate) return;
      const date = new Date(this.item.nextDate);
      const endDate = new Date(date.getTime() + 2 * 60 * 60 * 1000);

      const formatDate = (d) => {
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Market Calendar//EN',
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(date)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${this.item.title}`,
        `LOCATION:${this.fullAddress || this.item.municipality}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.item.title.replace(/\s+/g, '_')}.ics`;
      link.click();
      URL.revokeObjectURL(url);
    },
    handleContactSubmit() {
      
    },
    contactReferent() {
      if (this.referentContactData?.email) {
        window.location.href = `mailto:${this.referentContactData.email}`;
      }
    },
    showMockMessage() {
      alert('PDF download not available - this is mock data for layout testing');
    },
    shareEvent() {
      if (navigator.share && this.item) {
        navigator.share({
          title: this.item.title,
          text: `Check out ${this.item.title}`,
          url: window.location.href,
        }).catch(() => {
          // Fallback: copy to clipboard
          this.copyToClipboard(window.location.href);
        });
      } else {
        this.copyToClipboard(window.location.href);
      }
    },
    copyToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          alert('Link copied to clipboard!');
        });
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
      }
    },
    toggleSort(column) {
      if (this.exhibitorSortColumn === column) {
        this.exhibitorSortDirection = this.exhibitorSortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.exhibitorSortColumn = column;
        this.exhibitorSortDirection = 'asc';
      }
    },
    toggleCategoryDropdown() {
      this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
      // Clear search query when closing dropdown
      if (!this.isCategoryDropdownOpen) {
        this.categorySearchQuery = '';
      }
    },
    toggleAllCategories(e) {
      if (e.target.checked) {
        this.exhibitorCategoryFilters = [];
      }
    },
    getSortIcon(column) {
      if (this.exhibitorSortColumn !== column) return 'bi-arrow-down-up';
      return this.exhibitorSortDirection === 'asc' ? 'bi-sort-up' : 'bi-sort-down';
    },
    async fetchSimilarFairs() {
      if (!this.currentFairTags.length) return;
      
      this.loadingSimilar = true;
      try {
        // Use first tag as filter (can be enhanced to use multiple)
        const odhtagfilter = this.currentFairTags[0];
        const items = await this.store.fetchSimilarItems({
          type: this.dataType,
          odhtagfilter,
          excludeId: this.id,
          maxResults: 50, // Fetch up to 50 similar items
        });
        this.similarFairs = items.map(item => 
          normalizeOdhItem(item, { lang: this.lang, type: this.dataType })
        );
      } catch (e) {
        console.error('Failed to fetch similar items:', e);
      } finally {
        this.loadingSimilar = false;
      }
    },
    async fetchNearbyFairs() {
      if (!this.item?.municipalityId) return;
      
      this.loadingNearby = true;
      try {
        const locfilter = `mun${this.item.municipalityId}`;
        const items = await this.store.fetchSimilarItems({
          type: this.dataType,
          locfilter,
          excludeId: this.id,
          maxResults: 50, // Fetch up to 50 nearby items
        });
        this.nearbyFairs = items.map(item => 
          normalizeOdhItem(item, { lang: this.lang, type: this.dataType })
        );
      } catch (e) {
        console.error('Failed to fetch nearby items:', e);
      } finally {
        this.loadingNearby = false;
      }
    },
    slideLeft() {
      if (this.isSliding) return;
      
      const track = this.$refs.sliderTrack;
      if (track) {
        // Get the first card wrapper div to calculate its width including gap
        const cardWrapper = track.querySelector('.flex-shrink-0');
        if (cardWrapper) {
          const cardWidth = cardWrapper.offsetWidth;
          const gap = 24; // 1.5rem = 24px (from gap-4 in CSS)
          const scrollDistance = cardWidth + gap;
          
          this.isSliding = true;
          track.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
          
          // Re-enable after scroll animation completes (smooth scroll typically takes ~500ms)
          this.resetSlidingState();
        } else {
          // Fallback if no card found
          this.isSliding = true;
          track.scrollBy({ left: -400, behavior: 'smooth' });
          this.resetSlidingState();
        }
      }
    },
    slideRight() {
      if (this.isSliding) return;
      
      const track = this.$refs.sliderTrack;
      if (track) {
        // Get the first card wrapper div to calculate its width including gap
        const cardWrapper = track.querySelector('.flex-shrink-0');
        if (cardWrapper) {
          const cardWidth = cardWrapper.offsetWidth;
          const gap = 24; // 1.5rem = 24px (from gap-4 in CSS)
          const scrollDistance = cardWidth + gap;
          
          this.isSliding = true;
          track.scrollBy({ left: scrollDistance, behavior: 'smooth' });
          
          // Re-enable after scroll animation completes (smooth scroll typically takes ~500ms)
          this.resetSlidingState();
        } else {
          // Fallback if no card found
          this.isSliding = true;
          track.scrollBy({ left: 400, behavior: 'smooth' });
          this.resetSlidingState();
        }
      }
    },
    resetSlidingState() {
      // Wait for smooth scroll to complete (typically 500-600ms)
      setTimeout(() => {
        this.isSliding = false;
      }, 600);
    },
    async loadAllData() {
      // Reset state
      this.detailItem = null;
      this.tourismAssociationData = null;
      this.similarFairs = [];
      this.nearbyFairs = [];
      this.currentThumbnailPage = 0;
      this.activeSlideIndex = 0;
      this.imageErrors = {}; // Reset image errors when loading new data
      
      // First, try to fetch full detail from single-item endpoint
      await this.loadDetailData();

      // If detail fetch failed, ensure we have list data as fallback
      if (!this.raw) {
        await this.store.ensureLoaded(this.dataType, this.config.pageSize || 20);
      }

      await this.ensureEmbedLoaded();

      // Fetch similar and nearby fairs
      await Promise.all([
        this.fetchSimilarFairs(),
        this.fetchNearbyFairs()
      ]);

      // Initialize Bootstrap carousel after data is loaded
      this.$nextTick(() => {
        this.initCarousel();

        // Listen for carousel slide events to sync active thumbnail
        const carouselElement = this.$refs.heroCarousel;
        if (carouselElement) {
          carouselElement.addEventListener('slid.bs.carousel', (event) => {
            this.activeSlideIndex = event.to;
            this.syncThumbnailPage();
          });
        }

      });
    },
    navigateToFair(fairId) {
      // Update the route which will trigger the watcher
      this.store.go('fairsDetail', { id: fairId });
    },
    openLightbox(index) {
      if (index >= 0 && index < this.validCarouselImages.length) {
        this.lightboxIndex = index;
        this.lightboxOpen = true;
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
        // Focus trap for accessibility
        this.$nextTick(() => {
          const closeBtn = this.$el?.querySelector('.wcmc-lightbox-close');
          if (closeBtn) closeBtn.focus();
        });
      }
    },
    closeLightbox() {
      this.lightboxOpen = false;
      // Restore body scroll
      document.body.style.overflow = '';
    },
    nextLightboxImage() {
      if (this.validCarouselImages.length > 1) {
        this.lightboxIndex = (this.lightboxIndex + 1) % this.validCarouselImages.length;
      }
    },
    prevLightboxImage() {
      if (this.validCarouselImages.length > 1) {
        this.lightboxIndex = (this.lightboxIndex - 1 + this.validCarouselImages.length) % this.validCarouselImages.length;
      }
    },
    handleLightboxKeydown(event) {
      if (!this.lightboxOpen) return;
      
      switch (event.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowLeft':
          this.prevLightboxImage();
          break;
        case 'ArrowRight':
          this.nextLightboxImage();
          break;
      }
    },
  },
};
</script>
