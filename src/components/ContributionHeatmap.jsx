import React, { useMemo, useState, useRef, useEffect } from 'react';

// GitHub-accurate contribution heatmap with custom color support
export default function ContributionHeatmap({ contributions = [], daysBack = 365, year, vitalColor = '#00FF00', theme = 'dark' }) {
  const containerRef = useRef(null);
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const weeks = useMemo(() => {
    const map = new Map(contributions.map(c => [c.date, c.count]));

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of today
    let start, end;

    if (typeof year === 'number') {
      start = new Date(year, 0, 1);
      const currentYear = today.getFullYear();
      // Always end at today if it's the current year, never show future dates
      end = year === currentYear ? new Date(today) : new Date(year, 11, 31);
    } else {
      end = new Date(today);
      start = new Date(today);
      start.setDate(start.getDate() - (daysBack - 1));
    }

    // align start to previous Sunday
    start.setDate(start.getDate() - start.getDay());
    
    // For current year, don't align end forward - stop at today
    // Only align to Saturday for past years
    const isCurrentYear = typeof year === 'number' && year === today.getFullYear();
    if (!isCurrentYear) {
      const endDay = end.getDay();
      if (endDay !== 6) end.setDate(end.getDate() + (6 - endDay));
    }

    const w = [];
    let cur = new Date(start);
    while (cur <= end) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const iso = cur.toISOString().slice(0,10);
        // Only add day if it's not in the future
        if (cur <= today) {
          week.push({ date: iso, count: map.get(iso) || 0 });
        } else {
          // For incomplete weeks in current year, add placeholder that won't be rendered
          week.push({ date: iso, count: 0, isFuture: true });
        }
        cur.setDate(cur.getDate() + 1);
      }
      // Only add week if it has at least one non-future day
      if (week.some(d => !d.isFuture)) {
        w.push(week);
      }
    }
    return w;
  }, [contributions, daysBack, year]);

  // Determine which weeks to display (supports filtering a year by last N days)
  const getDisplayWeeks = () => {
    if (typeof year === 'number' && typeof daysBack === 'number') {
      const totalDays = weeks.length * 7;
      if (daysBack >= totalDays) return weeks;

      const lastWeek = weeks[weeks.length - 1];
      const endIso = lastWeek[lastWeek.length - 1].date;
      const endDate = new Date(endIso);

      const startFilter = new Date(endDate);
      startFilter.setDate(startFilter.getDate() - (daysBack - 1));
      startFilter.setDate(startFilter.getDate() - startFilter.getDay());

      const idx = weeks.findIndex(w => new Date(w[0].date) >= startFilter);
      return idx === -1 ? weeks : weeks.slice(idx);
    }
    return weeks;
  };

  const displayWeeks = getDisplayWeeks();

  // GitHub uses fixed 11px squares (with 3px gap = 14px total per cell)
  const squareSize = 11;
  const gap = 3;

  // Responsive sizing: adapt for small screens
  const smallScreen = winWidth < 640;
  const leftLabelWidth = 28; // Fixed width for day labels
  const dayLabelGap = 8; // Gap between day labels and grid

  const flat = displayWeeks.flat();
  const maxCount = Math.max(...flat.map(d => d.count), 1);

  // Header label: show Year X and whether filtered
  const headerLabel = typeof year === 'number'
    ? (displayWeeks.length * 7 < weeks.length * 7 ? `Year ${year} (filtered ${daysBack}d)` : `Year ${year}`)
    : `Last ${daysBack}d`;

  // Grid content width - fixed based on number of weeks
  const gridWidth = leftLabelWidth + dayLabelGap + displayWeeks.length * squareSize + Math.max(0, (displayWeeks.length - 1) * gap);

  // Color utilities
  const hexToRgb = (hex) => {
    const c = (hex || '#00FF00').replace('#', '');
    return {
      r: parseInt(c.substring(0,2), 16),
      g: parseInt(c.substring(2,4), 16),
      b: parseInt(c.substring(4,6), 16),
    };
  };

  const rgbToHex = ({ r, g, b }) => {
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const mixRgb = (a, b, t) => ({
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t),
  });

  // Create 4 color stops matching GitHub's intensity levels
  const palette = useMemo(() => {
    const base = (vitalColor || '#00FF00');
    const baseRgb = hexToRgb(base);
    
    // GitHub uses 4 distinct levels with decreasing intensity
    // Level 1 (lightest): ~25% intensity
    // Level 2: ~50% intensity  
    // Level 3: ~75% intensity
    // Level 4 (darkest): 100% intensity (base color)
    const stops = [0.75, 0.50, 0.25, 0.0]; // Mix with black for darker shades
    const black = { r: 0, g: 0, b: 0 };
    
    return stops.map(t => rgbToHex(mixRgb(baseRgb, black, t)));
  }, [vitalColor]);

  const emptyColor = theme === 'dark' ? '#161b22' : '#ebedf0';

  // Compute min/max of non-zero counts for relative bucket scaling
  const nonZeroStats = useMemo(() => {
    const vals = flat.map(d => d.count).filter(c => c > 0);
    if (!vals.length) return { min: 0, max: 0 };
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    return { min, max };
  }, [flat]);

  // GitHub-style intensity calculation: 5 levels (0-4) based on quartiles
  const getLevelAndColor = (count) => {
    if (!count) return { level: 0, color: emptyColor };

    const { min, max } = nonZeroStats;
    if (max <= 0 || min === max) {
      // All non-zero values are the same - use level 1 (lightest)
      return { level: 1, color: palette[0] };
    }

    // Calculate quartiles for distribution
    const range = max - min;
    const normalized = (count - min) / range;
    
    // GitHub uses 4 levels for non-zero contributions
    // Level 1: 0-25%, Level 2: 25-50%, Level 3: 50-75%, Level 4: 75-100%
    let level;
    if (normalized <= 0.25) level = 1;
    else if (normalized <= 0.50) level = 2;
    else if (normalized <= 0.75) level = 3;
    else level = 4;

    return { level, color: palette[level - 1] };
  };

  // Format date for tooltip (e.g., "5 contributions on Monday, December 16, 2024")
  const formatTooltip = (date, count) => {
    const d = new Date(date + 'T00:00:00'); // Ensure correct timezone
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = d.toLocaleDateString('en-US', options);
    
    if (count === 0) {
      return `No contributions on ${formattedDate}`;
    } else if (count === 1) {
      return `1 contribution on ${formattedDate}`;
    } else {
      return `${count} contributions on ${formattedDate}`;
    }
  };

  const handleMouseEnter = (day, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setHoveredDay(day);
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  const getStyle = (count, isHovered = false) => {
    const { color } = getLevelAndColor(count);
    return { 
      backgroundColor: color, 
      borderRadius: '2px',
      border: isHovered ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.1s ease',
      zIndex: isHovered ? 10 : 1
    };
  };

  return (
    <div className={`p-4 rounded-md ${theme === 'dark' ? 'bg-[#001018]/60' : 'bg-white/90'} relative`} ref={containerRef}>
      {/* Tooltip */}
      {hoveredDay && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: theme === 'dark' ? 'rgba(31, 35, 40, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            color: theme === 'dark' ? '#c9d1d9' : '#24292f',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: theme === 'dark' 
              ? '0 8px 24px rgba(0, 0, 0, 0.5)' 
              : '0 8px 24px rgba(149, 157, 165, 0.2)',
            border: theme === 'dark' ? '1px solid rgba(48, 54, 61, 1)' : '1px solid #d0d7de'
          }}
        >
          {formatTooltip(hoveredDay.date, hoveredDay.count)}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs font-mono ${theme === 'dark' ? 'text-cyan-300' : 'text-[#0b4f4f]'}`}>Contribution Heatmap</div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="w-full" style={{ paddingBottom: 12 }}>
          
          {/* Months header (grid responsive width) */}
          {/* Make the grid scrollable horizontally when it doesn't fit */}
          <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
            <div style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
              {/* Months header aligned to fixed columns */}
              <div style={{ 
                display: 'flex',
                gap: `${dayLabelGap}px`,
                marginBottom: '8px'
              }}>
                {/* Spacer for day labels */}
                <div style={{ width: `${leftLabelWidth}px` }} />
                
                {/* Month labels */}
                <div style={{ 
                  display: 'flex', 
                  gap: `${gap}px`,
                  width: `${displayWeeks.length * squareSize + (displayWeeks.length - 1) * gap}px`
                }}>
                  {displayWeeks.map((week, i) => {
                    const date = new Date(week[0].date);
                    const label = date.toLocaleString('default', { month: 'short' });
                    const prevLabel = i > 0 ? new Date(displayWeeks[i - 1][0].date).toLocaleString('default', { month: 'short' }) : null;
                    
                    // Only show label if it's the first occurrence of the month AND we have space (at least 2 weeks)
                    const nextMonthIndex = displayWeeks.findIndex((w, idx) => {
                      if (idx <= i) return false;
                      const nextDate = new Date(w[0].date);
                      return nextDate.toLocaleString('default', { month: 'short' }) !== label;
                    });
                    
                    const weeksInMonth = nextMonthIndex === -1 ? displayWeeks.length - i : nextMonthIndex - i;
                    const showLabel = (i === 0 || label !== prevLabel) && weeksInMonth >= 2;
                    
                    return (
                      <div key={i} style={{ 
                        width: `${squareSize}px`, 
                        fontSize: '11px',
                        fontWeight: 400,
                        color: theme === 'dark' ? 'rgba(139, 148, 158, 1)' : '#57606a',
                        lineHeight: 1,
                        textAlign: 'left'
                      }}>
                        {showLabel ? label : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main grid container */}
              <div style={{ display: 'flex', gap: `${dayLabelGap}px` }}>
                {/* Day labels column */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: `${gap}px`,
                  width: `${leftLabelWidth}px`,
                  paddingTop: `${squareSize + gap}px` // Offset to align with first Monday
                }}>
                  {['Mon', '', 'Wed', '', 'Fri', '', ''].map((day, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '11px',
                      fontWeight: 400,
                      color: theme === 'dark' ? 'rgba(139, 148, 158, 1)' : '#57606a',
                      height: `${squareSize}px`,
                      display: 'flex',
                      alignItems: 'center',
                      lineHeight: 1
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Weeks grid - columns are weeks, rows are days of week */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: `repeat(${displayWeeks.length}, ${squareSize}px)`,
                  gridTemplateRows: `repeat(7, ${squareSize}px)`,
                  gap: `${gap}px`,
                  gridAutoFlow: 'column' // Fill column by column (week by week)
                }}>
                  {displayWeeks.map((week, weekIdx) => (
                    week.map((day, dayIdx) => {
                      // Don't render future dates
                      if (day.isFuture) {
                        return (
                          <div 
                            key={day.date}
                            style={{ 
                              width: `${squareSize}px`, 
                              height: `${squareSize}px`,
                              gridColumn: weekIdx + 1,
                              gridRow: dayIdx + 1,
                              visibility: 'hidden'
                            }}
                          />
                        );
                      }
                      
                      const isHovered = hoveredDay?.date === day.date;
                      return (
                        <div 
                          key={day.date}
                          role="img"
                          aria-label={`${day.count} contributions on ${day.date}`}
                          onMouseEnter={(e) => handleMouseEnter(day, e)}
                          onMouseLeave={handleMouseLeave}
                          style={{ 
                            width: `${squareSize}px`, 
                            height: `${squareSize}px`,
                            ...getStyle(day.count, isHovered),
                            cursor: 'pointer',
                            gridColumn: weekIdx + 1,
                            gridRow: dayIdx + 1,
                            position: 'relative'
                          }}
                        />
                      );
                    })
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-2 text-[11px] ${theme === 'dark' ? 'text-[#8b949e]' : 'text-[#57606a]'} flex items-center gap-2 justify-start`}>
          <span className="font-normal">Less</span>
          <div className="flex gap-[3px] items-center">
            <div style={{ width: 11, height: 11, backgroundColor: emptyColor, borderRadius: '2px' }} />
            {palette.map((c, i) => (
              <div key={i} style={{ width: 11, height: 11, backgroundColor: c, borderRadius: '2px' }} />
            ))}
          </div>
          <span className="font-normal">More</span>
        </div>

        {/* Filter caption */}
        <div className={`mt-1 text-[11px] font-mono ${theme === 'dark' ? 'text-cyan-400/80' : 'text-gray-500'}`}>{headerLabel}</div>
      </div>
    </div>
  );
}