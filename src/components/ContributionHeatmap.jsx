import React, { useMemo, useState, useRef, useEffect } from 'react';

// Show a 4-month heatmap by default and provide better scroll UX + mobile/touch support
export default function ContributionHeatmap({ contributions = [], daysBack = 120, vitalColor = '#00FF00', theme = 'dark' }) {
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
    const start = new Date(today);
    start.setDate(start.getDate() - (daysBack - 1));
    // align to previous Sunday
    start.setDate(start.getDate() - start.getDay());

    const w = [];
    let cur = new Date(start);
    while (cur <= today) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const iso = cur.toISOString().slice(0,10);
        week.push({ date: iso, count: map.get(iso) || 0 });
        cur.setDate(cur.getDate() + 1);
      }
      w.push(week);
    }
    return w;
  }, [contributions, daysBack]);

  const flat = weeks.flat();
  const maxCount = Math.max(...flat.map(d => d.count), 1);

  // Responsive square size: slightly larger on small screens for tap targets
  const squareSize = winWidth < 480 ? 12 : winWidth < 768 ? 10 : daysBack > 180 ? 8 : 9;

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

  const getStyle = (count) => {
    if (!count) return { backgroundColor: '#071023' };
    // Compute lightness as a gradient from (hsl.l + 8) (lighter) to (hsl.l - 20) (darker)
    const minL = Math.max(6, hsl.l - 20);
    const maxL = Math.min(90, hsl.l + 8);
    const frac = Math.min(1, count / maxCount);
    const L = Math.round(maxL - (maxL - minL) * frac);
    return { backgroundColor: `hsl(${hsl.h} ${hsl.s}% ${L}%)` };
  };



  return (
    <div className={`p-3 rounded-md border ${theme === 'dark' ? 'border-cyan-700 bg-[#001018]/60' : 'border-gray-300 bg-white/90'} relative`} ref={containerRef}>
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs font-mono ${theme === 'dark' ? 'text-cyan-300' : 'text-[#0b4f4f]'}`}>Contribution Heatmap</div>
        <div className={`text-xs ${theme === 'dark' ? 'text-cyan-400' : 'text-gray-600'}`}>Last {daysBack}d</div>
      </div>

      <div className="overflow-x-auto scroll-smooth snap-x snap-mandatory -webkit-overflow-scrolling-touch" style={{ paddingBottom: 12, touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-1" style={{ alignItems: 'flex-start' }}>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 snap-start" style={{ lineHeight: 0 }}>
              {week.map(day => (
                <div
                  key={day.date}
                  role="img"
                  aria-label={`${day.date}: ${day.count} commits`}
                  className="rounded-sm"
                  style={{ width: squareSize, height: squareSize, ...getStyle(day.count), boxShadow: day.count ? '0 0 0 1px rgba(0,0,0,0.35) inset' : 'none' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>


      <div className={`mt-2 text-[11px] ${theme === 'dark' ? 'text-cyan-300' : 'text-gray-600'} flex items-center gap-2`}>
        <span className="font-mono">Low</span>
        <div className="flex gap-1 items-center">
          <div style={{ width: 16, height: 10, backgroundColor: theme === 'dark' ? '#071023' : '#f3f4f6' }} />
          <div style={{ width: 16, height: 10, backgroundColor: `hsl(${hsl.h} ${hsl.s}% ${Math.round(hsl.l + 8)}%)` }} />
          <div style={{ width: 16, height: 10, backgroundColor: `hsl(${hsl.h} ${hsl.s}% ${Math.round(hsl.l - 4)}%)` }} />
          <div style={{ width: 16, height: 10, backgroundColor: `hsl(${hsl.h} ${hsl.s}% ${Math.round(hsl.l - 20)}%)` }} />
        </div>
        <span className="font-mono">High</span>
      </div>
    </div>
  );
}
