import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SUPPORTED_PLATFORMS } from '../../services/codingStatsService';
import { Terminal, Github } from '../common/Icons';
import ActivityHeatmap from '../common/ActivityHeatmap';
import { 
  Sparkles, 
  RefreshCw, 
  Plus, 
  ExternalLink, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  Trophy, 
  TrendingUp,
  BarChart3,
  Layers,
  Award,
  Code2
} from 'lucide-react';

export default function CodingStatsSection() {
  const { 
    codingPlatforms, 
    codolioProfile, 
    gitHubStats, 
    aggregatedCoding, 
    refreshAllCodingStats,
    isRefreshing,
    isOwnerMode,
    setIsGitHubModalOpen,
    setIsLeetCodeModalOpen,
    setIsCodolioModalOpen,
    setIsCodingPlatformsModalOpen
  } = usePortfolio();

  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const activeStats = useMemo(() => {
    if (selectedPlatform === 'all') {
      return {
        title: "Aggregated Coding Profile",
        totalSolved: aggregatedCoding.totalSolved,
        easy: aggregatedCoding.easy ?? aggregatedCoding.easySolved ?? 0,
        medium: aggregatedCoding.medium ?? aggregatedCoding.mediumSolved ?? 0,
        hard: aggregatedCoding.hard ?? aggregatedCoding.hardSolved ?? 0,
        streak: aggregatedCoding.streak ?? codolioProfile?.stats?.streak ?? null,
        activeDays: aggregatedCoding.activeDays ?? codolioProfile?.stats?.activeDays ?? null,
        globalRank: aggregatedCoding.ranking ?? codolioProfile?.stats?.ranking ?? null,
        profileUrl: codolioProfile?.profileUrl || 'https://codolio.com/profile/01AdarshSingh',
        lastUpdated: codolioProfile?.lastUpdated ?? null,
        hasData: aggregatedCoding.totalSolved != null && aggregatedCoding.totalSolved > 0
      };
    }

    if (selectedPlatform === 'codolio') {
      return {
        title: "Codolio Unified Profile",
        totalSolved: codolioProfile?.stats?.problemsSolved ?? null,
        easy: codolioProfile?.stats?.easy ?? 0,
        medium: codolioProfile?.stats?.medium ?? 0,
        hard: codolioProfile?.stats?.hard ?? 0,
        streak: codolioProfile?.stats?.streak ?? null,
        activeDays: codolioProfile?.stats?.activeDays ?? null,
        globalRank: codolioProfile?.stats?.ranking ?? null,
        profileUrl: codolioProfile?.profileUrl ?? null,
        lastUpdated: codolioProfile?.lastUpdated ?? null,
        hasData: codolioProfile?.stats?.problemsSolved != null
      };
    }

    const platformData = codingPlatforms.find(p => p.platform === selectedPlatform);
    if (platformData) {
      const config = SUPPORTED_PLATFORMS.find(sp => sp.id === platformData.platform) || { name: platformData.platform };
      return {
        title: `${config.name} Profile`,
        totalSolved: platformData.stats?.problemsSolved ?? null,
        easy: platformData.stats?.easy ?? 0,
        medium: platformData.stats?.medium ?? 0,
        hard: platformData.stats?.hard ?? 0,
        streak: platformData.stats?.streak ?? null,
        rating: platformData.stats?.rating ?? null,
        globalRank: platformData.stats?.ranking ?? null,
        profileUrl: platformData.profileUrl ?? null,
        lastUpdated: platformData.lastUpdated ?? null,
        hasData: platformData.stats?.problemsSolved != null
      };
    }

    return { hasData: false };
  }, [selectedPlatform, aggregatedCoding, codolioProfile, codingPlatforms]);

  const easyPct = activeStats.totalSolved ? Math.round(((activeStats.easy || 0) / activeStats.totalSolved) * 100) : 0;
  const medPct = activeStats.totalSolved ? Math.round(((activeStats.medium || 0) / activeStats.totalSolved) * 100) : 0;
  const hardPct = activeStats.totalSolved ? Math.round(((activeStats.hard || 0) / activeStats.totalSolved) * 100) : 0;

  return (
    <section id="coding-stats" className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-px bg-[var(--primary)]" />
            <span className="font-caps text-xs tracking-widest text-[var(--primary)] font-semibold">
              REAL-TIME CODING & ALGORITHMS
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-main)] mb-3 tracking-tight">
            DSA & Platform Analytics
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Comprehensive problem-solving analytics aggregated live across LeetCode, Codolio, Codeforces, and connected platforms.
          </p>
        </div>

        {/* Owner Controls (Sync / Platform Add) */}
        {isOwnerMode && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={refreshAllCodingStats}
              disabled={isRefreshing}
              className="btn-secondary text-xs !py-2.5 !px-4 flex items-center gap-2"
              title="Re-fetch live data from external services"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh ↻'}</span>
            </button>

            <button
              onClick={() => setIsLeetCodeModalOpen(true)}
              className="btn-secondary text-xs !py-2.5 !px-4 flex items-center gap-2 text-amber-400 hover:text-amber-300"
            >
              <Code2 size={14} />
              <span>Sync LeetCode</span>
            </button>

            <button
              onClick={() => setIsCodolioModalOpen(true)}
              className="btn-secondary text-xs !py-2.5 !px-4 flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
            >
              <Sparkles size={14} />
              <span>Sync Codolio</span>
            </button>

            <button
              onClick={() => setIsCodingPlatformsModalOpen(true)}
              className="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-2 font-bold"
            >
              <Plus size={14} />
              <span>Add Platform</span>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-[var(--border-color)] pb-4">
        <button
          onClick={() => setSelectedPlatform('all')}
          className={`font-sans text-xs font-semibold px-4 py-2 rounded-full transition-all ${
            selectedPlatform === 'all'
              ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md shadow-[var(--primary)]/20'
              : 'glass-panel text-[var(--text-dim)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
          }`}
        >
          All Platforms ({aggregatedCoding.totalSolved ?? 0})
        </button>

        {codolioProfile && (
          <button
            onClick={() => setSelectedPlatform('codolio')}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
              selectedPlatform === 'codolio'
                ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                : 'glass-panel text-[var(--text-dim)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            <Sparkles size={12} />
            <span>Codolio</span>
          </button>
        )}

        {codingPlatforms.map(p => {
          const config = SUPPORTED_PLATFORMS.find(sp => sp.id === p.platform) || { name: p.platform };
          const pSolved = p.stats?.problemsSolved ?? null;
          return (
            <button
              key={p.platform}
              onClick={() => setSelectedPlatform(p.platform)}
              className={`font-sans text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
                selectedPlatform === p.platform
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'glass-panel text-[var(--text-dim)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
              }`}
            >
              <span>{config.name}</span>
              {pSolved != null && pSolved > 0 && (
                <span className="text-[10px] opacity-75 font-mono">({pSolved})</span>
              )}
            </button>
          );
        })}

        {isOwnerMode && (
          <button
            onClick={() => setIsCodingPlatformsModalOpen(true)}
            className="font-sans text-xs font-semibold px-3 py-2 rounded-full glass-panel border border-dashed border-[var(--border-color)] text-[var(--primary)] hover:border-[var(--primary)] transition-all flex items-center gap-1 ml-auto"
          >
            <Plus size={13} />
            <span>Add Platform +</span>
          </button>
        )}
      </div>

      {activeStats.hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          
          <div className="lg:col-span-5 glass-panel p-6 md:p-8 rounded-3xl border border-[var(--border-color)] flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-semibold">
                  {activeStats.title}
                </span>
                <span className="font-mono text-[11px] text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-0.5 rounded-full border border-[var(--primary)]/20 font-semibold">
                  Live Analytics
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl md:text-6xl font-extrabold text-[var(--text-main)] tracking-tight">
                    {activeStats.totalSolved}
                  </span>
                  <span className="font-sans text-sm text-[var(--text-muted)] font-medium">
                    Problems Solved
                  </span>
                </div>

                {activeStats.streak != null && activeStats.streak > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-orange-400 font-mono font-bold bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 w-fit">
                    <Flame size={14} className="fill-orange-400" />
                    <span>{activeStats.streak} Day Active Streak</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Easy</span>
                    </span>
                    <span className="text-[var(--text-dim)]">{activeStats.easy || 0} ({easyPct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface-high)] overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${easyPct}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Medium</span>
                    </span>
                    <span className="text-[var(--text-dim)]">{activeStats.medium || 0} ({medPct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface-high)] overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${medPct}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span>Hard</span>
                    </span>
                    <span className="text-[var(--text-dim)]">{activeStats.hard || 0} ({hardPct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface-high)] overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full transition-all duration-500" style={{ width: `${hardPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {activeStats.profileUrl && activeStats.profileUrl !== '#' && (
              <a
                href={activeStats.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs !py-2.5 justify-center flex items-center gap-2 font-bold shadow-md shadow-[var(--primary)]/20"
              >
                <span>View {activeStats.title ? activeStats.title.replace(' Profile', '') : 'Coding'} Public Profile</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          <div className="lg:col-span-7 space-y-4">
            <h3 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-bold flex items-center gap-2 mb-2">
              <BarChart3 size={15} className="text-[var(--primary)]" />
              Connected Platform Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aggregatedCoding.platformBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3 hover:border-[var(--primary)]/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <h4 className="font-display text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                        {item.platform}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-extrabold text-[var(--primary)]">
                        {item.solved}
                      </span>
                      {item.profileUrl && item.profileUrl !== '#' && (
                        <a
                          href={item.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-[var(--bg-surface-high)] text-[var(--text-dim)] hover:text-[var(--primary)] border border-white/5 transition-colors"
                          title={`Open ${item.platform} Profile`}
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-center font-mono text-[11px]">
                    <div className="bg-[var(--bg-surface-high)] p-1.5 rounded-lg">
                      <span className="text-[9px] text-emerald-400 block">EASY</span>
                      <span>{item.easy}</span>
                    </div>
                    <div className="bg-[var(--bg-surface-high)] p-1.5 rounded-lg">
                      <span className="text-[9px] text-amber-400 block">MED</span>
                      <span>{item.medium}</span>
                    </div>
                    <div className="bg-[var(--bg-surface-high)] p-1.5 rounded-lg">
                      <span className="text-[9px] text-rose-400 block">HARD</span>
                      <span>{item.hard}</span>
                    </div>
                  </div>

                  {item.rating && (
                    <div className="text-[11px] text-[var(--text-dim)] font-mono flex justify-between pt-1">
                      <span>Rating: {item.rating}</span>
                      {item.rank && <span>{item.rank}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-surface-high)]/60 border border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-dim)]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live statistics synchronized with connected coding profiles.</span>
              </span>
              <span className="font-mono text-[10px]">
                {activeStats.lastUpdated ? `Updated: ${new Date(activeStats.lastUpdated).toLocaleDateString()}` : 'Live'}
              </span>
            </div>
          </div>
          
          {/* GitHub Stats Card */}
          {gitHubStats && (selectedPlatform === 'all' || selectedPlatform === 'github') && (
            <div className="lg:col-span-12 glass-panel p-6 rounded-3xl border border-[var(--border-color)] animate-in fade-in duration-300 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[var(--bg-surface-high)] rounded-2xl border border-[var(--border-color)] text-[var(--primary)]">
                    <Github size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base md:text-lg text-[var(--text-main)]">
                      GitHub Analytics & Repository Metrics
                    </h3>
                    <p className="text-xs text-[var(--text-dim)] font-sans">
                      Open source contributions and project metrics for @{gitHubStats.username || 'developer'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isOwnerMode && (
                    <button
                      onClick={() => setIsGitHubModalOpen(true)}
                      className="btn-secondary text-xs !py-1.5 !px-3"
                    >
                      Sync Repos ↻
                    </button>
                  )}
                  <a href={gitHubStats.profileUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5">
                    <span>View Profile</span> <ExternalLink size={12}/>
                  </a>
                </div>
              </div>
              
              {/* Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                <div className="bg-[var(--bg-surface-high)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-wider block mb-1">Total Commits</span>
                  <span className="font-mono text-xl md:text-2xl text-[var(--primary)] font-bold">{gitHubStats.stats?.commits || 0}</span>
                </div>
                <div className="bg-[var(--bg-surface-high)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-wider block mb-1">Repositories</span>
                  <span className="font-mono text-xl md:text-2xl text-[var(--text-main)] font-bold">{gitHubStats.stats?.repositories || 0}</span>
                </div>
                <div className="bg-[var(--bg-surface-high)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-wider block mb-1">Stars Earned</span>
                  <span className="font-mono text-xl md:text-2xl text-amber-400 font-bold">{gitHubStats.stats?.stars || 0} ⭐</span>
                </div>
                <div className="bg-[var(--bg-surface-high)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-wider block mb-1">Forks</span>
                  <span className="font-mono text-xl md:text-2xl text-[var(--text-main)] font-bold">{gitHubStats.stats?.forks || 0}</span>
                </div>
                <div className="bg-[var(--bg-surface-high)] p-4 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-dim)] font-bold uppercase tracking-wider block mb-1">Followers</span>
                  <span className="font-mono text-xl md:text-2xl text-[var(--text-main)] font-bold">{gitHubStats.stats?.followers || 0}</span>
                </div>
              </div>

              {/* GitHub 365-Day Contribution Heatmap */}
              <div className="pt-2 border-t border-white/5">
                <ActivityHeatmap 
                  data={gitHubStats.activity || []} 
                  colorTheme="emerald" 
                  label="GitHub Contribution Calendar"
                  username={gitHubStats.username}
                  profileUrl={gitHubStats.profileUrl}
                  icon={Github}
                  totalCount={gitHubStats.stats?.commits}
                />
              </div>
            </div>
          )}

          {/* LeetCode Activity Heatmap Card */}
          {codingPlatforms.find(p => p.platform === 'leetcode') && (selectedPlatform === 'all' || selectedPlatform === 'leetcode') && (
            <div className="lg:col-span-12 glass-panel p-6 rounded-3xl border border-[var(--border-color)] overflow-hidden animate-in fade-in duration-300">
              {(() => {
                const lc = codingPlatforms.find(p => p.platform === 'leetcode');
                return (
                  <ActivityHeatmap 
                    data={lc.activity || []} 
                    colorTheme="amber" 
                    label="LeetCode Submissions & Problem Solving"
                    username={lc.username}
                    profileUrl={lc.profileUrl}
                    icon={Code2}
                    totalCount={lc.stats?.problemsSolved}
                    streak={lc.stats?.streak}
                    activeDays={lc.activity?.length}
                  />
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-10 md:p-14 rounded-3xl border border-[var(--border-color)] text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto border border-[var(--primary)]/20">
            <Terminal size={26} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[var(--text-main)] mb-1">
              {isOwnerMode ? "No Coding Platform Connected Yet" : "Coding Profiles"}
            </h3>
            <p className="font-sans text-xs text-[var(--text-muted)] leading-relaxed">
              {isOwnerMode
                ? "Connect your public Codolio, LeetCode, Codeforces, or CodeChef profile to automatically display real DSA problem-solving progress."
                : "Real-time algorithmic metrics and problem-solving analytics will appear here."}
            </p>
          </div>
          {isOwnerMode && (
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsLeetCodeModalOpen(true)}
                className="btn-primary text-xs !py-3 !px-6 font-bold inline-flex items-center gap-2"
              >
                <Code2 size={15} />
                <span>Connect LeetCode</span>
              </button>
              <button
                onClick={() => setIsCodolioModalOpen(true)}
                className="btn-secondary text-xs !py-3 !px-6 font-bold inline-flex items-center gap-2"
              >
                <Sparkles size={15} />
                <span>Connect Codolio</span>
              </button>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
