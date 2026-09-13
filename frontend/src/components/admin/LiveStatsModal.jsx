import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SUPPORTED_PLATFORMS } from '../../services/codingStatsService';
import { Github, Terminal } from '../common/Icons';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Layers, 
  CheckSquare,
  Square,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import { getApiUrl } from '../../services/apiConfig';

export default function LiveStatsModal() {
  const { 
    portfolio,
    codolioProfile, 
    codingPlatforms, 
    gitHubStats, 
    syncCodolio, 
    syncGitHub,
    addSelectedGitHubProjects,
    addCodingPlatform, 
    removeCodingPlatform, 
    isLiveStatsModalOpen, 
    setIsLiveStatsModalOpen 
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('codolio'); // 'codolio' | 'leetcode' | 'platforms' | 'github'

  const [codolioInput, setCodolioInput] = useState(portfolio.socials.codolio || 'https://codolio.com/profile/01AdarshSingh');
  const [githubInput, setGithubInput] = useState(portfolio.socials.github || 'AdarshSingh001');
  const [leetcodeInput, setLeetcodeInput] = useState(portfolio.socials.leetcode || 'Adarsh_Singh_001');
  
  const [customPlatform, setCustomPlatform] = useState('codeforces');
  const [customHandle, setCustomHandle] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // GitHub repo picker state
  const [fetchedRepos, setFetchedRepos] = useState(null); // null = not fetched, [] = fetched
  const [selectedRepoIds, setSelectedRepoIds] = useState(new Set());

  if (!isLiveStatsModalOpen) return null;

  const handleClose = () => setIsLiveStatsModalOpen(false);

  const handleSyncCodolio = async () => {
    if (!codolioInput.trim()) return;
    setIsLoading(true);
    try {
      await syncCodolio(codolioInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncLeetCode = async () => {
    if (!leetcodeInput.trim()) return;
    setIsLoading(true);
    try {
      await addCodingPlatform('leetcode', leetcodeInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchGitHubRepos = async () => {
    if (!githubInput.trim()) return;
    setIsLoading(true);
    setFetchedRepos(null);
    setSelectedRepoIds(new Set());
    try {
      const data = await syncGitHub(githubInput);
      if (data?.projects) {
        setFetchedRepos(data.projects);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRepo = (repoId) => {
    setSelectedRepoIds(prev => {
      const next = new Set(prev);
      if (next.has(repoId)) next.delete(repoId);
      else next.add(repoId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!fetchedRepos) return;
    if (selectedRepoIds.size === fetchedRepos.length) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(fetchedRepos.map(r => r.id)));
    }
  };

  const handleAddSelectedRepos = async () => {
    if (!fetchedRepos || selectedRepoIds.size === 0) return;
    setIsLoading(true);
    
    try {
      const selected = fetchedRepos.filter(r => selectedRepoIds.has(r.id));
      
      // Fetch READMEs for descriptions
      const projectsWithReadmes = await Promise.all(selected.map(async (project) => {
        try {
          // Extract owner and repo from githubUrl (e.g. https://github.com/owner/repo)
          const urlParts = project.githubUrl.split('/');
          const repo = urlParts.pop();
          const owner = urlParts.pop();
          
          if (owner && repo) {
            const res = await fetch(getApiUrl(`/api/github/readme?owner=${owner}&repo=${repo}`));
            if (res.ok) {
              const data = await res.json();
              const textContent = data.text || data.readme;
              if (textContent) {
                // Strip markdown formatting simple regex and take first 500 chars
                const cleanText = textContent
                  .replace(/[#*`_\[\]]/g, '')
                  .replace(/\]\(.*?\)/g, '')
                  .replace(/\n+/g, ' ')
                  .trim();
                
                if (cleanText) {
                  return { ...project, description: cleanText.substring(0, 500) + (cleanText.length > 500 ? '...' : '') };
                }
              }
            }
          }
        } catch (e) {
          console.error(`Failed to fetch README for ${project.title}:`, e);
        }
        return project;
      }));

      addSelectedGitHubProjects(projectsWithReadmes);
      setSelectedRepoIds(new Set());
      setFetchedRepos(null);
      setActiveTab('github');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    if (!customHandle.trim()) return;
    setIsLoading(true);
    try {
      await addCodingPlatform(customPlatform, customHandle);
      setCustomHandle('');
    } finally {
      setIsLoading(false);
    }
  };

  // Check which repos are already in portfolio
  const existingProjectIds = new Set(portfolio.projects.map(p => p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text-main)]">
                Live Data & Developer Profile Sync
              </h2>
              <p className="text-xs text-[var(--text-dim)] font-sans">
                Connect Codolio, LeetCode, GitHub, or competitive coding profiles. Pick projects manually.
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 px-6 md:px-8 pt-3 pb-2 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/50">
          <button
            onClick={() => setActiveTab('codolio')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'codolio' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Sparkles size={13} />
            <span>Codolio Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('leetcode')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'leetcode' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Terminal size={13} />
            <span>LeetCode</span>
          </button>

          <button
            onClick={() => setActiveTab('platforms')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'platforms' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Layers size={13} />
            <span>Coding Platforms ({codingPlatforms.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('github'); setFetchedRepos(null); setSelectedRepoIds(new Set()); }}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ml-auto ${
              activeTab === 'github' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Github size={13} />
            <span>GitHub & Projects</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: CODOLIO */}
          {activeTab === 'codolio' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--text-muted)] space-y-1">
                <span className="font-bold text-[var(--primary)] block">Codolio — Aggregated DSA Profile</span>
                <p>
                  Codolio aggregates problem-solving stats across LeetCode, CodeChef, Codeforces, GfG, and HackerRank into one profile. This powers your DSA Analytics section.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block font-bold">
                  Codolio Profile URL or Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://codolio.com/profile/username or @username"
                    value={codolioInput}
                    onChange={(e) => setCodolioInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  />
                  <button
                    onClick={handleSyncCodolio}
                    disabled={isLoading || !codolioInput.trim()}
                    className="btn-primary text-xs !py-2.5 !px-5 font-bold disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                    <span>Connect</span>
                  </button>
                </div>
              </div>

              {codolioProfile && (
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-caps text-[10px] text-[var(--primary)] uppercase font-bold">Connected</span>
                      <h4 className="font-display text-base font-bold text-[var(--text-main)]">@{codolioProfile.username}</h4>
                    </div>
                    <a href={codolioProfile.profileUrl} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5">
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {codolioProfile.stats?.problemsSolved > 0 && (
                    <div className="grid grid-cols-4 gap-2 text-center pt-2">
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-[var(--text-dim)] uppercase block">Total</span>
                        <span className="font-display text-lg font-bold text-[var(--primary)]">{codolioProfile.stats.problemsSolved}</span>
                      </div>
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-emerald-400 uppercase block">Easy</span>
                        <span className="font-display text-lg font-bold text-emerald-400">{codolioProfile.stats.easy}</span>
                      </div>
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-amber-400 uppercase block">Medium</span>
                        <span className="font-display text-lg font-bold text-amber-400">{codolioProfile.stats.medium}</span>
                      </div>
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-rose-400 uppercase block">Hard</span>
                        <span className="font-display text-lg font-bold text-rose-400">{codolioProfile.stats.hard}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEETCODE */}
          {activeTab === 'leetcode' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block font-bold">
                  LeetCode Username or Profile URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Adarsh_Singh_001 or https://leetcode.com/u/username/"
                    value={leetcodeInput}
                    onChange={(e) => setLeetcodeInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  />
                  <button
                    onClick={handleSyncLeetCode}
                    disabled={isLoading || !leetcodeInput.trim()}
                    className="btn-primary text-xs !py-2.5 !px-5 font-bold disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Terminal size={13} />}
                    <span>Fetch</span>
                  </button>
                </div>
              </div>

              {(() => {
                const lc = codingPlatforms.find(p => p.platform === 'leetcode');
                if (!lc) return null;
                return (
                  <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-caps text-[10px] text-amber-400 uppercase font-bold">Verified LeetCode</span>
                        <h4 className="font-display text-base font-bold text-[var(--text-main)]">@{lc.username}</h4>
                        {lc.stats?.ranking && (
                          <span className="text-xs font-mono text-[var(--text-dim)]">Global Rank: #{lc.stats.ranking.toLocaleString()}</span>
                        )}
                      </div>
                      <a href={lc.profileUrl} target="_blank" rel="noopener noreferrer"
                        className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1">
                        <span>Open</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center pt-2">
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-[var(--text-dim)] uppercase block">Solved</span>
                        <span className="font-display text-lg font-bold text-[var(--primary)]">{lc.stats?.problemsSolved ?? 0}</span>
                      </div>
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-emerald-400 uppercase block">Easy</span>
                        <span className="font-display text-lg font-bold text-emerald-400">{lc.stats?.easy ?? 0}</span>
                      </div>
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-amber-400 uppercase block">Medium</span>
                        <span className="font-display text-lg font-bold text-amber-400">{lc.stats?.medium ?? 0}</span>
                      </div>
                      <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl">
                        <span className="text-[10px] text-rose-400 uppercase block">Hard</span>
                        <span className="font-display text-lg font-bold text-rose-400">{lc.stats?.hard ?? 0}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: MULTI-PLATFORM MANAGER */}
          {activeTab === 'platforms' && (
            <div className="space-y-5">
              <form onSubmit={handleAddPlatform} className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                <h4 className="font-display text-sm font-bold text-[var(--text-main)]">Add Additional Coding Platform</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1">Platform</label>
                    <select
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    >
                      {SUPPORTED_PLATFORMS.filter(p => p.id !== 'codolio').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1">Username / Handle</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. tourist / profile handle"
                      value={customHandle}
                      onChange={(e) => setCustomHandle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !customHandle.trim()}
                  className="w-full btn-primary text-xs !py-2.5 font-bold flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  <span>Fetch & Connect Platform</span>
                </button>
              </form>

              <div className="space-y-2.5">
                <h4 className="font-caps text-[10px] text-[var(--text-dim)] uppercase font-bold">Connected Platforms ({codingPlatforms.length})</h4>
                {codingPlatforms.map(p => (
                  <div key={p.platform} className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <span className="font-sans text-xs font-bold text-[var(--text-main)] capitalize">{p.platform}</span>
                      <span className="text-xs font-mono text-[var(--text-dim)] block">
                        @{p.username} &bull; {p.stats?.problemsSolved ?? 0} Solved
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={p.profileUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-xl hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--primary)]"
                        title="View Profile">
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => removeCodingPlatform(p.platform)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-[var(--text-dim)] hover:text-rose-400"
                        title="Remove Platform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GITHUB — Manual Repo Picker */}
          {activeTab === 'github' && (
            <div className="space-y-5">
              {/* Fetch input */}
              <div className="space-y-2">
                <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block font-bold">
                  GitHub Username or Profile URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. AdarshSingh001 or https://github.com/username"
                    value={githubInput}
                    onChange={(e) => { setGithubInput(e.target.value); setFetchedRepos(null); }}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  />
                  <button
                    onClick={handleFetchGitHubRepos}
                    disabled={isLoading || !githubInput.trim()}
                    className="btn-primary text-xs !py-2.5 !px-5 font-bold disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw size={13} className="animate-spin" /> : <Github size={13} />}
                    <span>{isLoading ? 'Loading...' : 'Fetch Repos'}</span>
                  </button>
                </div>
              </div>

              {/* Connected GitHub Stats */}
              {gitHubStats && !fetchedRepos && (
                <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-caps text-[10px] text-[var(--primary)] uppercase font-bold">Connected GitHub</span>
                      <h4 className="font-display text-base font-bold text-[var(--text-main)]">@{gitHubStats.username}</h4>
                      <span className="text-xs font-mono text-[var(--text-dim)]">
                        {gitHubStats.stats?.repositories} Repos &bull; {gitHubStats.stats?.stars ?? 0} Stars ⭐
                      </span>
                    </div>
                    <a href={`https://github.com/${gitHubStats.username}`} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1">
                      <span>Open</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {gitHubStats.detectedTechnologies?.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <span className="text-[10px] font-caps text-[var(--text-dim)] uppercase block">
                        Detected Technologies ({gitHubStats.detectedTechnologies.length})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {gitHubStats.detectedTechnologies.map((t, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-[var(--bg-surface-high)] text-[10px] font-mono text-[var(--primary)] border border-white/10">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-[var(--text-dim)] font-sans italic">
                    Click "Fetch Repos" above to load your repositories and select which ones to display in your portfolio.
                  </p>
                </div>
              )}

              {/* Repo Picker (after fetch) */}
              {fetchedRepos && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Picker Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-sm font-bold text-[var(--text-main)]">
                        Select Repositories to Add
                      </h4>
                      <p className="text-[11px] text-[var(--text-dim)] font-sans">
                        {selectedRepoIds.size} of {fetchedRepos.length} selected &bull; Repos already in portfolio are pre-marked.
                      </p>
                    </div>
                    <button
                      onClick={toggleSelectAll}
                      className="text-xs font-sans text-[var(--primary)] hover:underline flex items-center gap-1"
                    >
                      {selectedRepoIds.size === fetchedRepos.length ? <CheckSquare size={13} /> : <Square size={13} />}
                      <span>{selectedRepoIds.size === fetchedRepos.length ? 'Deselect All' : 'Select All'}</span>
                    </button>
                  </div>

                  {/* Repo List */}
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {fetchedRepos.map(repo => {
                      const isSelected = selectedRepoIds.has(repo.id);
                      const alreadyAdded = existingProjectIds.has(repo.id);
                      return (
                        <div
                          key={repo.id}
                          onClick={() => !alreadyAdded && toggleRepo(repo.id)}
                          className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                            alreadyAdded
                              ? 'opacity-40 cursor-not-allowed border-[var(--border-color)] glass-panel'
                              : isSelected
                                ? 'border-[var(--primary)] bg-[var(--primary)]/10 cursor-pointer'
                                : 'glass-panel border-[var(--border-color)] hover:border-[var(--primary)]/50 cursor-pointer'
                          }`}
                        >
                          {/* Checkbox */}
                          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                            alreadyAdded
                              ? 'border-emerald-500 bg-emerald-500/30'
                              : isSelected
                                ? 'border-[var(--primary)] bg-[var(--primary)]'
                                : 'border-[var(--border-color)]'
                          }`}>
                            {(isSelected || alreadyAdded) && <Check size={10} className="text-white" />}
                          </div>

                          {/* Repo Info */}
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <GitBranch size={12} className="text-[var(--primary)] shrink-0" />
                              <span className="font-display text-xs font-bold text-[var(--text-main)] truncate">
                                {repo.title}
                              </span>
                              {alreadyAdded && (
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full shrink-0">
                                  Added
                                </span>
                              )}
                            </div>
                            {repo.subtitle && (
                              <p className="text-[10px] text-[var(--text-dim)] font-sans truncate mt-0.5">
                                {repo.subtitle}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {repo.techStack?.slice(0, 3).map((t, i) => (
                                <span key={i} className="text-[9px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
                                  {t}
                                </span>
                              ))}
                              <span className="text-[9px] text-[var(--text-dim)] font-mono">{repo.year}</span>
                            </div>
                          </div>

                          {/* External Link */}
                          {repo.githubUrl && repo.githubUrl !== '#' && (
                            <a
                              href={repo.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-xl hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--primary)] shrink-0 transition-colors"
                              title="Open GitHub Repo"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Confirm Add */}
                  <button
                    onClick={handleAddSelectedRepos}
                    disabled={selectedRepoIds.size === 0}
                    className="w-full btn-primary text-xs font-bold !py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>
                      Add {selectedRepoIds.size > 0 ? selectedRepoIds.size : ''} Selected 
                      {selectedRepoIds.size === 1 ? ' Repository' : ' Repositories'} to Portfolio
                    </span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
