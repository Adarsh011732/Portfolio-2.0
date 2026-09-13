import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Flame,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';

export default function CodolioSyncModal() {
  const { 
    portfolio,
    codolioProfile,
    syncCodolio,
    isCodolioModalOpen, 
    setIsCodolioModalOpen,
    showToast
  } = usePortfolio();

  const [codolioInput, setCodolioInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isCodolioModalOpen) {
      const activeCodolio = portfolio.socials?.codolio || codolioProfile?.username || '01AdarshSingh';
      setCodolioInput(activeCodolio);
    }
  }, [isCodolioModalOpen, portfolio.socials?.codolio, codolioProfile?.username]);

  if (!isCodolioModalOpen) return null;

  const handleClose = () => {
    setIsCodolioModalOpen(false);
  };

  const handleSyncCodolio = async () => {
    if (!codolioInput.trim()) return;
    setIsLoading(true);
    try {
      await syncCodolio(codolioInput.trim());
    } catch (err) {
      // Toast handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const stats = codolioProfile?.stats || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
                  Codolio Multi-Platform Aggregator Sync
                </h2>
                <span className="text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  REAL-TIME SYNC
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Aggregates coding metrics across LeetCode, Codeforces, HackerRank, and CodeChef into a single profile.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">

          {/* Connection Input Bar */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
              Codolio Profile URL or Username
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={codolioInput}
                  onChange={(e) => setCodolioInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSyncCodolio()}
                  placeholder="e.g. 01AdarshSingh or https://codolio.com/profile/01AdarshSingh"
                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleSyncCodolio}
                disabled={isLoading || !codolioInput.trim()}
                className="btn-primary text-xs !py-3 !px-6 font-bold flex items-center justify-center gap-2 shrink-0 !bg-cyan-500 hover:!bg-cyan-400 !text-black"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Syncing Codolio...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Sync Codolio</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connected Codolio Status Card */}
          {codolioProfile && (
            <div className="space-y-5">
              
              {/* Header Card */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-high)]/60 border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-[var(--text-main)]">
                      @{codolioProfile.username}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Connected
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-dim)] font-mono">
                    Global Rank: #{stats.ranking ? stats.ranking.toLocaleString() : 'N/A'} • {stats.activeDays || 0} Active Days
                  </span>
                </div>

                <a
                  href={codolioProfile.profileUrl || `https://codolio.com/profile/${codolioProfile.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs !py-1.5 !px-3.5 flex items-center gap-1.5"
                >
                  <span>Open Codolio</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Stats Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold block mb-1">Total Solved</span>
                  <span className="font-mono text-2xl font-extrabold text-[var(--text-main)]">{stats.problemsSolved ?? 0}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-orange-500/20 bg-orange-500/5 text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-orange-400 font-bold block mb-1">Active Streak</span>
                  <span className="font-mono text-2xl font-extrabold text-orange-400 flex items-center justify-center gap-1">
                    <Flame size={18} fill="currentColor" />
                    <span>{stats.streak ?? 0}d</span>
                  </span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-emerald-400 font-bold block mb-1">Easy</span>
                  <span className="font-mono text-2xl font-extrabold text-emerald-400">{stats.easy ?? 0}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-amber-400 font-bold block mb-1">Medium + Hard</span>
                  <span className="font-mono text-2xl font-extrabold text-amber-400">{(stats.medium ?? 0) + (stats.hard ?? 0)}</span>
                </div>
              </div>

              {/* Aggregated Platforms List */}
              {codolioProfile.platforms && codolioProfile.platforms.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                  <h4 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-bold flex items-center gap-2">
                    <Layers size={14} className="text-[var(--primary)]" />
                    <span>Linked Platform Accounts ({codolioProfile.platforms.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {codolioProfile.platforms.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[var(--bg-surface-high)] border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="font-display font-bold text-xs text-[var(--text-main)] block">{p.platform}</span>
                          <span className="text-[10px] text-[var(--text-dim)] font-mono">@{p.username}</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-[var(--primary)]">{p.solved} Solved</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-dim)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Profile synced with Codolio's live API aggregation.</span>
          </span>
          <button
            onClick={handleClose}
            className="btn-secondary text-xs !py-2 !px-4"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
