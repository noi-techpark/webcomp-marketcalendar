<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="text-center py-5">
    <div class="text-secondary mb-2">{{ displayTitle }}</div>
    <div class="small text-secondary">{{ displayDescription }}</div>
  </div>
</template>

<script>
const TRANSLATIONS = {
  it: {
    title: 'Nessun risultato',
    description: 'Prova a modificare la ricerca o i filtri.',
  },
  en: {
    title: 'No results',
    description: 'Try adjusting your search or filters.',
  },
  de: {
    title: 'Keine Ergebnisse',
    description: 'Versuchen Sie, Ihre Suche oder Filter anzupassen.',
  },
};

export default {
  name: 'EmptyState',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    lang: { type: String, default: 'it' },
  },
  computed: {
    t() {
      return TRANSLATIONS[this.lang] || TRANSLATIONS.it;
    },
    displayTitle() {
      return this.title || this.t.title;
    },
    displayDescription() {
      return this.description || this.t.description;
    },
  },
};
</script>


