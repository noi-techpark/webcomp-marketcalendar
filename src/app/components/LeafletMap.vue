<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="w-100" :style="{ height }">
    <div ref="mapEl" class="w-100 h-100 rounded overflow-hidden" ></div>
  </div>
</template>

<script>
import L from 'leaflet';
import { getFrequency, getScheduleEntries } from '../../utils/normalize';

const MONTHS_ABBR = {
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  it: ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'],
  de: ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'],
};

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return String(iso);
  }
}

function getMonthsList(item, lang) {
  if (!item?.raw) return '';
  
  const schedule = getScheduleEntries(item.raw);
  if (!schedule.length) return '';
  
  const monthsSet = new Set();
  const monthAbbr = MONTHS_ABBR[lang] || MONTHS_ABBR.it;
  
  schedule.forEach((entry) => {
    if (entry.start) {
      try {
        const date = new Date(entry.start);
        const monthIdx = date.getMonth();
        monthsSet.add(monthIdx);
      } catch {
        // Invalid date, skip
      }
    }
  });
  
  const months = Array.from(monthsSet).sort((a, b) => a - b);
  return months.map((idx) => monthAbbr[idx]).join(', ');
}

function getFrequencyText(item, lang) {
  if (!item?.raw) {
    // Try to infer from schedule if available
    if (item.schedule && Array.isArray(item.schedule) && item.schedule.length > 0) {
      const scheduleLength = item.schedule.length;
      const freqMap = {
        en: { weekly: 'Weekly', biweekly: 'Biweekly', monthly: 'Monthly', daily: 'Daily' },
        it: { weekly: 'Settimanale', biweekly: 'Bisettimanale', monthly: 'Mensile', daily: 'Giornaliero' },
        de: { weekly: 'Wöchentlich', biweekly: 'Zweiwöchentlich', monthly: 'Monatlich', daily: 'Täglich' },
      };
      const dict = freqMap[lang] || freqMap.it;
      if (scheduleLength >= 14) return dict.daily;
      if (scheduleLength >= 8) return dict.biweekly;
      if (scheduleLength >= 4) return dict.weekly;
    }
    return null;
  }
  const freq = getFrequency(item.raw, lang);
  // If getFrequency returns null, try to infer from schedule
  if (!freq && item.schedule && Array.isArray(item.schedule) && item.schedule.length > 0) {
    const scheduleLength = item.schedule.length;
    const freqMap = {
      en: { weekly: 'Weekly', biweekly: 'Biweekly', monthly: 'Monthly', daily: 'Daily' },
      it: { weekly: 'Settimanale', biweekly: 'Bisettimanale', monthly: 'Mensile', daily: 'Giornaliero' },
      de: { weekly: 'Wöchentlich', biweekly: 'Zweiwöchentlich', monthly: 'Monatlich', daily: 'Täglich' },
    };
    const dict = freqMap[lang] || freqMap.it;
    if (scheduleLength >= 14) return dict.daily;
    if (scheduleLength >= 8) return dict.biweekly;
    if (scheduleLength >= 4) return dict.weekly;
  }
  return freq;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function markerHtml(color) {
  // Teardrop/pin shape marker
  return `
    <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 24 12 24s12-16 12-24C24 5.373 18.627 0 12 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `;
}

function createDivIcon(color) {
  return L.divIcon({
    className: 'wcmc-div-icon',
    html: markerHtml(color),
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

export default {
  name: 'LeafletMap',
  props: {
    height: { type: String, default: '420px' },
    markets: { type: Array, default: () => [] }, // normalized items
    fairs: { type: Array, default: () => [] }, // normalized items
    showMarkets: { type: Boolean, default: true },
    showFairs: { type: Boolean, default: true },
    initialCenter: { type: Object, default: () => ({ lat: 46.5, lon: 11.35 }) },
    initialZoom: { type: Number, default: 9 },
    lang: { type: String, default: 'it' },
    config: { type: Object, default: () => ({}) },
  },
  emits: ['openDetails'],
  data() {
    return {
      map: null,
      layerMarkets: null,
      layerFairs: null,
      resizeObserver: null,
      didFitOnce: false,
      isZooming: false,
    };
  },
  mounted() {
    const el = this.$refs.mapEl;
    this.map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
    }).setView([this.initialCenter.lat, this.initialCenter.lon], this.initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.layerMarkets = L.layerGroup().addTo(this.map);
    this.layerFairs = L.layerGroup().addTo(this.map);

    // Close all popups during map operations to prevent errors
    const closeAllPopups = () => {
      try {
        // Chiudi popup della mappa
        if (this.map && this.map._popup) {
          try {
            this.map.closePopup();
          } catch (e) {
            // Ignore
          }
        }
        
        // Chiudi tutti i popup sui marker
        if (this.layerMarkets) {
          this.layerMarkets.eachLayer((layer) => {
            try {
              if (layer._popup && layer.isPopupOpen && layer.isPopupOpen()) {
                layer.closePopup();
              }
            } catch (e) {
              // Ignore errors for individual markers
            }
          });
        }
        if (this.layerFairs) {
          this.layerFairs.eachLayer((layer) => {
            try {
              if (layer._popup && layer.isPopupOpen && layer.isPopupOpen()) {
                layer.closePopup();
              }
            } catch (e) {
              // Ignore errors for individual markers
            }
          });
        }
      } catch (e) {
        // Ignore errors silently
      }
    };

    // Intercept _animateZoom to prevent popup errors
    const originalAnimateZoom = this.map._animateZoom;
    if (originalAnimateZoom) {
      this.map._animateZoom = function(center, zoom, options) {
        // Close all popups before animation
        closeAllPopups();
        // Wrap in try-catch to prevent errors
        try {
          return originalAnimateZoom.call(this, center, zoom, options);
        } catch (e) {
          // If error occurs, try to continue without popup updates
          if (e.message && e.message.includes('_latLngToNewLayerPoint')) {
            // Silently ignore this specific error
            return;
          }
          throw e;
        }
      };
    }

    this.map.on('zoomstart', () => {
      this.isZooming = true;
      closeAllPopups();
    });

    this.map.on('zoomend', () => {
      this.isZooming = false;
    });

    this.map.on('movestart', closeAllPopups);
    
    // Also close popups before any zoom animation
    const originalSetZoom = this.map.setZoom;
    this.map.setZoom = function(zoom, options) {
      closeAllPopups();
      return originalSetZoom.call(this, zoom, options);
    };
    
    const originalZoomIn = this.map.zoomIn;
    this.map.zoomIn = function(options) {
      closeAllPopups();
      return originalZoomIn.call(this, options);
    };
    
    const originalZoomOut = this.map.zoomOut;
    this.map.zoomOut = function(options) {
      closeAllPopups();
      return originalZoomOut.call(this, options);
    };

    // Keep Leaflet happy when container size changes (tabs, responsive layout)
    this.resizeObserver = new ResizeObserver(() => {
      try {
        this.map?.invalidateSize();
      } catch {
        // ignore
      }
    });
    this.resizeObserver.observe(el);

    this.renderMarkers();
  },
  beforeUnmount() {
    try {
      this.resizeObserver?.disconnect();
    } catch {
      // ignore
    }
    try {
      this.map?.remove();
    } catch {
      // ignore
    }
  },
  watch: {
    markets: { deep: true, handler() { this.renderMarkers(); } },
    fairs: { deep: true, handler() { this.renderMarkers(); } },
    showMarkets() { this.renderMarkers(); },
    showFairs() { this.renderMarkers(); },
  },
  methods: {
    getConfigColor(cssVarName, fallback) {
      try {
        // CSS variables are set on .wcmc-root in shadow DOM
        // We need to traverse up to find the root element or use document.querySelector
        // Since we're in shadow DOM, try to find .wcmc-root
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
    renderMarkers() {
      if (!this.map || !this.layerMarkets || !this.layerFairs) return;

      this.layerMarkets.clearLayers();
      this.layerFairs.clearLayers();

      const bounds = [];

      if (this.showMarkets) {
        // Get marker color from config CSS variable or fallback
        const marketsColor = this.getConfigColor('--color-indicator-position-markets-map', '#F39650');
        const icon = createDivIcon(marketsColor);
        this.markets.forEach((it) => {
          if (!it?.coords) return;
          const m = L.marker([it.coords.lat, it.coords.lon], { icon });
          const popupEl = document.createElement('div');
          popupEl.className = 'wcmc-map-popup-card d-flex flex-row w-100 rounded overflow-hidden';
          
          const frequency = getFrequencyText(it, this.lang) || '—';
          const monthsList = getMonthsList(it, this.lang);
          const municipality = (it.municipality || '').toUpperCase();
          const imageUrl = it.image || '';
          const imageAlt = escapeHtml(it.title || '');
          const title = escapeHtml(it.title || '');
          const municipalityEscaped = escapeHtml(municipality);
          const frequencyEscaped = escapeHtml(frequency);
          const monthsListEscaped = escapeHtml(monthsList);
          
          popupEl.innerHTML = `
            <div class="wcmc-map-popup-card d-flex flex-row w-100 rounded overflow-hidden wcmc-cursor-pointer" style="min-width: 280px; max-width: 500px;">
              <div class="wcmc-map-popup-card__image flex-shrink-0 rounded p-1 d-flex align-items-stretch" style="width: 112px; min-height: 112px; max-height: 200px; aspect-ratio: 1;">
                ${imageUrl ? `<img class="w-100 h-100 rounded" style="object-fit: cover; object-position: center;" src="${escapeHtml(imageUrl)}" alt="${imageAlt}" referrerpolicy="no-referrer-when-downgrade" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : ''}
                <div class="wcmc-map-popup-card__image-placeholder w-100 h-100 d-flex align-items-center justify-content-center rounded" ${imageUrl ? 'style="display:none;"' : ''}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
              </div>
              <div class="wcmc-map-popup-card__content flex-fill d-flex flex-column gap-2 p-2 min-w-0">
                <div class="wcmc-map-popup-card__title fw-medium mb-0" style="word-wrap: break-word; word-break: break-word;">${title}</div>
                ${municipality ? `
                  <div class="wcmc-map-popup-card__meta d-flex align-items-center gap-2">
                    <svg class="wcmc-map-popup-card__icon flex-shrink-0" width="10" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>${municipalityEscaped}</span>
                  </div>
                ` : ''}
                <div class="wcmc-map-popup-card__meta d-flex align-items-center gap-2">
                  <svg class="wcmc-map-popup-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                  </svg>
                  <span>${frequencyEscaped}</span>
                </div>
                ${monthsList ? `
                  <div class="wcmc-map-popup-card__meta d-flex align-items-center gap-2">
                    <svg class="wcmc-map-popup-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span class="wcmc-map-popup-card__months fst-italic">${monthsListEscaped}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
          popupEl.addEventListener('click', () => {
             this.$emit('openDetails', { type: 'market', id: it.id });
          });
          m.bindPopup(popupEl);
          m.addTo(this.layerMarkets);
          bounds.push([it.coords.lat, it.coords.lon]);
        });
      }

      if (this.showFairs) {
        // Get marker color from config CSS variable or fallback
        const fairsColor = this.getConfigColor('--color-indicator-position-fairs-map', '#0d6efd');
        const icon = createDivIcon(fairsColor);
        this.fairs.forEach((it) => {
          if (!it?.coords) return;
          const m = L.marker([it.coords.lat, it.coords.lon], { icon });
          const popupEl = document.createElement('div');
          popupEl.className = 'wcmc-map-popup-card d-flex flex-row w-100 rounded overflow-hidden';
          
          const frequency = getFrequencyText(it, this.lang) || '—';
          const monthsList = getMonthsList(it, this.lang);
          const municipality = (it.municipality || '').toUpperCase();
          const imageUrl = it.image || '';
          const imageAlt = escapeHtml(it.title || '');
          const title = escapeHtml(it.title || '');
          const municipalityEscaped = escapeHtml(municipality);
          const frequencyEscaped = escapeHtml(frequency);
          const monthsListEscaped = escapeHtml(monthsList);
          
          popupEl.innerHTML = `
            <div class="wcmc-map-popup-card d-flex flex-row w-100 rounded overflow-hidden wcmc-cursor-pointer" style="min-width: 280px; max-width: 500px;">
              <div class="wcmc-map-popup-card__image flex-shrink-0 rounded p-1 d-flex align-items-stretch" style="width: 112px; min-height: 112px; max-height: 200px; aspect-ratio: 1;">
                ${imageUrl ? `<img class="w-100 h-100 rounded" style="object-fit: cover; object-position: center;" src="${escapeHtml(imageUrl)}" alt="${imageAlt}" referrerpolicy="no-referrer-when-downgrade" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />` : ''}
                <div class="wcmc-map-popup-card__image-placeholder w-100 h-100 d-flex align-items-center justify-content-center rounded" ${imageUrl ? 'style="display:none;"' : ''}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
              </div>
              <div class="wcmc-map-popup-card__content flex-fill d-flex flex-column gap-2 p-2 min-w-0">
                <div class="wcmc-map-popup-card__title fw-medium mb-0" style="word-wrap: break-word; word-break: break-word;">${title}</div>
                ${municipality ? `
                  <div class="wcmc-map-popup-card__meta d-flex align-items-center gap-2">
                    <svg class="wcmc-map-popup-card__icon flex-shrink-0" width="10" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                    <span>${municipalityEscaped}</span>
                  </div>
                ` : ''}
                <div class="wcmc-map-popup-card__meta d-flex align-items-center gap-2">
                  <svg class="wcmc-map-popup-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                  </svg>
                  <span>${frequencyEscaped}</span>
                </div>
                ${monthsList ? `
                  <div class="wcmc-map-popup-card__meta d-flex align-items-center gap-2">
                    <svg class="wcmc-map-popup-card__icon flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span class="wcmc-map-popup-card__months fst-italic">${monthsListEscaped}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `;
          popupEl.addEventListener('click', () => {
             this.$emit('openDetails', { type: 'fair', id: it.id });
          });
          m.bindPopup(popupEl);
          m.addTo(this.layerFairs);
          bounds.push([it.coords.lat, it.coords.lon]);
        });
      }

      // Only auto-fit bounds if no custom center/zoom was provided (i.e., using defaults)
      const defaultCenter = { lat: 46.5, lon: 11.35 };
      const defaultZoom = 9;
      const isUsingCustomView = (
        this.initialCenter.lat !== defaultCenter.lat ||
        this.initialCenter.lon !== defaultCenter.lon ||
        this.initialZoom !== defaultZoom
      );

      if (!this.didFitOnce && bounds.length > 0 && !isUsingCustomView) {
        // Use nextTick to ensure map is fully initialized before fitBounds
        this.$nextTick(() => {
          try {
            // Ensure map size is valid before fitting bounds
            if (this.map && this.map.getContainer()) {
              this.map.invalidateSize();
              setTimeout(() => {
                if (this.map && bounds.length > 0) {
                  this.map.fitBounds(bounds, { padding: [24, 24] });
                  this.didFitOnce = true;
                }
              }, 100);
            }
          } catch (e) {
            // ignore errors
            console.warn('Leaflet fitBounds error:', e);
          }
        });
      } else if (isUsingCustomView) {
        // Mark as done to prevent future fitBounds calls
        this.didFitOnce = true;
      }
    },
  },
};
</script>


