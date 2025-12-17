# Portfolio Website — GitHub Activity Integration

This project now includes a small server proxy to fetch GitHub GraphQL data (pinned repos, contribution calendar, recent repos) securely using a `GITHUB_TOKEN`.

## Quick start (development)

1. Copy the environment example:

   cp .env.example .env.local

2. Edit `.env.local` and set `GITHUB_TOKEN` and `GITHUB_USERNAME`.
   Optionally set `VITE_GITHUB_USERNAME` to control the username the frontend shows (e.g. `VITE_GITHUB_USERNAME=GuyitsWALID`).

3. Install dependencies:

   npm install

4. Start the GitHub proxy server:

   npm run start:server

   The proxy runs at http://localhost:4000/api/github

5. In another terminal, start the Vite dev server:

   npm run dev

   Vite proxies `/api` to the local server during development.

6. Open your site at http://localhost:5173

## Deployment notes

- Do not commit your token. Use your host's secret configuration (Vercel/Netlify/Heroku) and set `GITHUB_TOKEN` as an environment variable.
- The server is intentionally minimal — for production you may want to add stronger caching (Redis), monitoring, and rate-limit handling.

## What was added

- `server/github-api.js` — small Express proxy that queries the GitHub GraphQL API and returns normalized JSON.
- `src/components/GithubActivity.jsx` — frontend component to fetch `/api/github` and render pinned repos + contribution overview.
- `.env.example` — example env variables to copy.
- `package.json` scripts: `start:server` to run the proxy.

If you want, next I can:
- Add a nicer contribution heatmap visualization.
- Add caching via Redis or file-based cache.
- Add unit/integration tests for the server.

Troubleshooting: Vite error "Cannot find module @rollup/rollup-win32-x64-msvc"
- This can occur on Windows with npm due to a bug installing optional native packages. Fixes that worked in this project:
  1. Remove `node_modules` and `package-lock.json`, then run `npm install`.
  2. Alternatively use `pnpm install` (recommended on Windows) which reliably installs optional native packages.
  3. Use an LTS Node version (18.x or 20.x) if problems persist.


