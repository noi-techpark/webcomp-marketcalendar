// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export function defaultConfig() {
  return {
    language: 'en',
    theme: 'light',
    initialView: 'markets',
    apiBase: 'https://tourism.api.opendatahub.testingmachine.eu',
    pageSize: 8,
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
  const apiBase = el.getAttribute('api-base');
  const pageSize = el.getAttribute('page-size');
  const debug = el.getAttribute('debug');

  if (language) cfg.language = normalizeLanguage(language);
  const normalizedTheme = theme ? normalizeTheme(theme) : null;
  cfg.theme = normalizedTheme || getSystemTheme();
  if (initialView) cfg.initialView = normalizeInitialView(initialView);
  if (apiBase) cfg.apiBase = String(apiBase);
  if (pageSize) cfg.pageSize = parseIntSafe(pageSize, cfg.pageSize);
  if (debug !== null) cfg.debug = parseBool(debug);

  return cfg;
}


