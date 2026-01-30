// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import envConfig from './envConfig.js';

const DEFAULT_API_BASE = 'https://tourism.api.opendatahub.testingmachine.eu';

/** Defaults aligned with wcs-manifest.json configuration.options (Store contract). Component does not load manifest at runtime. */
export function defaultConfig() {
  const apiBaseFromEnv = envConfig.API_BASE_URL && String(envConfig.API_BASE_URL).trim();
  return {
    titleItalian: 'Mercati in Alto Adige',
    titleEnglish: 'Markets in Alto Adige',
    titleGerman: 'Märkte in Alto Adige',
    source: 'hds',
    colorPresets: ['OPENDATAHUB'],
    language: 'en',
    languages: ['en', 'it', 'de'],
    availableThemes: ['light', 'dark'],
    menuVisibility: ['fairs', 'markets', 'map', 'community'],
    filterZoneDefaultValue: '',
    filterCategoryDefaultValue: '',
    navbarVisibility: true,
    languageVisibility: true,
    lightDarkVisibility: true,
    fairsMapZoom: 15,
    mapCenter: { lat: 46.5, lon: 11.5 },
    mapZoom: 9,
    filterVisibility: true,
    theme: 'light',
    initialView: 'markets',
    apiBase: apiBaseFromEnv || DEFAULT_API_BASE,
    pageSize: 20,
    debug: false,
  };
}

function normalizeTheme(v) {
  if (v === 'light' || v === 'dark') return v;
  return null;
}

export function getSystemTheme() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function normalizeLanguage(v) {
  if (v === 'it' || v === 'de' || v === 'en') return v;
  return 'en';
}

function normalizeInitialView(v) {
  if (v === 'markets' || v === 'fairs' || v === 'map' || v === 'community') return v;
  return 'markets';
}

function parseBool(v) {
  if (v === '' || v === null || v === undefined) return false;
  return String(v).toLowerCase() === 'true';
}

function parseIntSafe(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function configFromAttributes(el) {
  const cfg = defaultConfig();

  const language = el.getAttribute('language');
  const theme = el.getAttribute('theme');
  const initialView = el.getAttribute('initial-view');
  const pageSize = el.getAttribute('page-size');
  const debug = el.getAttribute('debug');

  if (language) cfg.language = normalizeLanguage(language);
  const normalizedTheme = theme ? normalizeTheme(theme) : null;
  cfg.theme = normalizedTheme || getSystemTheme();
  if (initialView) cfg.initialView = normalizeInitialView(initialView);
  if (pageSize) cfg.pageSize = parseIntSafe(pageSize, cfg.pageSize);
  if (debug !== null) cfg.debug = parseBool(debug);

  return cfg;
}

/** Kebab-case attribute name -> config key (camelCase). Matches wcs-manifest.json configuration.options. */
const ATTR_TO_CONFIG = {
  'title-italian': 'titleItalian',
  'title-english': 'titleEnglish',
  'title-german': 'titleGerman',
  'source': 'source',
  'color-presets': 'colorPresets',
  'language': 'language',
  'filter-zone-default-value': 'filterZoneDefaultValue',
  'filter-category-default-value': 'filterCategoryDefaultValue',
  'navbar-visibility': 'navbarVisibility',
  'language-visibility': 'languageVisibility',
  'light-dark-visibility': 'lightDarkVisibility',
  'zoom-fairs-markets-map': 'fairsMapZoom',
  'center-maps-maps': 'mapCenter',
  'zoom-maps-maps': 'mapZoom',
  'filter': 'filterVisibility',
  'theme': 'theme',
  'initial-view': 'initialView',
  'page-size': 'pageSize',
  'debug': 'debug',
};

/** Returns only config overrides for attributes that are actually set on the element. Use after defaultConfig() so attributes override defaults only when present. */
export function configOverridesFromAttributes(el) {
  const overrides = {};
  for (const [attr, configKey] of Object.entries(ATTR_TO_CONFIG)) {
    const raw = el.getAttribute(attr);
    if (raw == null) continue;
    let value;
    if (configKey === 'theme') {
      value = normalizeTheme(raw);
      if (value) overrides.theme = value;
      continue;
    }
    if (configKey === 'language') {
      overrides.language = normalizeLanguage(raw);
      continue;
    }
    if (configKey === 'initialView') {
      overrides.initialView = normalizeInitialView(raw);
      continue;
    }
    if (configKey === 'mapCenter' && typeof raw === 'string') {
      const coords = raw.split(',').map((v) => parseFloat(v.trim()));
      if (coords.length === 2 && coords.every((n) => !isNaN(n))) {
        overrides.mapCenter = { lat: coords[0], lon: coords[1] };
      }
      continue;
    }
    if (configKey === 'fairsMapZoom' || configKey === 'mapZoom' || configKey === 'pageSize') {
      const n = parseIntSafe(raw, configKey === 'pageSize' ? 20 : configKey === 'fairsMapZoom' ? 15 : 9);
      overrides[configKey] = n;
      continue;
    }
    if (configKey === 'navbarVisibility' || configKey === 'languageVisibility' || configKey === 'lightDarkVisibility' || configKey === 'filterVisibility' || configKey === 'debug') {
      overrides[configKey] = parseBool(raw);
      continue;
    }
    overrides[configKey] = raw === '' ? raw : String(raw).trim();
  }
  return overrides;
}


