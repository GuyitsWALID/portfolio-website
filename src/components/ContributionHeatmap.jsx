import React, { useMemo, useState, useRef, useEffect } from 'react';

// Show a 1-year heatmap by default and provide better scroll UX + mobile/touch support
export default function ContributionHeatmap({ contributions = [], daysBack = 365, year, vitalColor = '#00FF00', theme = 'dark' }) {
  const containerRef = useRef(null);
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const weeks = useMemo(() => {
    const map = new Map(contributions.map(c => [c.date, c.count]));

    const today = new Date();
    let start, end;

    if (typeof year === 'number') {
      start = new Date(year, 0, 1);
      // If selected year is the current year, end at today; otherwise end at Dec 31 of that year
      const currentYear = today.getFullYear();
      end = year === currentYear ? today : new Date(year, 11, 31);
    } else {
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - (daysBack - 1));
    }

    // align start to previous Sunday
    start.setDate(start.getDate() - start.getDay());
    // align end to next Saturday so the last week is full
    const endDay = end.getDay();
    if (endDay !== 6) end.setDate(end.getDate() + (6 - endDay));

    const w = [];
    let cur = new Date(start);
    while (cur <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const iso = cur.toISOString().slice(0,10);
        week.push({ date: iso, count: map.get(iso) || 0 });
        cur.setDate(cur.getDate() + 1);
      }
      w.push(week);
    }
    return w;
  }, [contributions, daysBack, year]);

  // Determine which weeks to display (supports filtering a year by last N days)
  const getDisplayWeeks = () => {
    if (typeof year === 'number' && typeof daysBack === 'number') {
      // if daysBack >= whole period, just show all weeks
      const totalDays = weeks.length * 7;
      if (daysBack >= totalDays) return weeks;

      // Find end date (last Saturday in weeks array)
      const lastWeek = weeks[weeks.length - 1];
      const endIso = lastWeek[lastWeek.length - 1].date; // Saturday
      const endDate = new Date(endIso);

      // Compute the start filter date (daysBack days before endDate)
      const startFilter = new Date(endDate);
      startFilter.setDate(startFilter.getDate() - (daysBack - 1));
      // align to previous Sunday
      startFilter.setDate(startFilter.getDate() - startFilter.getDay());

      // Find first week index whose first day is >= startFilter
      const idx = weeks.findIndex(w => new Date(w[0].date) >= startFilter);
      return idx === -1 ? weeks : weeks.slice(idx);
    }
    // default: show all computed weeks
    return weeks;
  };

  const displayWeeks = getDisplayWeeks();

  // Measure container width to compute responsive square size (no scrollbar)
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current;
      if (el) setContainerWidth(el.clientWidth);
    };

    measure();
    window.addEventListener('resize', measure);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      if (containerRef.current) ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', measure);
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
    };
  }, []);

  const flat = displayWeeks.flat();
  const maxCount = Math.max(...flat.map(d => d.count), 1);

  // Header label: show Year X and whether filtered
  const headerLabel = typeof year === 'number'
    ? (displayWeeks.length * 7 < weeks.length * 7 ? `Year ${year} (filtered ${daysBack}d)` : `Year ${year}`)
    : `Last ${daysBack}d`;

  // Responsive sizing: adapt for small screens
  const smallScreen = winWidth < 640;
  const gap = smallScreen ? 3 : 4; // gap between columns
  const leftLabelWidth = smallScreen ? 28 : 40; // day label column (smaller on mobile)
  const padding = 24; // safety padding
  const fullWeeksCount = Math.max(1, weeks.length);

  const squareSize = useMemo(() => {
    // On small screens, size based on displayed weeks (limited to avoid very tiny tiles)
    const weeksCountForSizing = smallScreen ? Math.min(displayWeeks.length, 20) : fullWeeksCount;
    if (!containerWidth) {
      // fallback heuristic
      if (winWidth < 480) return 12;
      if (winWidth < 768) return 10;
      if (weeksCountForSizing <= 20) return 12;
      if (weeksCountForSizing <= 40) return 10;
      if (typeof year === 'number') return 7;
      return daysBack > 180 ? 8 : 9;
    }
    // compute tile size using weeksCountForSizing so mobile keeps legible tiles
    const available = containerWidth - leftLabelWidth - padding - (weeksCountForSizing - 1) * gap;
    const s = Math.floor(available / weeksCountForSizing);
    const size = Math.max(6, Math.min(14, s)); // prefer minimum 6 for readability
    return size;
  }, [containerWidth, fullWeeksCount, winWidth, year, daysBack, displayWeeks.length, smallScreen]);

  // Grid content width to align header and ensure no scrollbar - use fixed column widths
  const gridWidth = leftLabelWidth + displayWeeks.length * squareSize + Math.max(0, (displayWeeks.length - 1) * gap);

  const hexToRgb = (hex) => {
    const c = (hex || '#00FF00').replace('#', '');
    return {
      r: parseInt(c.substring(0,2), 16),
      g: parseInt(c.substring(2,4), 16),
      b: parseInt(c.substring(4,6), 16),
    };
  };

  const { r, g, b } = hexToRgb(vitalColor);

  const toHsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = Math.round(h * 60);
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hsl = toHsl({ r, g, b });

  // Derive palette from the `vitalColor` so the heatmap follows user selection.
  // Avoid near-white lightest stops so tiles never appear white
  const palette = useMemo(() => {
    const base = (vitalColor || '#00FF00').replace('#','').toLowerCase();
    // Keep GitHub greens when the color is the default neon green for familiarity
    if (base === '00ff00') return ['#9be9a8', '#40c463', '#30a14e', '#216e39'];

    // Keep saturation vivid but not extreme, and limit lightness to avoid white
    const sats = Math.min(90, Math.max(50, hsl.s + 10));
    // GitHub-like light->dark stops but limited to avoid white
    let stops = [72, 56, 40, 24];
    // Slightly darker palette for dark theme so contrast remains visible
    if (theme === 'dark') stops = stops.map(L => Math.max(18, L - 6));

    return stops.map(L => `hsl(${hsl.h} ${sats}% ${L}%)`);
  }, [hsl, vitalColor, theme]);

  const emptyColor = theme === 'dark' ? '#071023' : '#ebedf0';

  // Compute percentile thresholds from non-zero counts so the palette distribution matches GitHub-like buckets
  const thresholds = useMemo(() => {
    const vals = flat.map(d => d.count).filter(c => c > 0).sort((a, b) => a - b);
    if (!vals.length) return [1, 2, 3, 4];
    const ps = [0.25, 0.5, 0.75, 0.95];
    return ps.map(p => vals[Math.min(vals.length - 1, Math.floor((vals.length - 1) * p))]);
  }, [flat]);

  const getStyle = (count) => {
    if (!count) return { backgroundColor: emptyColor, borderRadius: 0 };

    // Assign buckets based on thresholds (0..3) mapping to palette indices
    let idx = 0;
    if (count >= thresholds[3]) idx = 3;
    else if (count >= thresholds[2]) idx = 2;
    else if (count >= thresholds[1]) idx = 1;
    else if (count >= thresholds[0]) idx = 0;

    const color = palette[Math.max(0, Math.min(palette.length - 1, idx))];

    // Match GitHub appearance: square (no rounding) without inner shadow
    return { backgroundColor: color, borderRadius: 0 };
  };



  return (
    <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-[#001018]/60' : 'bg-white/90'} relative`} ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs font-mono ${theme === 'dark' ? 'text-cyan-300' : 'text-[#0b4f4f]'}`}>Contribution Heatmap</div>
      </div>

            <div className="flex flex-col gap-4">
          <div className="w-full" style={{ paddingBottom: 12 }}>
          
            {/* Months header (grid responsive width) */}
            {/* Make the grid scrollable horizontally when it doesn't fit */}
            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8, scrollSnapType: 'x proximity' }}>
              <div style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px`, scrollSnapAlign: 'start' }}>
                {/* Months header aligned to fixed columns so tile size is consistent */}
                <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${displayWeeks.length}, ${squareSize}px)`, gap: `${gap}px`, alignItems: 'center' }}>
                  <div />
                  {displayWeeks.map((week, i) => {
                    const label = new Date(week[0].date).toLocaleString('default', { month: 'short' });
                    const prevLabel = i > 0 ? new Date(displayWeeks[i - 1][0].date).toLocaleString('default', { month: 'short' }) : null;
                    return (
                      <div key={i} style={{ width: `${squareSize}px`, textAlign: 'center', fontSize: 11, color: theme === 'dark' ? 'rgba(99, 219, 237, 0.6)' : '#0b4f4f' }}>
                        {(i === 0 || label !== prevLabel) ? label : ''}
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${displayWeeks.length}, ${squareSize}px)`, gap: `${gap}px`, alignItems: 'start' }}>
                  {/* Day labels column (hidden on very small screens for extra space) */}
                  <div style={{ display: smallScreen ? 'none' : 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${squareSize * 7 + gap * 6}px` }}>
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <div key={idx} style={{ fontSize: 11, color: theme === 'dark' ? 'rgba(99, 219, 237, 0.6)' : '#0b4f4f', height: 'auto' }}>
                        {idx === 1 ? 'Mon' : idx === 3 ? 'Wed' : idx === 5 ? 'Fri' : ''}
                      </div>
                    ))}
                  </div>

                  {/* Grid: each column is a week, each row is a day */}
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${displayWeeks.length}, ${squareSize}px)`, gridAutoRows: `${squareSize}px`, gap: `${gap}px`, width: `${gridWidth - leftLabelWidth}px` }}>
                    {displayWeeks.map((week, wi) => (
                      week.map((day, di) => (
                        <div key={`${day.date}`} style={{ width: `${squareSize}px`, height: `${squareSize}px` }}>
                          <div
                            role="img"
                            aria-label={`${day.date}: ${day.count} commits`}
                            style={{ width: '100%', height: '100%', ...getStyle(day.count), transition: 'background-color 150ms linear' }}
                          />
                        </div>
                      ))
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>

          <div className={`mt-2 text-[11px] ${theme === 'dark' ? 'text-cyan-300' : 'text-gray-600'} flex items-center gap-3 justify-start`}>
            <span className="font-mono">Low</span>
            <div className="flex gap-1 items-center">
              <div style={{ width: 18, height: 12, backgroundColor: emptyColor }} />
              {palette.map((c, i) => (
                <div key={i} style={{ width: 18, height: 12, backgroundColor: c }} />
              ))}
            </div>
            <span className="font-mono">High</span>
          </div>

          {/* Filter caption */}
          <div className={`mt-1 text-[11px] font-mono ${theme === 'dark' ? 'text-cyan-400/80' : 'text-gray-500'}`}>{headerLabel}</div>
        </div>
    </div>
  );
}
