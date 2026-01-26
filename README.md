<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# Market Calendar Web Component

A Vue.js web component for displaying market calendar information.

## Prerequisites

- Node.js 12+ / npm 6+
- Docker and Docker Compose

## Quick Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Start the development environment:
   ```bash
   docker compose up -d
   ```

4. Access the application:
   - Web component: `http://localhost:8998`

## Notes

- The web component runs on port 8998 (configurable via `.env`)
- To run only the web component: `docker compose up app -d`
