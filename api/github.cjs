require('dotenv').config();
const fetch = globalThis.fetch || require('node-fetch');

// Simple in-memory cache (persists between warm invocations)
const cache = new Map();
const CACHE_TTL = Number(process.env.GITHUB_CACHE_TTL || 60) * 1000; // ms
function setCache(key, value) { cache.set(key, { value, ts: Date.now() }); }
function getCache(key) { const entry = cache.get(key); if (!entry) return null; if (Date.now() - entry.ts > CACHE_TTL) { cache.delete(key); return null; } return entry.value; }

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

async function fetchGithubGraphql(token, query, variables) {
  const resp = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => null);
    const err = new Error('GitHub API error');
    err.status = resp.status; err.body = txt;
    throw err;
  }
  return resp.json();
}

module.exports = async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    const login = (req.query?.login || req.body?.login || process.env.GITHUB_USERNAME || 'octocat');
    const now = new Date();
    const to = req.query?.to || now.toISOString();
    const daysBack = Number(req.query?.days || req.query?.daysBack || 90);
    const from = req.query?.from || new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000)).toISOString();

    const cacheKey = `${login}:${from}:${to}`;
    const cached = getCache(cacheKey);
    if (cached) return res.status(200).json({ cached: true, ...cached });

    if (!token) {
      // Fallback to public REST repo list
      const resp = await fetch(`https://api.github.com/users/${login}/repos?per_page=50&sort=pushed`);
      if (!resp.ok) {
        const txt = await resp.text().catch(() => null);
        return res.status(502).json({ error: 'Failed to fetch public repos', details: txt });
      }
      const repos = await resp.json();
      const recent = Array.isArray(repos) ? repos.map(r => ({ name: r.name, url: r.html_url, description: r.description, stars: r.stargazers_count, forks: r.forks_count, pushedAt: r.pushed_at })) : [];
      const out = { pinned: [], contributions: [], recent, projects: [], totals: { totalContributions: 0 }, warning: 'MISSING_GITHUB_TOKEN' };
      setCache(cacheKey, out);
      return res.json({ cached: false, ...out });
    }

    // With token: call GraphQL
    const data = await fetchGithubGraphql(token, GITHUB_GRAPHQL, { login, from, to });
    if (!data || !data.data || !data.data.user) return res.status(502).json({ error: 'No user data returned', raw: data });

    const user = data.data.user;
    const pinned = (user.pinnedItems?.nodes || []).filter(Boolean).map(r => ({ name: r?.name, description: r?.description, url: r?.url, stars: r?.stargazerCount, forks: r?.forkCount, language: r?.primaryLanguage?.name || null, languageColor: r?.primaryLanguage?.color || null, updatedAt: r?.updatedAt }));
    const contributions = (user.contributionsCollection?.contributionCalendar?.weeks || []).flatMap(w => (w?.contributionDays || []).map(d => ({ date: d.date, count: d.contributionCount })));
    const recent = (user.repositories?.nodes || []).filter(Boolean).map(r => ({ name: r?.name, url: r?.url, description: r?.description, stars: r?.stargazerCount, forks: r?.forkCount, pushedAt: r?.pushedAt }));
    const projects = (user.projectsV2?.nodes || []).filter(Boolean).map(p => ({ id: p?.id, title: p?.title, url: p?.url }));
    const out = { pinned, contributions, recent, projects, totals: { totalContributions: user.contributionsCollection?.contributionCalendar?.totalContributions || 0 } };
    setCache(cacheKey, out);
    return res.json({ cached: false, ...out });

  } catch (err) {
    console.error('API /api/github error:', err && (err.stack || err.message || err));
    const status = err?.status || 500;
    return res.status(status).json({ error: err.message || 'Internal error', details: err.body || undefined });
  }
};
