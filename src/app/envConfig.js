// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Build-time env config (same pattern as webcomp-events-today).
 * VUE_APP_* are injected by webpack DefinePlugin from .env / process.env.
 */
export default {
  API_BASE_URL: process.env.VUE_APP_TOURISM_BASE_PATH,
  ORIGIN: 'webcomp-market-calendar',
};
