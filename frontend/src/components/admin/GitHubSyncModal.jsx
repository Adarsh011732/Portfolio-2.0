import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Github } from '../common/Icons';
import { 
  X, 
  RefreshCw, 
  Sparkles, 
  Check, 
  ExternalLink, 
  Layers, 
  CheckSquare,
  Square,
  ArrowRight,
  GitBranch,
  Star,
  Search,
  BookOpen
} from 'lucide-react';
import { getApiUrl } from '../../services/apiConfig';

export default function GitHubSyncModal() {
  const { 
    portfolio,
    gitHubStats, 
    syncGitHub,
    addSelectedGitHubProjects,
    isGitHubModalOpen, 
    setIsGitHubModalOpen,
    showToast
  } = usePortfolio();

  const [githubInput, setGithubInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Repositories picker state
  const [fetchedRepos, setFetchedRepos] = useState(null); // null = not fetched, [] = fetched
  const [selectedRepoIds, setSelectedRepoIds] = useState(new Set());

  // Keep input synchronized with stored GitHub username or URL
  useEffect(() => {
    if (isGitHubModalOpen) {
      const activeGithub = portfolio.socials?.github || gitHubStats?.username || 'AdarshSingh001';
      setGithubInput(activeGithub);
      // Auto-load repos if already present in gitHubStats
      if (gitHubStats?.projects && gitHubStats.projects.length > 0) {
        setFetchedRepos(gitHubStats.projects);
      }
    }
  }, [isGitHubModalOpen, portfolio.socials?.github, gitHubStats?.username, gitHubStats?.projects]);

  if (!isGitHubModalOpen) return null;

  const handleClose = () => {
    setIsGitHubModalOpen(false);
  };

  const handleFetchGitHubRepos = async () => {
    if (!githubInput.trim()) return;
    setIsLoading(true);
    setFetchedRepos(null);
    setSelectedRepoIds(new Set());
    try {
      const data = await syncGitHub(githubInput.trim());
      if (data?.projects) {
        setFetchedRepos(data.projects);
      }
    } catch (err) {
      // Toast handled in context
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
    if (!filteredRepos || filteredRepos.length === 0) return;
    if (selectedRepoIds.size === filteredRepos.length) {
      setSelectedRepoIds(new Set());
    } else {
      setSelectedRepoIds(new Set(filteredRepos.map(r => r.id)));
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
          const urlParts = project.githubUrl.split('/');
          const repo = urlParts.pop();
          const owner = urlParts.pop();

          if (owner && repo) {
            const res = await fetch(getApiUrl(`/api/github/readme?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`));
            if (res.ok) {
              const data = await res.json();
              const readmeContent = data.readme || data.text;
              if (readmeContent) {
                const cleanReadme = readmeContent
                  .replace(/<[^>]*>?/gm, '')
                  .replace(/[#*`_~[\]()]/g, '')
                  .split(/\r?\n/)
                  .map(l => l.trim())
                  .filter(l => l.length > 20)
                  .join(' ')
                  .slice(0, 450);

                if (cleanReadme.length > 30) {
                  return {
                    ...project,
                    description: cleanReadme,
                    subtitle: cleanReadme.slice(0, 80) + '...'
                  };
                }
              }
            }
          }
        } catch (e) {
          console.warn(`Could not fetch README for ${project.title}:`, e.message);
        }
        return project;
      }));

      addSelectedGitHubProjects(projectsWithReadmes);
      setIsGitHubModalOpen(false);
    } catch (err) {
      showToast('Error adding projects: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRepos = fetchedRepos?.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (Array.isArray(r.techStack) && r.techStack.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <Github size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
                  GitHub Profile & Repositories Sync
                </h2>
                <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  LIVE API
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Connect your GitHub handle, detect verified tech stack, and select repositories to display.
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

          {/* GitHub Connection Input */}
          <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
              GitHub Username or Profile URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchGitHubRepos()}
                  placeholder="e.g. AdarshSingh or https://github.com/AdarshSingh"
                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] transition-all font-mono"
                />
              </div>

              <button
                onClick={handleFetchGitHubRepos}
                disabled={isLoading || !githubInput.trim()}
                className="btn-primary text-xs !py-3 !px-6 font-bold flex items-center justify-center gap-2 shrink-0"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Syncing GitHub...</span>
                  </>
                ) : (
                  <>
                    <Github size={15} />
                    <span>Fetch Repositories</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Connected Profile Status Card */}
          {gitHubStats && (
            <div className="p-5 rounded-2xl bg-[var(--bg-surface-high)]/60 border border-[var(--border-color)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {gitHubStats.user?.avatar && (
                    <img 
                      src={gitHubStats.user.avatar} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border border-[var(--primary)]/30 object-cover" 
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-[var(--text-main)]">
                        @{gitHubStats.username}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Connected
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-dim)] font-mono">
                      {gitHubStats.stats?.repositories || 0} Repos • {gitHubStats.stats?.stars || 0} Stars ⭐ • {gitHubStats.stats?.commits || 0} Commits
                    </span>
                  </div>
                </div>

                <a
                  href={gitHubStats.profileUrl || `https://github.com/${gitHubStats.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs !py-1.5 !px-3.5 flex items-center gap-1.5"
                >
                  <span>Open Profile</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              {/* Detected Tech Badges */}
              {gitHubStats.detectedTechnologies && gitHubStats.detectedTechnologies.length > 0 && (
                <div>
                  <span className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold block mb-2">
                    Verified Technologies ({gitHubStats.detectedTechnologies.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {gitHubStats.detectedTechnologies.map(tech => (
                      <span key={tech} className="px-2.5 py-0.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-mono border border-[var(--primary)]/20">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Repository Selector Grid */}
          {fetchedRepos && fetchedRepos.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                    <BookOpen size={16} className="text-[var(--primary)]" />
                    <span>Select Repositories for Portfolio Cards</span>
                  </h3>
                  <p className="text-xs text-[var(--text-dim)]">
                    Only checked repositories will appear as project cards. READMEs are automatically parsed for descriptions.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={toggleSelectAll}
                    className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5"
                  >
                    {selectedRepoIds.size === (filteredRepos?.length || 0) && (filteredRepos?.length || 0) > 0 ? (
                      <>
                        <Square size={13} />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare size={13} />
                        <span>Select All</span>
                      </>
                    )}
                  </button>
                  <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20">
                    {selectedRepoIds.size} of {fetchedRepos.length} selected
                  </span>
                </div>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                <input
                  type="text"
                  placeholder="Filter repositories by name or tech stack..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Repos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredRepos?.map(repo => {
                  const isSelected = selectedRepoIds.has(repo.id);
                  return (
                    <div
                      key={repo.id}
                      onClick={() => toggleRepo(repo.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-[var(--primary)]/10 border-[var(--primary)] ring-1 ring-[var(--primary)]/40 shadow-lg shadow-[var(--primary)]/5' 
                          : 'glass-panel border-[var(--border-color)] hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-[var(--primary)] text-black' : 'border border-[var(--border-color)]'
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </span>
                            <h4 className="font-display font-bold text-xs text-[var(--text-main)] truncate max-w-[200px]">
                              {repo.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {repo.metrics?.find(m => m.label === 'Stars')?.value && (
                              <span className="text-[10px] font-mono text-amber-400 flex items-center gap-0.5">
                                <Star size={10} fill="currentColor" />
                                {repo.metrics.find(m => m.label === 'Stars').value}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed font-sans">
                          {repo.description || 'Public GitHub repository'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-white/5">
                        {repo.techStack?.slice(0, 3).map(tech => (
                          <span key={tech} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)] text-[var(--text-dim)] border border-white/5">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleAddSelectedRepos}
                  disabled={isLoading || selectedRepoIds.size === 0}
                  className="btn-primary text-xs !py-3 !px-6 font-bold flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20"
                >
                  <Sparkles size={15} />
                  <span>
                    {isLoading ? 'Importing with READMEs...' : `Add Selected (${selectedRepoIds.size}) to Portfolio`}
                  </span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-dim)]">
          <span>Connected data is saved securely in your portfolio state.</span>
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
