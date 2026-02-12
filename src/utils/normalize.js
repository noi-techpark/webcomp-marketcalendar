// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

function firstTruthy(...vals) {
  for (const v of vals) {
    if (v !== null && v !== undefined && String(v).trim() !== '') return v;
  }
  return null;
}

function pickLangMap(langMap, lang) {
  if (!langMap || typeof langMap !== 'object') return null;
  return (
    langMap?.[lang] ??
    langMap?.en ??
    langMap?.it ??
    langMap?.de ??
    null
  );
}

export function getTitle(item, lang) {
  const detail = item?.Detail || {};
  const title =
    detail?.[lang]?.Title ??
    detail?.en?.Title ??
    detail?.it?.Title ??
    detail?.de?.Title ??
    null;

  return String(
    firstTruthy(title, item?.Shortname, item?.Id) ?? ''
  );
}

export function getMunicipalityName(item, lang) {
  // Try MunicipalityInfo first
  const nameMap = item?.LocationInfo?.MunicipalityInfo?.Name;
  const picked = pickLangMap(nameMap, lang);
  if (picked) return String(picked);

  // Try DistrictInfo as fallback
  const districtNameMap = item?.LocationInfo?.DistrictInfo?.Name;
  const district = pickLangMap(districtNameMap, lang);
  if (district) return String(district);

  // Try RegionInfo as fallback
  const regionNameMap = item?.LocationInfo?.RegionInfo?.Name;
  const region = pickLangMap(regionNameMap, lang);
  if (region) return String(region);

  // Try to extract from AddressInfo (city field)
  const addressInfo = item?.LocationInfo?.AddressInfo;
  if (addressInfo) {
    const city = pickLangMap(addressInfo?.City, lang) ||
      pickLangMap(addressInfo?.Municipality, lang) ||
      addressInfo?.City ||
      addressInfo?.Municipality;
    if (city) return String(city);
  }

  // Try to extract from title as last resort
  const title = getTitle(item, lang);
  if (title && title.trim()) {
    // Try to extract location from title (common patterns)
    // This is a heuristic and may not always work
    return title;
  }

  // Return empty string instead of 'Unknown' to let the component handle it
  return '';
}

export function getMunicipalityId(item) {
  const id = item?.LocationInfo?.MunicipalityInfo?.Id;
  return id !== undefined && id !== null ? String(id) : null;
}

export function getDistrictId(item) {
  const id = item?.LocationInfo?.DistrictInfo?.Id;
  return id !== undefined && id !== null ? String(id) : null;
}

export function getRegionId(item) {
  const id = item?.LocationInfo?.RegionInfo?.Id;
  return id !== undefined && id !== null ? String(id) : null;
}

export function getDistrictOrRegion(item, lang) {
  const districtNameMap = item?.LocationInfo?.DistrictInfo?.Name;
  const district = pickLangMap(districtNameMap, lang);
  const regionNameMap = item?.LocationInfo?.RegionInfo?.Name;
  const region = pickLangMap(regionNameMap, lang);
  return String(firstTruthy(district, region, '') ?? '');
}

export function getImageUrl(item) {
  // Get first image from ImageGallery
  const url = item?.ImageGallery?.[0]?.ImageUrl;
  return url ? String(url) : null;
}

export function getAllImageUrls(item) {
  // Get all images from ImageGallery
  if (!item?.ImageGallery || !Array.isArray(item.ImageGallery)) return [];
  return item.ImageGallery
    .map((img) => img?.ImageUrl || img?.Url)
    .filter((url) => url && String(url).trim() !== '');
}

export function getCoords(item) {
  const lat =
    item?.GpsPoints?.position?.Latitude ??
    item?.GpsPoints?.position?.latitude ??
    item?.GpsInfo?.[0]?.Latitude ??
    item?.GpsInfo?.[0]?.latitude ??
    null;
  const lon =
    item?.GpsPoints?.position?.Longitude ??
    item?.GpsPoints?.position?.longitude ??
    item?.GpsInfo?.[0]?.Longitude ??
    item?.GpsInfo?.[0]?.longitude ??
    null;

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
  return { lat: latNum, lon: lonNum };
}

function parseDateMaybe(d) {
  if (!d) return null;
  const dt = new Date(d);
  // invalid date -> NaN
  if (!Number.isFinite(dt.getTime())) return null;
  return dt;
}

export function getScheduleEntries(item) {
  const sched = Array.isArray(item?.OperationSchedule) ? item.OperationSchedule : [];
  return sched
    .map((s) => {
      const start = parseDateMaybe(s?.Start ?? s?.StartDate ?? s?.StartDateTime);
      const end = parseDateMaybe(s?.End ?? s?.EndDate ?? s?.EndDateTime ?? s?.Stop);
      if (!start && !end) return null;
      return {
        start: start ? start.toISOString() : null,
        end: end ? end.toISOString() : null,
        raw: s,
        operationScheduleTime: s?.OperationScheduleTime || [],
      };
    })
    .filter(Boolean);
}

/**
 * Check if a date is a placeholder/default date (like 2025-01-01)
 */
function isPlaceholderDate(date) {
  if (!date) return false;
  const d = new Date(date);
  // Check if it's January 1st of any year (common placeholder)
  return d.getMonth() === 0 && d.getDate() === 1;
}

/**
 * Get all months covered by schedule entries, considering full year ranges
 */
/**
 * Get weekdays when the market/fair is active from OperationScheduleTime
 * Returns array of weekday indices (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export function getScheduleWeekdays(item) {
  const entries = getScheduleEntries(item);
  if (!entries.length) return [];

  const weekdaysSet = new Set();

  entries.forEach((entry) => {
    const scheduleTime = entry.raw?.OperationScheduleTime;
    if (!Array.isArray(scheduleTime) || scheduleTime.length === 0) return;

    // Check all OperationScheduleTime entries
    scheduleTime.forEach((timeEntry) => {
      // JavaScript Date.getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday
      if (timeEntry.Sunday) weekdaysSet.add(0);
      if (timeEntry.Monday) weekdaysSet.add(1);
      if (timeEntry.Tuesday) weekdaysSet.add(2);
      if (timeEntry.Wednesday) weekdaysSet.add(3);
      if (timeEntry.Thursday) weekdaysSet.add(4);
      if (timeEntry.Friday) weekdaysSet.add(5);
      if (timeEntry.Saturday) weekdaysSet.add(6);
      // Handle typo in API (Thuresday instead of Thursday)
      if (timeEntry.Thuresday) weekdaysSet.add(4);
    });
  });

  return Array.from(weekdaysSet).sort((a, b) => a - b);
}

export function getScheduleMonths(item, lang = 'it') {
  const entries = getScheduleEntries(item);
  if (!entries.length) return [];

  const monthsSet = new Set();

  entries.forEach((entry) => {
    if (!entry.start) return;

    const startDate = new Date(entry.start);
    const endDate = entry.end ? new Date(entry.end) : null;

    // Check if it's a full year range (Jan 1 to Dec 31 of same year)
    // Handle timezone issues by checking date strings
    const startStr = entry.start.substring(0, 10); // YYYY-MM-DD
    const endStr = entry.end ? entry.end.substring(0, 10) : null;

    if (endStr && startStr && endStr) {
      const startParts = startStr.split('-');
      const endParts = endStr.split('-');

      // Check if Start is Jan 1 and Stop is Dec 31 of same year
      if (startParts.length === 3 && endParts.length === 3 &&
        startParts[0] === endParts[0] && // Same year
        startParts[1] === '01' && startParts[2] === '01' && // Jan 1
        endParts[1] === '12' && endParts[2] === '31') { // Dec 31
        // Full year - add all 12 months
        for (let i = 0; i < 12; i++) {
          monthsSet.add(i);
        }
        return; // Skip to next entry
      }
    }

    // If it's a placeholder date (Jan 1) without end, skip
    if (isPlaceholderDate(entry.start) && !endDate) {
      return;
    }

    // Specific date range - add months in range
    const startMonth = startDate.getMonth();
    const endMonth = endDate ? endDate.getMonth() : startMonth;

    // Handle same month
    if (startMonth === endMonth) {
      monthsSet.add(startMonth);
    } else if (startMonth < endMonth) {
      // Same year range
      for (let month = startMonth; month <= endMonth; month++) {
        monthsSet.add(month);
      }
    } else {
      // Crosses year boundary (e.g., Nov to Feb)
      for (let month = startMonth; month < 12; month++) {
        monthsSet.add(month);
      }
      for (let month = 0; month <= endMonth; month++) {
        monthsSet.add(month);
      }
    }
  });

  return Array.from(monthsSet).sort((a, b) => a - b);
}

export function getNextDate(item) {
  const entries = getScheduleEntries(item);
  if (!entries.length) return null;
  const now = new Date();

  // Check if we have a full year schedule (Jan 1 to Dec 31)
  // In that case, calculate next occurrence based on weekday pattern
  for (const entry of entries) {
    if (!entry.start) continue;

    const startDate = new Date(entry.start);
    const endDate = entry.end ? new Date(entry.end) : null;

    // If it's a full year range, try to find next weekday occurrence
    if (endDate &&
      startDate.getMonth() === 0 && startDate.getDate() === 1 &&
      endDate.getMonth() === 11 && endDate.getDate() === 31) {

      // Check OperationScheduleTime for weekday patterns using helper function
      const weekdays = getScheduleWeekdays({ raw: entry.raw });

      if (weekdays.length > 0) {
        // Find next occurrence of any of these weekdays
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 14; i++) { // Check next 2 weeks
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);

          if (weekdays.includes(checkDate.getDay())) {
            return checkDate.toISOString();
          }
        }
      }

      // If no weekday pattern, return null (it's recurring but we can't determine next date)
      return null;
    }
  }

  // Standard date-based logic
  const startDates = entries
    .map((e) => (e?.start ? new Date(e.start) : null))
    .filter((d) => d && Number.isFinite(d.getTime()));

  if (!startDates.length) return null;

  const future = startDates
    .filter((d) => d.getTime() >= now.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  if (future.length) return future[0].toISOString();

  // else first entry start
  const first = startDates.sort((a, b) => a.getTime() - b.getTime())[0];
  return first ? first.toISOString() : null;
}

/**
 * Parse date string (YYYY-MM-DD) or Date to Date at start of day; return null if invalid.
 */
function parseDateForRange(input) {
  if (!input) return null;
  const d = typeof input === 'string' ? new Date(input.trim()) : input;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if a market/activity item overlaps the given date range (client-side date filter for markets).
 * Used when not sending date rawfilter to the API (e.g. markets without OperationSchedule.Start/Stop).
 * @param {object} item - Raw API item (with OperationSchedule, etc.)
 * @param {{ dateFrom?: string|Date, dateTo?: string|Date, showPast?: boolean }} options
 * @returns {boolean} true if the item should be included
 */
export function itemOverlapsDateRange(item, { dateFrom, dateTo, showPast } = {}) {
  if (showPast === true) return true;

  const from = parseDateForRange(dateFrom);
  const to = parseDateForRange(dateTo);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries = getScheduleEntries(item);
  const weekdays = getScheduleWeekdays(item);

  // No date range set: filter to "today or future"
  if (!from && !to) {
    if (entries.length === 0) return true;
    const next = getNextDate(item);
    if (next) {
      const nextDate = new Date(next);
      nextDate.setHours(0, 0, 0, 0);
      return nextDate.getTime() >= today.getTime();
    }
    // Recurring (e.g. weekdays only, full year): include
    if (weekdays.length > 0) return true;
    // Explicit past-only: exclude if every entry has ended before today
    const allInPast = entries.length > 0 && entries.every((e) => {
      const end = e.end ? new Date(e.end) : null;
      if (!end) return false;
      end.setHours(0, 0, 0, 0);
      return end.getTime() < today.getTime();
    });
    return !allInPast;
  }

  // Range overlap: at least one day in [dateFrom, dateTo] (or single day) matches
  const rangeStart = from || to;
  const rangeEnd = to || from;
  if (rangeStart.getTime() > rangeEnd.getTime()) return false;

  // Has explicit schedule with start/end: overlap when any entry has start <= rangeEnd and (end >= rangeStart or no end)
  if (entries.length > 0) {
    const hasOverlap = entries.some((entry) => {
      const start = entry.start ? new Date(entry.start) : null;
      const end = entry.end ? new Date(entry.end) : null;
      if (!start) return false;
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(0, 0, 0, 0);
      const entryEnd = end || start;
      return start.getTime() <= rangeEnd.getTime() && entryEnd.getTime() >= rangeStart.getTime();
    });
    if (hasOverlap) return true;
  }

  // Weekday-only (recurring): include if any day in [rangeStart, rangeEnd] has weekday in schedule
  if (weekdays.length > 0) {
    const check = new Date(rangeStart);
    check.setHours(0, 0, 0, 0);
    const endTime = rangeEnd.getTime();
    while (check.getTime() <= endTime) {
      if (weekdays.includes(check.getDay())) return true;
      check.setDate(check.getDate() + 1);
    }
  }

  return false;
}

function extractGpsFromExhibitor(ex) {
  // Try to extract GPS coordinates from various possible fields
  const lat = ex?.GpsInfo?.[0]?.Latitude || ex?.Latitude || ex?.GpsPoints?.position?.Latitude || null;
  const lon = ex?.GpsInfo?.[0]?.Longitude || ex?.Longitude || ex?.GpsPoints?.position?.Longitude || null;

  const latNum = Number(lat);
  const lonNum = Number(lon);

  if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;

  return { lat: latNum, lon: lonNum };
}

export function getExhibitors(item) {
  // Extract exhibitors from various possible fields
  const exhibitors = [];

  // Check for Exhibitors array
  if (Array.isArray(item?.Exhibitors)) {
    item.Exhibitors.forEach((ex) => {
      exhibitors.push({
        name: ex?.Name || ex?.Title || 'Nome espositore',
        category: ex?.Category || ex?.CategoryCode || ex?.Type || '',
        stall: ex?.Stall || ex?.Posteggio || ex?.StallNumber || '',
        address: ex?.Address || ex?.FullAddress || '',
        gpsInfo: extractGpsFromExhibitor(ex),
        raw: ex,
      });
    });
  }

  // Check for VendorStalls or similar
  if (Array.isArray(item?.VendorStalls)) {
    item.VendorStalls.forEach((vs) => {
      exhibitors.push({
        name: vs?.VendorName || vs?.Name || 'Nome espositore',
        category: vs?.Category || vs?.CategoryCode || vs?.Type || '',
        stall: vs?.StallNumber || vs?.Stall || '',
        address: vs?.Address || vs?.FullAddress || '',
        gpsInfo: extractGpsFromExhibitor(vs),
        raw: vs,
      });
    });
  }

  return exhibitors;
}

export function getFrequency(item, lang) {
  const schedule = getScheduleEntries(item);
  if (!schedule.length) return null;

  // Try to extract frequency from Detail or other fields
  const detail = pickLangMap(item?.Detail, lang);
  const frequency = detail?.Frequency || item?.Frequency;

  if (frequency) {
    const freqMap = {
      en: { weekly: 'Weekly', biweekly: 'Biweekly', monthly: 'Monthly', daily: 'Daily' },
      it: { weekly: 'Settimanale', biweekly: 'Bisettimanale', monthly: 'Mensile', daily: 'Giornaliero' },
      de: { weekly: 'Wöchentlich', biweekly: 'Zweiwöchentlich', monthly: 'Monatlich', daily: 'Täglich' },
    };

    const freqLower = String(frequency).toLowerCase();
    const dict = freqMap[lang] || freqMap.en;

    if (freqLower.includes('bi') || freqLower.includes('due')) return dict.biweekly;
    if (freqLower.includes('settiman')) return dict.weekly;
    if (freqLower.includes('mensil')) return dict.monthly;
    if (freqLower.includes('giornal')) return dict.daily;

    return String(frequency);
  }

  // Infer from schedule entries
  if (schedule.length >= 14) return lang === 'it' ? 'Giornaliero' : 'Daily';
  if (schedule.length >= 8) return lang === 'it' ? 'Bisettimanale' : 'Biweekly';
  if (schedule.length >= 4) return lang === 'it' ? 'Settimanale' : 'Weekly';

  return null;
}

export function getOpeningHours(item, lang) {
  const schedule = getScheduleEntries(item);
  if (!schedule.length) return null;

  // Get first schedule entry
  const first = schedule[0];
  if (!first?.start) return null;

  const start = new Date(first.start);
  const hour = start.getHours();

  const timeMap = {
    en: { morning: 'Morning from', afternoon: 'Afternoon from', evening: 'Evening from' },
    it: { morning: 'Mattino dalle', afternoon: 'Pomeriggio dalle', evening: 'Sera dalle' },
    de: { morning: 'Morgen ab', afternoon: 'Nachmittag ab', evening: 'Abend ab' },
  };

  const dict = timeMap[lang] || timeMap.en;
  let period = dict.morning;

  if (hour >= 12 && hour < 18) period = dict.afternoon;
  else if (hour >= 18) period = dict.evening;

  const hours = String(hour).padStart(2, '0');
  const minutes = String(start.getMinutes()).padStart(2, '0');

  return `${period} ${hours}.${minutes}`;
}

export function getFullAddress(item, lang) {
  const location = item?.LocationInfo;
  if (!location) return null;

  const street = pickLangMap(location?.AddressInfo?.Street, lang) || '';
  const zip = location?.AddressInfo?.ZipCode || '';
  const city = pickLangMap(location?.MunicipalityInfo?.Name, lang) || '';

  const parts = [street, zip, city].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : null;
}

export function getDescription(item, lang) {
  const detail = item?.Detail || {};
  const description =
    detail?.[lang]?.Description ??
    detail?.en?.Description ??
    detail?.it?.Description ??
    detail?.de?.Description ??
    null;

  if (!description) return null;
  const descStr = String(description).trim();
  return descStr.length > 0 ? descStr : null;
}

export function getShortDescription(item, lang, maxLength = 200) {
  const desc = getDescription(item, lang);
  if (!desc) return null;
  if (desc.length <= maxLength) return desc;
  return desc.substring(0, maxLength).trim() + '...';
}

/**
 * Extract contact information from ContactInfos
 * Handles both array format and object format
 */
export function getContactInfo(item, lang) {
  const contactInfos = item?.ContactInfos;
  if (!contactInfos) return null;

  // Handle object format: { it: {...}, en: {...} }
  let ci = null;
  if (typeof contactInfos === 'object' && !Array.isArray(contactInfos)) {
    ci = contactInfos[lang] || contactInfos.en || contactInfos.it || contactInfos.de || null;
  }
  // Handle array format: [{ LanguageCode: 'it', ... }]
  else if (Array.isArray(contactInfos)) {
    ci = contactInfos.find((c) => c?.LanguageCode === lang) ||
      contactInfos.find((c) => c?.LanguageCode === 'en') ||
      contactInfos.find((c) => c?.LanguageCode === 'it') ||
      contactInfos[0] ||
      null;
  }

  if (!ci) return null;

  return {
    email: ci?.Email ?? ci?.email ?? null,
    phone: ci?.Phonenumber ?? ci?.Phone ?? ci?.phone ?? null,
    fax: ci?.Faxnumber ?? ci?.Fax ?? ci?.fax ?? null,
    url: ci?.Url ?? ci?.Website ?? ci?.web ?? ci?.url ?? null,
    address: ci?.Address ?? ci?.address ?? null,
    city: ci?.City ?? ci?.city ?? null,
    zipCode: ci?.ZipCode ?? ci?.zipCode ?? ci?.zip ?? null,
    region: ci?.Region ?? ci?.region ?? null,
    companyName: ci?.CompanyName ?? ci?.companyName ?? ci?.Name ?? ci?.name ?? null,
    givenName: ci?.Givenname ?? ci?.givenName ?? ci?.firstName ?? null,
    surname: ci?.Surname ?? ci?.surname ?? ci?.lastName ?? null,
    namePrefix: ci?.NamePrefix ?? ci?.namePrefix ?? null,
    countryCode: ci?.CountryCode ?? ci?.countryCode ?? null,
    countryName: ci?.CountryName ?? ci?.countryName ?? null,
    vat: ci?.Vat ?? ci?.vat ?? null,
    tax: ci?.Tax ?? ci?.tax ?? null,
    logoUrl: ci?.LogoUrl ?? ci?.logoUrl ?? null,
    raw: ci,
  };
}

/**
 * Get additional text fields from Detail
 */
export function getAdditionalTexts(item, lang) {
  const detail = item?.Detail || {};
  const detailLang = detail[lang] || detail.en || detail.it || detail.de || {};

  return {
    baseText: detailLang?.BaseText || null,
    introText: detailLang?.IntroText || null,
    additionalText: detailLang?.AdditionalText || null,
    header: detailLang?.Header || null,
    subHeader: detailLang?.SubHeader || null,
    parkingInfo: detailLang?.ParkingInfo || null,
    safetyInfo: detailLang?.SafetyInfo || null,
    getThereText: detailLang?.GetThereText || null,
    publicTransportationInfo: detailLang?.PublicTransportationInfo || null,
    equipmentInfo: detailLang?.EquipmentInfo || null,
    authorTip: detailLang?.AuthorTip || null,
  };
}

/**
 * Get full contact information as formatted lines for display
 */
export function getContactLines(item, lang) {
  const contact = getContactInfo(item, lang);
  if (!contact) return [];

  const lines = [];

  if (contact.email) {
    lines.push({ type: 'email', label: 'Email', value: String(contact.email) });
  }

  if (contact.phone) {
    lines.push({ type: 'phone', label: 'Phone', value: String(contact.phone) });
  }

  if (contact.fax) {
    lines.push({ type: 'fax', label: 'Fax', value: String(contact.fax) });
  }

  if (contact.url) {
    lines.push({ type: 'url', label: 'Web', value: String(contact.url) });
  }

  return lines;
}

export function normalizeOdhItem(item, { lang = 'en', type } = {}) {
  const id = item?.Id ?? null;
  return {
    type: type || null,
    id: id !== null && id !== undefined ? String(id) : null,
    self: item?.Self ? String(item.Self) : null,
    title: getTitle(item, lang),
    image: getImageUrl(item),
    coords: getCoords(item),
    municipality: getMunicipalityName(item, lang),
    municipalityId: getMunicipalityId(item),
    districtOrRegion: getDistrictOrRegion(item, lang),
    locationInfo: item?.LocationInfo || null,
    nextDate: getNextDate(item),
    schedule: getScheduleEntries(item),
    raw: item,
  };
}


export function isActiveInMonth(item, monthIndex) {
  // item can be normalized (has .raw) or raw
  const raw = item.raw || item;
  const months = getScheduleMonths(raw);
  return months.includes(monthIndex);
}
