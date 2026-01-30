// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createApp, reactive } from 'vue';
import App from './app/App.vue';
import { configFromAttributes, defaultConfig, getSystemTheme } from './app/config';

// CSS is bundled into the JS and injected into Shadow DOM
import bootstrapCss from 'bootstrap/dist/css/bootstrap.min.css';
import leafletCss from 'leaflet/dist/leaflet.css';
import baseCss from './app/styles.css';
import rawConfig from '../.config';

const TAG_NAME = 'webcomp-market-calendar';

class WebcompMarketCalendar extends HTMLElement {
  static get observedAttributes() {
    return ['language', 'theme', 'initial-view', 'api-base', 'page-size', 'debug'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._config = reactive(defaultConfig());
    this._app = null;
    this._mounted = false;
    this._mediaQueryList = null;
    this._onSystemThemeChange = null;

    this._styleEl = document.createElement('style');
    this._styleEl.textContent = `${bootstrapCss}\n${leafletCss}\n${baseCss}`;

    this._mountPoint = document.createElement('div');
    this._mountPoint.className = 'wcmc-root';

    this._shadow.appendChild(this._styleEl);
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
    this._setupSystemThemeListenerIfNeeded();
    this._applyThemeToShadowRoot();
  }

  _applyAttributesToConfig() {
    const next = configFromAttributes(this);
    Object.assign(this._config, next);
  }

  _applyConfigVariables() {
    if (!rawConfig) return;
    const lines = rawConfig.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split('=');
      if (parts.length < 2) return;
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && value) {
        // Convert KEY_NAME to --key-name
        const cssVarName = '--' + key.toLowerCase().replace(/_/g, '-');
        this._mountPoint.style.setProperty(cssVarName, value);

        // Special case: map PRIMARY_COLOR to --primary-color if generic
        if (key === 'PRIMARY_COLOR') {
          this._mountPoint.style.setProperty('--primary-color', value);
        }
        
        // Map PRIMARY_COLOR_DARK and PRIMARY_COLOR_LIGHT to --primary-color based on theme
        if (key === 'PRIMARY_COLOR_DARK') {
          this._mountPoint.style.setProperty('--primary-color-dark', value);
          // Also set --primary-color if in dark mode
          if (this._config.theme === 'dark') {
            this._mountPoint.style.setProperty('--primary-color', value);
          }
        }
        if (key === 'PRIMARY_COLOR_LIGHT') {
          this._mountPoint.style.setProperty('--primary-color-light', value);
          // Also set --primary-color if in light mode
          if (this._config.theme === 'light') {
            this._mountPoint.style.setProperty('--primary-color', value);
          }
        }

        // Parse CENTER_MAPS_MAPS (format: "lat,lon")
        if (key === 'CENTER_MAPS_MAPS') {
          const coords = value.split(',').map(v => parseFloat(v.trim()));
          if (coords.length === 2 && coords.every(n => !isNaN(n))) {
            this._config.mapCenter = { lat: coords[0], lon: coords[1] };
          }
        }

        // Parse ZOOM_MAPS_MAPS
        if (key === 'ZOOM_MAPS_MAPS') {
          const zoom = parseInt(value, 10);
          if (!isNaN(zoom) && zoom > 0) {
            this._config.mapZoom = zoom;
          }
        }

        // Parse ZOOM_FAIRS_MARKETS_MAP
        if (key === 'ZOOM_FAIRS_MARKETS_MAP') {
          const zoom = parseInt(value, 10);
          if (!isNaN(zoom) && zoom > 0) {
            this._config.fairsMapZoom = zoom;
          }
        }

        if (key === 'TITLE') {
          this._config.title = value;
        }
        if (key === 'TITLE_ITALIAN') {
          this._config.titleItalian = value;
        }
        if (key === 'TITLE_ENGLISH') {
          this._config.titleEnglish = value;
        }
        if (key === 'TITLE_GERMAN') {
          this._config.titleGerman = value;
        }
        
        // Parse LANGUAGE array format: [EN,IT,DE]
        if (key === 'LANGUAGE') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const langs = match[1].split(',').map(l => l.trim().toLowerCase());
            this._config.languages = langs;
            // Set default to 'it' if available, otherwise first language
            if (!this._config.language) {
              this._config.language = langs.includes('it') ? 'it' : (langs[0] || 'it');
            }
          }
        }

        // Parse SOURCE
        if (key === 'SOURCE') {
          this._config.source = value.trim();
        }

        // Parse THEME_COLOR array format: [LIGHT, DARK]
        if (key === 'THEME_COLOR') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const themes = match[1].split(',').map(t => t.trim().toLowerCase()).filter(t => t);
            this._config.availableThemes = themes;
            
            // If only one theme is available, set it automatically
            if (themes.length === 1) {
              this._config.theme = themes[0];
              // Update attribute if available
              if (this.setAttribute) {
                this.setAttribute('theme', themes[0]);
              }
              // Apply theme immediately
              this._applyThemeToShadowRoot();
            } else if (themes.length > 0) {
              // If multiple themes available, validate current theme is in the list
              const currentTheme = this._config.theme || 'light';
              if (!themes.includes(currentTheme)) {
                // Current theme is not available, switch to first available
                this._config.theme = themes[0];
                if (this.setAttribute) {
                  this.setAttribute('theme', themes[0]);
                }
                // Apply theme immediately
                this._applyThemeToShadowRoot();
              }
            }
          }
        }

        // Parse MENU_VISIBILITY array format: [FAIRS, MARKETS, MAP, COMMUNITY]
        if (key === 'MENU_VISIBILITY') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const menuItems = match[1].split(',').map(m => m.trim().toLowerCase());
            this._config.menuVisibility = menuItems;
          }
        }

        // Parse FILTER_ZONE_DEFAULT_VALUE
        if (key === 'FILTER_ZONE_DEFAULT_VALUE') {
          if (value) {
            this._config.filterZoneDefaultValue = value.trim();
          }
        }

        // Parse FILTER_CATEGORY_DEFAULT_VALUE
        if (key === 'FILTER_CATEGORY_DEFAULT_VALUE') {
          if (value) {
            this._config.filterCategoryDefaultValue = value.trim();
          }
        }

        // Parse NAVBAR_VISIBILITY - boolean format: [TRUE, FALSE] (first value is the setting)
        if (key === 'NAVBAR_VISIBILITY') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const parts = match[1].split(',').map(p => p.trim().toUpperCase());
            // Use first value as the actual setting
            this._config.navbarVisibility = parts[0] === 'TRUE';
          } else {
            // Fallback: parse as direct boolean string
            const boolStr = value.trim().toUpperCase();
            this._config.navbarVisibility = boolStr === 'TRUE';
          }
        }

        // Parse LANGUAGE_VISIBILITY - boolean format: [TRUE, FALSE] (first value is the setting)
        if (key === 'LANGUAGE_VISIBILITY') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const parts = match[1].split(',').map(p => p.trim().toUpperCase());
            this._config.languageVisibility = parts[0] === 'TRUE';
          } else {
            const boolStr = value.trim().toUpperCase();
            this._config.languageVisibility = boolStr === 'TRUE';
          }
        }

        // Parse LIGHT_DARK_VISIBILITY - boolean format: [TRUE, FALSE] (first value is the setting)
        if (key === 'LIGHT_DARK_VISIBILITY') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const parts = match[1].split(',').map(p => p.trim().toUpperCase());
            this._config.lightDarkVisibility = parts[0] === 'TRUE';
          } else {
            const boolStr = value.trim().toUpperCase();
            this._config.lightDarkVisibility = boolStr === 'TRUE';
          }
        }

        // Parse FILTER - boolean format: [TRUE, FALSE] (first value is the setting)
        if (key === 'FILTER') {
          const match = value.match(/\[([^\]]+)\]/);
          if (match) {
            const parts = match[1].split(',').map(p => p.trim().toUpperCase());
            this._config.filterVisibility = parts[0] === 'TRUE';
          } else {
            const boolStr = value.trim().toUpperCase();
            this._config.filterVisibility = boolStr === 'TRUE';
          }
        }

        // Parse PAGE_SIZE
        if (key === 'PAGE_SIZE') {
          const pageSize = parseInt(value.trim(), 10);
          if (!isNaN(pageSize) && pageSize > 0) {
            this._config.pageSize = pageSize;
          }
        }

        // Map SECONDARY_COLOR (light/dark variants handled via CSS variables)
        // Already set as CSS variable above

        // Map TERTIARY_COLOR (light/dark variants handled via CSS variables)
        // Already set as CSS variable above

        // COLOR_INDICATOR_POSITION_FAIRS_MAP and COLOR_INDICATOR_POSITION_MARKETS_MAP
        // Already set as CSS variables above
      }
    });
    
    // Final validation: ensure current theme is valid after all config is parsed
    const availableThemes = this._config.availableThemes;
    if (availableThemes && Array.isArray(availableThemes) && availableThemes.length > 0) {
      const currentTheme = this._config.theme || 'light';
      if (!availableThemes.includes(currentTheme)) {
        // Current theme is not available, switch to first available
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


