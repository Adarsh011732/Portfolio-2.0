import React, { useMemo, useState } from 'react';
import { ExternalLink, Flame, Calendar, Activity, Info } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function ActivityHeatmap({ 
  data = [], 
  colorTheme = 'emerald', 
  label = 'Activity',
  username = '',
  profileUrl = '',
  totalCount = null,
  streak = null,
  activeDays = null,
  icon: Icon = Activity,
  isLoading = false
}) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const weeks = 52;
  const daysPerWeek = 7;
  
  // Create a map of date string -> count for O(1) lookups
  const activityMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(data)) return map;
    data.forEach(item => {
      if (item && item.date && item.count !== undefined) {
        // Support both YYYY-MM-DD and timestamp strings
        const dateKey = typeof item.date === 'string' && item.date.includes('T')
          ? item.date.split('T')[0]
          : String(item.date).slice(0, 10);
        map.set(dateKey, item.count);
      }
    });
    return map;
  }, [data]);

  // Generate 52 weeks grid (364 days ending on current week)
  const { grid, monthMarkers, totalCalculated } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const currentDayOfWeek = today.getDay();
    
    // Compute start date: exactly 52 weeks back, starting on Sunday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * daysPerWeek) + (6 - currentDayOfWeek));

    const weeksArray = [];
    let currentDate = new Date(startDate);
    const months = [];
    let lastMonth = -1;
    let sum = 0;

    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const count = activityMap.get(dateStr) || 0;
        sum += count;

        const curMonth = currentDate.getMonth();
        if (curMonth !== lastMonth && d === 0) {
          months.push({ weekIndex: w, name: MONTH_NAMES[curMonth] });
          lastMonth = curMonth;
        }
        
        week.push({
          date: dateStr,
          rawDate: new Date(currentDate),
          count: count,
          isFuture: currentDate > today
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeksArray.push(week);
    }

    return { grid: weeksArray, monthMarkers: months, totalCalculated: sum };
  }, [activityMap]);

  const displayTotal = totalCount != null ? totalCount : totalCalculated;

  // Calculate intensity level (0 to 4)
  const getIntensityLevel = (count) => {
    if (count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  };

  // Color Theme definitions
  const themeStyles = {
    // LeetCode signature Amber / Orange theme
    amber: {
      0: 'bg-[var(--bg-surface-high)]/80 border border-white/5',
      1: 'bg-amber-950/80 border border-amber-800/50 hover:border-amber-400',
      2: 'bg-amber-700/80 border border-amber-600/60 hover:border-amber-300',
      3: 'bg-amber-500 border border-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.4)]',
      4: 'bg-amber-400 border border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]',
      legend: ['bg-[var(--bg-surface-high)]', 'bg-amber-950', 'bg-amber-700', 'bg-amber-500', 'bg-amber-400'],
      textAccent: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    // GitHub signature Green / Emerald theme
    emerald: {
      0: 'bg-[var(--bg-surface-high)]/80 border border-white/5',
      1: 'bg-emerald-950/80 border border-emerald-800/50 hover:border-emerald-400',
      2: 'bg-emerald-700/80 border border-emerald-600/60 hover:border-emerald-300',
      3: 'bg-emerald-500 border border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.4)]',
      4: 'bg-emerald-400 border border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.7)]',
      legend: ['bg-[var(--bg-surface-high)]', 'bg-emerald-950', 'bg-emerald-700', 'bg-emerald-500', 'bg-emerald-400'],
      textAccent: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    // Cyber Blue theme
    blue: {
      0: 'bg-[var(--bg-surface-high)]/80 border border-white/5',
      1: 'bg-sky-950/80 border border-sky-800/50 hover:border-sky-400',
      2: 'bg-sky-700/80 border border-sky-600/60 hover:border-sky-300',
      3: 'bg-sky-500 border border-sky-400 shadow-[0_0_6px_rgba(14,165,233,0.4)]',
      4: 'bg-sky-400 border border-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.7)]',
      legend: ['bg-[var(--bg-surface-high)]', 'bg-sky-950', 'bg-sky-700', 'bg-sky-500', 'bg-sky-400'],
      textAccent: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20'
    }
  };

  const theme = themeStyles[colorTheme] || themeStyles.emerald;

  const handleCellHover = (e, day) => {
    if (day.isFuture) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredDay(day);
  };

  const formatDateFriendly = (dateStr) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${theme.badgeBg}`}>
            <Icon size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-sm md:text-base text-[var(--text-main)]">
                {label}
              </h4>
              {username && (
                <span className="text-[10px] font-mono text-[var(--text-dim)] bg-[var(--bg-surface-high)] px-2 py-0.5 rounded-full border border-white/5">
                  @{username}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-dim)] font-mono">
              Activity across the last 12 months
            </p>
          </div>
        </div>

        {/* Stats Pills & Profile Link */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {streak != null && streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[11px] font-bold">
              <Flame size={13} className="fill-orange-400" />
              <span>{streak} Day Streak</span>
            </div>
          )}

          {activeDays != null && activeDays > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-surface-high)] text-[var(--text-main)] border border-white/5 text-[11px]">
              <Calendar size={12} className={theme.textAccent} />
              <span>{activeDays} Active Days</span>
            </div>
          )}

          <div className={`px-3 py-1 rounded-xl font-bold ${theme.badgeBg} text-xs`}>
            {displayTotal.toLocaleString()} Total
          </div>

          {profileUrl && (
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-[var(--bg-surface-high)] hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] border border-white/5 transition-all"
              title="View Public Profile"
            >
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent">
        <div className="min-w-[780px] p-2">
          
          {/* Month Markers Row */}
          <div className="flex text-[10px] font-mono text-[var(--text-dim)] mb-1.5 pl-7 relative h-4">
            {monthMarkers.map((m, idx) => (
              <span
                key={idx}
                className="absolute transform"
                style={{ left: `${(m.weekIndex / weeks) * 100}%` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          {/* Grid with Day Labels */}
          <div className="flex gap-2">
            
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] font-mono text-[var(--text-dim)] py-0.5 w-5 shrink-0 select-none">
              {DAY_LABELS.map((dayLabel, idx) => (
                <span key={idx} className="h-3 flex items-center">
                  {dayLabel}
                </span>
              ))}
            </div>

            {/* 52-Week Columns */}
            <div className="flex gap-[3.5px] flex-1">
              {grid.map((week, wIdx) => (
                <div key={`w-${wIdx}`} className="flex flex-col gap-[3.5px] flex-1">
                  {week.map((day, dIdx) => {
                    if (day.isFuture) {
                      return (
                        <div
                          key={`d-${wIdx}-${dIdx}`}
                          className="w-full aspect-square rounded-[3px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const level = getIntensityLevel(day.count);
                    const cellStyle = theme[level];

                    return (
                      <div
                        key={`d-${wIdx}-${dIdx}`}
                        onMouseEnter={(e) => handleCellHover(e, day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={(e) => handleCellHover(e, day)}
                        className={`w-full aspect-square rounded-[3px] transition-all duration-150 cursor-pointer ${cellStyle} hover:scale-125 hover:z-20`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Interactive Tooltip Bar / Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-white/5 font-mono">
        
        {/* Active Hover Detail */}
        <div className="flex items-center gap-2 min-h-[22px]">
          {hoveredDay ? (
            <div className="flex items-center gap-2 animate-in fade-in duration-150 text-[11px]">
              <span className="font-bold text-[var(--text-main)]">
                {hoveredDay.count} {hoveredDay.count === 1 ? 'activity' : 'activities'}
              </span>
              <span className="text-[var(--text-dim)]">on</span>
              <span className={`${theme.textAccent} font-semibold`}>
                {formatDateFriendly(hoveredDay.date)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-dim)] flex items-center gap-1.5">
              <Info size={12} />
              <span>Hover over or tap any box to view daily submissions and dates</span>
            </span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)] ml-auto">
          <span>Less</span>
          <div className="flex gap-1">
            {theme.legend.map((bgClass, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-[2px] border border-white/10 ${bgClass}`}
                title={`Level ${idx}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>

      </div>

    </div>
  );
}
