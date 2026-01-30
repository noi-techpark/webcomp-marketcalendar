<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="wcmc-shell">
    <!-- Header/Navbar -->
    <header class="wcmc-header p-3 p-md-4">
      <!-- Mobile Header Layout -->
      <div class="d-md-none">
        <!-- First row: Logo + Theme/Language -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <div class="wcmc-logo d-flex align-items-center">
            <img 
              :src="theme === 'light' ? logoDarkSvg : logoSvg" 
              alt="Logo" 
              class="wcmc-icon-40"
            />
          </div>
          <div class="wcmc-header__right d-flex align-items-center gap-3">
            <!-- Theme Toggle Switch -->
            <button
              v-if="lightDarkVisible"
              class="wcmc-theme-switch border-0 p-0 d-flex align-items-center"
              type="button"
              :aria-label="theme === 'dark' ? t('light') : t('dark')"
              :data-theme="theme"
              @click="toggleTheme"
            >
              <div class="wcmc-theme-switch__track d-flex align-items-center justify-content-between rounded-pill">
                <span class="wcmc-theme-switch__icon wcmc-theme-switch__icon--sun d-flex align-items-center justify-content-center">
                  <svg width="14" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                  </svg>
                </span>
                <span class="wcmc-theme-switch__icon wcmc-theme-switch__icon--moon d-flex align-items-center justify-content-center">
                  <svg width="14" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                  </svg>
                </span>
                <div class="wcmc-theme-switch__knob position-absolute rounded-circle"></div>
              </div>
            </button>
            
            <!-- Language selector -->
            <div v-if="languageVisible" ref="langSelectorMobile" class="wcmc-lang-selector position-relative" style="min-width: 88px;">
              <div
                class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center"
                role="button"
                style="border: none;"
                tabindex="0"
                aria-label="Language"
                @click.stop="toggleLangDropdown"
                @keydown.enter.prevent="toggleLangDropdown"
                @keydown.space.prevent="toggleLangDropdown"
              >
                <span class="flex-grow-1 text-start text-truncate d-flex pe-3 justify-content-end">{{ lang.toUpperCase() }}</span>
                <svg
                  class="wcmc-filter-chevron flex-shrink-0"
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  :style="{ transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
                >
                  <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </div>

              <div
                v-show="langDropdownOpen"
                class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1"
                @click.stop
              >
            <div
              v-for="langCode in availableLanguages"
              :key="langCode"
              class="wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2"
              :class="{
                'wcmc-dropdown-item--selected': lang === langCode,
                'wcmc-cursor-pointer': lang !== langCode,
                'wcmc-dropdown-item--disabled': lang === langCode
              }"
              @click="lang !== langCode && setLanguage(langCode)"
            >
              <span class="small">{{ langCode.toUpperCase() }}</span>
            </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Second row: Page title (will be in each view now) -->
      </div>

      <!-- Desktop Header Layout -->
      <div class="d-none d-md-block">
        <div class="row align-items-center g-0">
          <!-- Left Column: Logo and Title -->
          <div class="col-md-auto d-flex align-items-center gap-4 justify-content-start">
            <div class="wcmc-header__left d-flex align-items-center gap-4">
              <!-- Logo -->
              <div class="wcmc-logo d-flex align-items-center">
                <img 
                  :src="theme === 'light' ? logoDarkSvg : logoSvg" 
                  alt="Logo" 
                  class="wcmc-icon-40"
                />
              </div>
              <!-- Title -->
              <h1 class="wcmc-header__title mb-0">{{ currentTitle }}</h1>
            </div>
          </div>

          <!-- Center Column: Navigation -->
          <div v-if="navbarVisible" class="col-md d-flex align-items-center justify-content-center">
            <div class="wcmc-header__center d-flex align-items-center justify-content-center">
              <nav class="wcmc-nav d-flex align-items-center gap-4 flex-wrap justify-content-center">
                <button
                  v-for="item in visibleMenuItems"
                  :key="item.key"
                  class="wcmc-nav__item d-flex align-items-center gap-2 p-2 rounded border-0 fw-medium"
                  :class="{ 'wcmc-nav__item--active': tab === item.key }"
                  type="button"
                  @click="setTab(item.key)"
                >
                  <img 
                    :src="theme === 'light' ? item.iconLight : item.iconDark" 
                    :alt="t(item.label)" 
                    class="wcmc-nav__icon flex-shrink-0 d-block"
                  />
                  <span>{{ t(item.label) }}</span>
                </button>
              </nav>
            </div>
          </div>

          <!-- Right Column: Theme and Language Switches -->
          <div class="col-md-auto d-flex align-items-center gap-3 justify-content-end">
            <div class="wcmc-header__right d-flex align-items-center gap-3">
              <!-- Theme Toggle Switch -->
              <button
                v-if="lightDarkVisible"
                class="wcmc-theme-switch border-0 p-0 d-flex align-items-center"
                type="button"
                :aria-label="theme === 'dark' ? t('light') : t('dark')"
                :data-theme="theme"
                @click="toggleTheme"
              >
                <div class="wcmc-theme-switch__track d-flex align-items-center justify-content-between rounded-pill">
                  <span class="wcmc-theme-switch__icon wcmc-theme-switch__icon--sun d-flex align-items-center justify-content-center">
                    <svg width="14" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                    </svg>
                  </span>
                  <span class="wcmc-theme-switch__icon wcmc-theme-switch__icon--moon d-flex align-items-center justify-content-center">
                    <svg width="14" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                    </svg>
                  </span>
                  <div class="wcmc-theme-switch__knob position-absolute rounded-circle"></div>
                </div>
              </button>
              <!-- Language selector -->
              <div v-if="languageVisible" ref="langSelectorDesktop" class="wcmc-lang-selector position-relative" style="min-width: 88px;">
                <div
                  class="wcmc-filter-select wcmc-filter-select-base form-select d-flex align-items-center"
                  role="button"
                  tabindex="0"
                  style="border: none;"
                  aria-label="Language"
                  @click.stop="toggleLangDropdown"
                  @keydown.enter.prevent="toggleLangDropdown"
                  @keydown.space.prevent="toggleLangDropdown"
                >
                  <span class="flex-grow-1 text-start text-truncate d-flex pe-3 justify-content-end">{{ lang.toUpperCase() }}</span>
                  <svg
                    class="wcmc-filter-chevron flex-shrink-0"
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    :style="{ transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }"
                  >
                    <path d="M1 1L5 5L9 1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>

                <div
                  v-show="langDropdownOpen"
                  class="wcmc-dropdown-menu wcmc-dropdown-menu-base shadow rounded position-absolute w-100 p-2 mt-1"
                  @click.stop
                >
                  <div
                    v-for="langCode in availableLanguages"
                    :key="langCode"
                    class="wcmc-dropdown-item p-2 rounded mb-1 d-flex align-items-center gap-2"
                    :class="{
                      'wcmc-dropdown-item--selected': lang === langCode,
                      'wcmc-cursor-pointer': lang !== langCode,
                      'wcmc-dropdown-item--disabled': lang === langCode
                    }"
                    @click="lang !== langCode && setLanguage(langCode)"
                  >
                    <span class="small">{{ langCode.toUpperCase() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="wcmc-content px-3">
      <component :is="currentView" v-bind="currentProps" />
    </div>

    <!-- Footer -->
    <footer class="wcmc-footer pb-3 pt-4">
      <div class="wcmc-footer__text d-flex align-items-center justify-content-center gap-2">
        <span>Powered by Open Data Hub</span>
        <img 
          :src="theme === 'light' ? logoDarkSvg : logoSvg" 
          alt="Logo" 
          class="wcmc-icon-20"
        />
      </div>
    </footer>

    <!-- Mobile Bottom Navigation (sticky at end of page) -->
    <nav class="d-md-none wcmc-mobile-nav bg-dark px-5">
      <div class="row h-100 g-0">
        <button
          v-for="item in visibleMenuItems"
          :key="item.key"
          type="button"
          class="wcmc-mobile-nav__item col d-flex flex-column align-items-center justify-content-center gap-1 border-0 bg-transparent"
          :class="{ 'wcmc-mobile-nav__item--active': tab === item.key }"
          @click="setTab(item.key)"
        >
          <img 
            :src="theme === 'light' ? item.iconLight : item.iconDark" 
            :alt="t(item.label)" 
            class="wcmc-mobile-nav__icon wcmc-icon-24"
          />
          <span class="wcmc-mobile-nav__label">{{ t(item.label) }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue';
import { createStore } from './store';

import MarketsList from './views/MarketsList.vue';
import FairsList from './views/FairsList.vue';
import FairsDetail from './views/FairsDetail.vue';
import MapView from './views/MapView.vue';
import CommunityList from './views/CommunityList.vue';
import CommunityDetail from './views/CommunityDetail.vue';
import logoSvg from './logo/OpenDataHub_Logo_white.svg';
import logoDarkSvg from './logo/OpenDataHub_Logo_dark.svg';
import fairsDarkSvg from './svgs/fairs_dark.svg';
import fairsLightSvg from './svgs/fairs_light.svg';
import marketDarkSvg from './svgs/market_dark.svg';
import marketLightSvg from './svgs/market_light.svg';
import mapDarkSvg from './svgs/map_dark.svg';
import mapLightSvg from './svgs/map_light.svg';
import communityDarkSvg from './svgs/communiyt_dark.svg';
import communityLightSvg from './svgs/comunity_light.svg';

const props = defineProps({
  config: { type: Object, required: true },
  host: { type: Object, required: false, default: null },
});

const store = createStore(props.config);

const tab = computed(() => store.state.activeTab);
function setTab(v) {
  store.setTab(v);
}

const currentView = computed(() => {
  switch (store.state.route.name) {
    case 'marketsList':
      return MarketsList;
    case 'marketDetail':
      return FairsDetail; // Use FairsDetail for markets too
    case 'fairsList':
      return FairsList;
    case 'fairsDetail':
      return FairsDetail;
    case 'map':
      return MapView;
    case 'communityList':
      return CommunityList;
    case 'communityDetail':
      return CommunityDetail;
    default:
      return MarketsList;
  }
});

const currentProps = computed(() => {
  const r = store.state.route;
  if (r.name === 'marketDetail') return { config: props.config, store, id: String(r.params.id || '') };
  if (r.name === 'fairsDetail') return { config: props.config, store, id: String(r.params.id || '') };
  if (r.name === 'communityDetail')
    return {
      config: props.config,
      store,
      id: String(r.params.id || ''),
      name: String(r.params.name || 'Community'),
    };
  return { config: props.config, store };
});

function t(key) {
  const lang = props.config.language || 'en';
  const dict = {
    en: { fairs: 'Fairs', markets: 'Markets', map: 'Map', community: 'Community', light: 'Light', dark: 'Dark' },
    it: { fairs: 'Fiere', markets: 'Mercati', map: 'Mappa', community: 'Comunità', light: 'Chiaro', dark: 'Scuro' },
    de: { fairs: 'Messen', markets: 'Märkte', map: 'Karte', community: 'Community', light: 'Hell', dark: 'Dunkel' },
  };
  return (dict[lang] && dict[lang][key]) || dict.en[key] || key;
}

const lang = computed(() => props.config.language || 'it');
const theme = computed(() => {
  const currentTheme = props.config.theme || 'light';
  const availableThemes = props.config.availableThemes || ['light', 'dark'];
  // If current theme is not available, use first available or fallback to light
  if (availableThemes.includes(currentTheme)) {
    return currentTheme;
  }
  return availableThemes[0] || 'light';
});

const navbarVisible = computed(() => {
  return props.config.navbarVisibility !== false; // Default to true if not set
});

const languageVisible = computed(() => {
  return props.config.languageVisibility !== false; // Default to true if not set
});

const lightDarkVisible = computed(() => {
  const availableThemes = props.config.availableThemes || ['light', 'dark'];
  // Show toggle only if both themes are available
  return props.config.lightDarkVisibility !== false && availableThemes.length > 1;
});

const visibleMenuItems = computed(() => {
  const visibility = props.config.menuVisibility;
  const defaultOrder = ['fairs', 'markets', 'map', 'community'];
  
  let order = defaultOrder;
  if (Array.isArray(visibility) && visibility.length > 0) {
    // Map uppercase config keys to lowercase internal keys
    const itemMap = {
      'FAIRS': 'fairs',
      'MARKETS': 'markets',
      'MAP': 'map',
      'COMMUNITY': 'community'
    };
    
    // Filter and map config items
    const configOrder = visibility
      .map(item => itemMap[item] || item.toLowerCase())
      .filter(item => defaultOrder.includes(item));
      
    if (configOrder.length > 0) {
      order = configOrder;
    }
  }
  
  return order.map(key => {
    switch (key) {
      case 'fairs':
        return {
          key: 'fairs',
          label: 'fairs', // translation key
          iconLight: marketLightSvg,
          iconDark: marketDarkSvg
        };
      case 'markets':
        return {
          key: 'markets',
          label: 'markets',
          iconLight: fairsLightSvg,
          iconDark: fairsDarkSvg
        };
      case 'map':
        return {
          key: 'map',
          label: 'map',
          iconLight: mapLightSvg,
          iconDark: mapDarkSvg
        };
      case 'community':
        return {
          key: 'community',
          label: 'community',
          iconLight: communityLightSvg,
          iconDark: communityDarkSvg
        };
      default:
        return null;
    }
  }).filter(Boolean);
});

function menuItemVisible(item) {
   // Deprecated in favor of visibleMenuItems loop, keeping for safety if needed elsewhere
   return visibleMenuItems.value.some(i => i.key === item);
}

const currentTitle = computed(() => {
  const currentLang = props.config.language || 'it';
  if (currentLang === 'it' && props.config.titleItalian) return props.config.titleItalian;
  if (currentLang === 'en' && props.config.titleEnglish) return props.config.titleEnglish;
  if (currentLang === 'de' && props.config.titleGerman) return props.config.titleGerman;
  return props.config.title || 'Mercati in Alto Adige';
});

const availableLanguages = computed(() => {
  return props.config.languages || ['en', 'it', 'de'];
});

const langDropdownOpen = ref(false);
const langSelectorMobile = ref(null);
const langSelectorDesktop = ref(null);

function toggleLangDropdown() {
  langDropdownOpen.value = !langDropdownOpen.value;
}

function closeLangDropdown() {
  langDropdownOpen.value = false;
}

function setLanguage(nextLang) {
  onChangeLanguage({ target: { value: String(nextLang) } });
  closeLangDropdown();
}

function handleLangClickOutside(event) {
  const isInside =
    langSelectorMobile.value?.contains?.(event.target) ||
    langSelectorDesktop.value?.contains?.(event.target);

  if (!isInside) closeLangDropdown();
}

function onChangeLanguage(e) {
  const next = String(e?.target?.value || 'en');
  props.config.language = next;
  if (props.host && typeof props.host.setAttribute === 'function') {
    props.host.setAttribute('language', next);
  }
}

function onToggleTheme(e) {
  const checked = Boolean(e?.target?.checked);
  const next = checked ? 'dark' : 'light';
  props.config.theme = next;
  if (props.host && typeof props.host.setAttribute === 'function') {
    props.host.setAttribute('theme', next);
  }
}

function toggleTheme() {
  const currentTheme = props.config.theme || 'light';
  const availableThemes = props.config.availableThemes || ['light', 'dark'];
  // Find next theme in available themes, or cycle to first
  const currentIndex = availableThemes.indexOf(currentTheme);
  const nextIndex = currentIndex >= 0 && currentIndex < availableThemes.length - 1 
    ? currentIndex + 1 
    : 0;
  const next = availableThemes[nextIndex] || 'light';
  props.config.theme = next;
  if (props.host && typeof props.host.setAttribute === 'function') {
    props.host.setAttribute('theme', next);
  }
}


watch(currentTitle, (newTitle) => {
  document.title = newTitle;
}, { immediate: true });

onMounted(() => {
  document.addEventListener('click', handleLangClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleLangClickOutside);
});
</script>


