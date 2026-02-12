// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createApp, reactive } from 'vue';
import App from './app/App.vue';
import { configOverridesFromAttributes, defaultConfig, getSystemTheme } from './app/config';

// CSS is bundled into the JS and injected into Shadow DOM
import bootstrapCss from 'bootstrap/dist/css/bootstrap.min.css';
import leafletCss from 'leaflet/dist/leaflet.css';
import baseCss from './app/styles.css';
import opendatahubPreset from '../config-presets/opendatahub.preset';
import hdsPreset from '../config-presets/hds.preset';

/** Preset name (from color-presets attribute) -> preset file content (KEY=value lines). */
const PRESET_MAP = {
  OPENDATAHUB: opendatahubPreset,
  HDS: hdsPreset,
};

/** Resolve logo path from preset (e.g. "src/app/logo/OpenDataHub_Logo_dark.svg") to require context key and return URL. */
const logoContext = require.context('./app/logo', false, /\.svg$/);
function resolveLogoUrl(presetPath) {
  if (!presetPath || typeof presetPath !== 'string') return null;
  const trimmed = presetPath.trim();
  const filename = trimmed.split(/[/\\]/).pop();
  if (!filename) return null;
  try {
    const mod = logoContext('./' + filename);
    return mod?.default ?? mod ?? null;
  } catch {
    return null;
  }
}

/** Default logos when preset does not define LOGO_LIGHT / LOGO_DARK (light theme = dark logo, dark theme = light logo). */
const defaultLogoLight = require('./app/logo/OpenDataHub_Logo_dark.svg');
const defaultLogoDark = require('./app/logo/OpenDataHub_Logo_white.svg');

const TAG_NAME = 'webcomp-market-calendar';

class WebcompMarketCalendar extends HTMLElement {
  static get observedAttributes() {
    return [
      'title-italian', 'title-english', 'title-german', 'source', 'color-presets',
      'language', 'filter-zone-default-value', 'filter-category-default-value',
      'navbar-visibility', 'language-visibility', 'light-dark-visibility',
      'zoom-fairs-markets-map', 'center-maps-maps', 'zoom-maps-maps', 'filter',
      'theme', 'initial-view', 'page-size', 'debug',
    ];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._config = reactive(defaultConfig());
    this._app = null;
    this._mounted = false;
    this._mediaQueryList = null;
    this._onSystemThemeChange = null;

    const style = document.createElement('style');
    style.textContent = `${bootstrapCss}\n${leafletCss}\n${baseCss}`;
    this._shadow.appendChild(style);

    this._mountPoint = document.createElement('div');
    this._mountPoint.className = 'wcmc-root';

    this._shadow.appendChild(this._mountPoint);
  }

  connectedCallback() {
    this._applyAttributesToConfig();
    this._applyConfigVariables();
    this._setupSystemThemeListenerIfNeeded();
    this._applyThemeToShadowRoot();
    if (this._mounted) return;

    this._app = createApp(App, { config: this._config, host: this });
    this._app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('odh-') || tag === 'interactive-map' || tag === 'search-items';
    this._app.mount(this._mountPoint);
    this._mounted = true;
    // Ensure body background is applied on mount
    this._applyBodyBackground(this._config.theme || 'light');
  }

  disconnectedCallback() {
    try {
      this._app?.unmount();
    } finally {
      this._teardownSystemThemeListener();
      this._app = null;
      this._mounted = false;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._applyAttributesToConfig();
    this._applyConfigVariables();
    this._setupSystemThemeListenerIfNeeded();
    this._applyThemeToShadowRoot();
  }

  _applyAttributesToConfig() {
    const overrides = configOverridesFromAttributes(this);
    Object.assign(this._config, overrides);
  }

  /** Apply ASPECTS from the preset file selected by color-presets (e.g. OPENDATAHUB → config-presets/opendatahub.preset). */
  _applyConfigVariables() {
    this._config.logoLight = this._config.logoLight || (defaultLogoLight?.default ?? defaultLogoLight);
    this._config.logoDark = this._config.logoDark || (defaultLogoDark?.default ?? defaultLogoDark);

    const raw = this._config.colorPresets;
    const presetName = raw == null
      ? null
      : (Array.isArray(raw) ? raw[0] : raw);
    if (!presetName) return;
    const key = String(presetName).trim().toUpperCase();
    const presetContent = PRESET_MAP[key];
    if (!presetContent || typeof presetContent !== 'string') return;

    const lines = presetContent.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split('=');
      if (parts.length < 2) return;
      const lineKey = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (!lineKey || !value) return;

      if (lineKey === 'LOGO_LIGHT') {
        const url = resolveLogoUrl(value);
        if (url) this._config.logoLight = url;
        return;
      }
      if (lineKey === 'LOGO_DARK') {
        const url = resolveLogoUrl(value);
        if (url) this._config.logoDark = url;
        return;
      }

      const cssVarName = '--' + lineKey.toLowerCase().replace(/_/g, '-');
      this._mountPoint.style.setProperty(cssVarName, value);
      if (lineKey === 'PRIMARY_COLOR') {
        this._mountPoint.style.setProperty('--primary-color', value);
      }
      if (lineKey === 'PRIMARY_COLOR_DARK') {
        this._mountPoint.style.setProperty('--primary-color-dark', value);
        if (this._config.theme === 'dark') {
          this._mountPoint.style.setProperty('--primary-color', value);
        }
      }
      if (lineKey === 'PRIMARY_COLOR_LIGHT') {
        this._mountPoint.style.setProperty('--primary-color-light', value);
        if (this._config.theme === 'light') {
          this._mountPoint.style.setProperty('--primary-color', value);
        }
      }
    });

    const availableThemes = this._config.availableThemes;
    if (availableThemes && Array.isArray(availableThemes) && availableThemes.length > 0) {
      const currentTheme = this._config.theme || 'light';
      if (!availableThemes.includes(currentTheme)) {
        this._config.theme = availableThemes[0];
        if (this.setAttribute) {
          this.setAttribute('theme', availableThemes[0]);
        }
        this._applyThemeToShadowRoot();
      }
    }
  }

  _applyThemeToShadowRoot() {
    const theme = this._config.theme || 'light';
    // Bootstrap 5.3 reads data-bs-theme to switch CSS variables
    // The CSS already handles --primary-color via var(--primary-color-dark) or var(--primary-color-light)
    this._mountPoint.dataset.bsTheme = theme;
    // Apply background color to body based on theme
    this._applyBodyBackground(theme);
  }

  _applyBodyBackground(theme) {
    // Set body background to match theme (outside Shadow DOM)
    if (theme === 'dark') {
      document.body.style.backgroundColor = '#171717';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    } else {
      document.body.style.backgroundColor = '#fff';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
    }
  }

  _setupSystemThemeListenerIfNeeded() {
    // Don't follow system theme if only one theme is available or if theme is explicitly set
    const availableThemes = this._config.availableThemes || ['light', 'dark'];
    const explicitTheme = this.getAttribute('theme');
    
    // If only one theme is available, don't follow system changes
    if (availableThemes.length === 1 || explicitTheme) {
      this._teardownSystemThemeListener();
      return;
    }

    if (this._mediaQueryList) return;

    try {
      this._mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
      this._onSystemThemeChange = () => {
        // only apply if attribute still not set and multiple themes are available
        const currentAvailableThemes = this._config.availableThemes || ['light', 'dark'];
        if (this.getAttribute('theme') || currentAvailableThemes.length === 1) return;
        
        const systemTheme = getSystemTheme();
        // Only apply system theme if it's in the available themes list
        if (currentAvailableThemes.includes(systemTheme)) {
          this._config.theme = systemTheme;
          this._applyThemeToShadowRoot();
        }
      };
      this._mediaQueryList.addEventListener('change', this._onSystemThemeChange);
      
      // ensure current system theme is applied (only if it's available)
      const systemTheme = getSystemTheme();
      if (availableThemes.includes(systemTheme)) {
        this._config.theme = systemTheme;
        this._applyThemeToShadowRoot();
      }
    } catch {
      // ignore
    }
  }

  _teardownSystemThemeListener() {
    if (!this._mediaQueryList || !this._onSystemThemeChange) return;
    try {
      this._mediaQueryList.removeEventListener('change', this._onSystemThemeChange);
    } catch {
      // ignore
    }
    this._mediaQueryList = null;
    this._onSystemThemeChange = null;
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, WebcompMarketCalendar);
}


