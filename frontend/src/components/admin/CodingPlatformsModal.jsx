import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SUPPORTED_PLATFORMS } from '../../services/codingStatsService';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Terminal,
  CheckCircle2
} from 'lucide-react';

export default function CodingPlatformsModal() {
  const { 
    codingPlatforms, 
    addCodingPlatform, 
    removeCodingPlatform, 
    isCodingPlatformsModalOpen, 
    setIsCodingPlatformsModalOpen,
    showToast 
  } = usePortfolio();

  const [platform, setPlatform] = useState('codeforces');
  const [handle, setHandle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isCodingPlatformsModalOpen) return null;

  const handleClose = () => {
    setIsCodingPlatformsModalOpen(false);
  };

  const handleAddPlatform = async () => {
    if (!handle.trim()) {
      showToast('Please enter a username or profile URL', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await addCodingPlatform(platform, handle.trim());
      setHandle('');
    } catch (err) {
      // Toast handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Terminal size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
                  Connect Coding & Competitive Platforms
                </h2>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Connect individual profiles from Codeforces, HackerRank, CodeChef, Kaggle, and AtCoder.
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

          {/* Add Platform Form */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
            <h3 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-bold">
              Add New Platform
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase mb-1">
                  Select Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                >
                  {SUPPORTED_PLATFORMS.filter(p => p.id !== 'github' && p.id !== 'codolio').map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-8">
                <label className="block text-[10px] font-bold text-[var(--text-dim)] uppercase mb-1">
                  Handle or Profile URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlatform()}
                    placeholder={`e.g. your_${platform}_handle`}
                    className="flex-1 bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  />
                  <button
                    onClick={handleAddPlatform}
                    disabled={isLoading || !handle.trim()}
                    className="btn-primary text-xs !py-2.5 !px-5 font-bold flex items-center gap-1.5 shrink-0"
                  >
                    {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={14} />}
                    <span>Connect</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Connected Platforms List */}
          <div className="space-y-3">
            <h3 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-bold flex items-center justify-between">
              <span>Connected Platforms ({codingPlatforms.length})</span>
            </h3>

            {codingPlatforms.length > 0 ? (
              <div className="space-y-2.5">
                {codingPlatforms.map((p) => {
                  const config = SUPPORTED_PLATFORMS.find(sp => sp.id === p.platform) || { name: p.platform };
                  return (
                    <div
                      key={p.platform}
                      className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[var(--bg-surface-high)] flex items-center justify-center font-bold text-xs text-[var(--primary)] border border-white/5 font-mono">
                          {config.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-sm text-[var(--text-main)]">
                              {config.name}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-dim)]">
                              @{p.username}
                            </span>
                          </div>
                          <span className="text-[11px] text-[var(--primary)] font-mono font-medium">
                            {p.stats?.problemsSolved != null ? `${p.stats.problemsSolved} Problems Solved` : 'Connected Profile'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.profileUrl && p.profileUrl !== '#' && (
                          <a
                            href={p.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[var(--bg-surface-high)] hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] border border-white/5 transition-all"
                            title="View Public Profile"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}

                        <button
                          onClick={() => removeCodingPlatform(p.platform)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                          title="Disconnect Platform"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-[var(--border-color)] text-center text-xs text-[var(--text-dim)]">
                No extra coding platforms connected yet.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-dim)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Connected platforms auto-aggregate into your DSA matrix.</span>
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
