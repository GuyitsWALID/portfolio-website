require('dotenv').config();
const express = require('express');
const fetch = globalThis.fetch; // Node 18+ has fetch

// Global error handlers to avoid crashing and to surface useful logs
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && (err.stack || err.message || err));
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 4000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const DEFAULT_USER = process.env.GITHUB_USERNAME || 'octocat';

if (!GITHUB_TOKEN) {
  console.warn('Warning: GITHUB_TOKEN is not set. The endpoint will fail without it. Add it to .env or environment variables.');
}

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = Number(process.env.GITHUB_CACHE_TTL || 60) * 1000; // ms

function setCache(key, value) {
  cache.set(key, { value, ts: Date.now() });
}
function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

const GITHUB_GRAPHQL = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage { name color }
          updatedAt
        }
      }
    }
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
    repositories(first: 50, orderBy: { field: PUSHED_AT, direction: DESC }) {
      nodes {
        name url description stargazerCount forkCount pushedAt
      }
    }
    projectsV2(first: 10) { nodes { id title url } }
  }
}
`;

async function fetchFromGitHub(query, variables) {
  // If no token is present, return null so the caller can do a fallback to public REST endpoints
  if (!GITHUB_TOKEN) return null;

  const resp = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    console.error('GitHub API non-OK response:', resp.status, txt);
    const err = new Error('GitHub API error: ' + resp.status);
    err.body = txt;
    err.status = resp.status;
    throw err;
  }
  try {
    return await resp.json();
  } catch (e) {
    const txt = await resp.text().catch(() => null);
    console.error('GitHub API JSON parse error:', e, txt);
    throw e;
  }
}

app.get('/api/github', async (req, res) => {
  try {
    const login = req.query.login || DEFAULT_USER;
    const now = new Date();
    const to = req.query.to || now.toISOString();
    const from = req.query.from || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(); // 90d

    const cacheKey = `${login}:${from}:${to}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const data = await fetchFromGitHub(GITHUB_GRAPHQL, { login, from, to });

    // If no token is present, fetch public repos via REST as a minimal fallback
    if (data === null) {
      const resp = await fetch(`https://api.github.com/users/${login}/repos?per_page=50&sort=pushed`);
      const repos = await resp.json();
      const recent = (Array.isArray(repos) ? repos : []).map(r => ({ name: r.name, url: r.html_url, description: r.description, stars: r.stargazers_count, forks: r.forks_count, pushedAt: r.pushed_at }));
      const out = { pinned: [], contributions: [], recent, projects: [], totals: { totalContributions: 0 }, warning: 'MISSING_GITHUB_TOKEN' };
      setCache(cacheKey, out);
      return res.json({ cached: false, ...out });
    }

    if (!data || !data.data || !data.data.user) return res.status(502).json({ error: 'No user data returned', raw: data });

    // Normalize response
    const user = data.data.user;

    const pinned = (user.pinnedItems?.nodes || []).filter(Boolean).map(r => ({
      name: r?.name,
      description: r?.description,
      url: r?.url,
      stars: r?.stargazerCount,
      forks: r?.forkCount,
      language: r?.primaryLanguage?.name || null,
      languageColor: r?.primaryLanguage?.color || null,
      updatedAt: r?.updatedAt,
    }));

    const contributions = (user.contributionsCollection?.contributionCalendar?.weeks || []).flatMap(w => (w?.contributionDays || []).map(d => ({ date: d.date, count: d.contributionCount })));

    const recent = (user.repositories?.nodes || []).filter(Boolean).map(r => ({ name: r?.name, url: r?.url, description: r?.description, stars: r?.stargazerCount, forks: r?.forkCount, pushedAt: r?.pushedAt }));

    const projects = (user.projectsV2?.nodes || []).filter(Boolean).map(p => ({ id: p?.id, title: p?.title, url: p?.url }));

    const out = { pinned, contributions, recent, projects, totals: { totalContributions: user.contributionsCollection?.contributionCalendar?.totalContributions || 0 } };

    setCache(cacheKey, out);
    res.json({ cached: false, ...out });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, details: err.body || undefined });
  }
});

// Express error handler (catch-all)
app.use((err, req, res, next) => {
  console.error('Express error middleware:', err && (err.stack || err.message || err));
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`GitHub proxy running on http://localhost:${PORT}/api/github`));
