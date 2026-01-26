<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div class="alert alert-danger">
    <div class="fw-semibold">{{ title }}</div>
    <div class="small mt-1">{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: 'ErrorAlert',
  props: {
    title: { type: String, default: 'Something went wrong' },
    message: { type: String, default: '' },
  },
};
</script>


