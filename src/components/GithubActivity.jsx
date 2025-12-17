import React, { useEffect, useState } from 'react';

// Renders pinned repos and a GitHub-style contribution calendar.
export default function GithubActivity({ username, contributions: contributionsProp, totals: totalsProp, vitalColor = '#00FF00' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If parent passed contributions (fetched centrally), use that and skip fetch
    if (contributionsProp || totalsProp) {
      setData({ pinned: data?.pinned || [], contributions: contributionsProp || [], totals: totalsProp || {} });
      return;
    }

    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`/api/github?login=${encodeURIComponent(username)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
          return;
        }
        setData(d);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to fetch');
      })
      .finally(() => setLoading(false));
  }, [username, contributionsProp, totalsProp]);

  if (!username) return <div className="p-4">No GitHub username provided.</div>;
  if (loading) return <div className="p-4">Loading GitHub activity...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return null;

  // Build a map of date -> count
  const contributionsMap = new Map();
  data.contributions?.forEach(c => contributionsMap.set(c.date, c.count));

  // Build weeks layout like GitHub: columns are weeks, each with 7 days (Sunday -> Saturday)
  const daysBack = 90;
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - (daysBack - 1));
  // Align to Sunday
  start.setDate(start.getDate() - start.getDay());

  const weeks = [];
  let cur = new Date(start);
  while (cur <= today) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const iso = cur.toISOString().slice(0,10);
      week.push({ date: iso, count: contributionsMap.get(iso) || 0 });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const flat = weeks.flat();
  const maxCount = Math.max(...flat.map(d => d.count), 1);

  const getStyle = (count) => {
    if (!count) return { backgroundColor: '#e5e7eb' };
    const opacity = Math.min(1, count / Math.max(2, maxCount));
    // create rgba from vitalColor hex
    const c = vitalColor.replace('#','');
    const r = parseInt(c.substring(0,2),16);
    const g = parseInt(c.substring(2,4),16);
    const b = parseInt(c.substring(4,6),16);
    return { backgroundColor: `rgba(${r},${g},${b},${Math.max(0.15, opacity)})` };
  };

  return (
    <div className="bg-white/5 p-4 rounded-md border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">GitHub Activity</h3>
        <div className="text-xs text-gray-400">{data.totals?.totalContributions ?? 0} commits (last {daysBack}d)</div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-medium mb-2">Pinned</h4>
        <div className="flex gap-3 overflow-x-auto py-2">
          {data.pinned && data.pinned.length ? (
            data.pinned.map(r => (
              <a key={r.name} href={r.url} className="w-full md:min-w-[220px] flex-shrink-0 block p-3 rounded-md hover:bg-gray-800/50 border border-gray-800" target="_blank" rel="noreferrer">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-gray-400">★ {r.stars}</div>
                </div>
                <div className="text-xs text-gray-400 mb-2">{r.description}</div>
                <div className="text-xs text-gray-400">{r.language || 'GitHub'}</div>
              </a>
            ))
          ) : (
            <div className="text-xs text-gray-400">No pinned repos found.</div>
          )}
        </div>
      </div>

      {/* Heatmap removed from here to keep it a separate component/section when desired */}

    </div>
  );
}
