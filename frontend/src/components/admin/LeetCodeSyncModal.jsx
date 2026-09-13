import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import ActivityHeatmap from '../common/ActivityHeatmap';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Trophy,
  Zap,
  Code2,
  CheckCircle2
} from 'lucide-react';

export default function LeetCodeSyncModal() {
  const { 
    portfolio,
    codingPlatforms,
    addCodingPlatform,
    isLeetCodeModalOpen, 
    setIsLeetCodeModalOpen,
    showToast
  } = usePortfolio();

  const currentLeetCodeData = codingPlatforms.find(p => p.platform === 'leetcode');
  const [leetcodeInput, setLeetcodeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLeetCodeModalOpen) {
      const activeLC = portfolio.socials?.leetcode || currentLeetCodeData?.username || 'Adarsh_Singh_001';
      setLeetcodeInput(activeLC);
    }
  }, [isLeetCodeModalOpen, portfolio.socials?.leetcode, currentLeetCodeData?.username]);

  if (!isLeetCodeModalOpen) return null;

  const handleClose = () => {
    setIsLeetCodeModalOpen(false);
  };

  const handleSyncLeetCode = async () => {
    if (!leetcodeInput.trim()) return;
    setIsLoading(true);
    try {
      await addCodingPlatform('leetcode', leetcodeInput.trim());
    } catch (err) {
      // Toast handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const stats = currentLeetCodeData?.stats || {};
  const totalSolved = stats.problemsSolved ?? 0;
  const easySolved = stats.easy ?? 0;
  const medSolved = stats.medium ?? 0;
  const hardSolved = stats.hard ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Code2 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
                  LeetCode Profile & Submission Sync
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  GRAPHQL API
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Direct integration with LeetCode GraphQL API for real-time problem solving breakdown and heatmap.
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
              LeetCode Username or Profile Link
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={leetcodeInput}
                  onChange={(e) => setLeetcodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSyncLeetCode()}
                  placeholder="e.g. Adarsh_Singh_001 or https://leetcode.com/u/Adarsh_Singh_001/"
                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-amber-400 transition-all font-mono"
                />
              </div>

              <button
                onClick={handleSyncLeetCode}
                disabled={isLoading || !leetcodeInput.trim()}
                className="btn-primary text-xs !py-3 !px-6 font-bold flex items-center justify-center gap-2 shrink-0 !bg-amber-500 hover:!bg-amber-400 !text-black"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Querying GraphQL...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    <span>Sync LeetCode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Metrics Display */}
          {currentLeetCodeData && (
            <div className="space-y-5">
              
              {/* Header Card */}
              <div className="p-5 rounded-2xl bg-[var(--bg-surface-high)]/60 border border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-[var(--text-main)]">
                      @{currentLeetCodeData.username}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Synced
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-dim)] font-mono">
                    Global Ranking: #{stats.ranking ? stats.ranking.toLocaleString() : 'N/A'} {stats.rating ? `• Contest Rating: ${stats.rating}` : ''}
                  </span>
                </div>

                <a
                  href={currentLeetCodeData.profileUrl || `https://leetcode.com/u/${currentLeetCodeData.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs !py-1.5 !px-3.5 flex items-center gap-1.5"
                >
                  <span>View on LeetCode</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Solved Problems Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold block mb-1">Total Solved</span>
                  <span className="font-mono text-2xl font-extrabold text-[var(--text-main)]">{totalSolved}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-emerald-400 font-bold block mb-1">Easy</span>
                  <span className="font-mono text-2xl font-extrabold text-emerald-400">{easySolved}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-amber-400 font-bold block mb-1">Medium</span>
                  <span className="font-mono text-2xl font-extrabold text-amber-400">{medSolved}</span>
                </div>
                <div className="glass-panel p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
                  <span className="text-[10px] font-caps uppercase tracking-wider text-rose-400 font-bold block mb-1">Hard</span>
                  <span className="font-mono text-2xl font-extrabold text-rose-400">{hardSolved}</span>
                </div>
              </div>

              {/* Submission Calendar Heatmap */}
              {currentLeetCodeData.activity && currentLeetCodeData.activity.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] overflow-hidden">
                  <ActivityHeatmap 
                    data={currentLeetCodeData.activity}
                    colorTheme="emerald"
                    label="LeetCode Submissions Calendar"
                  />
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-dim)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>LeetCode statistics query real-time GraphQL APIs.</span>
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
