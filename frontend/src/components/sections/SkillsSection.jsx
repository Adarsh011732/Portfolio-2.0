import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Github } from '../common/Icons';
import { 
  Cpu, 
  Layout, 
  Server, 
  Cloud, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Zap,
  RefreshCw,
  Code2
} from 'lucide-react';

export default function SkillsSection() {
  const { 
    portfolio, 
    gitHubStats, 
    computedTechnologies, 
    isOwnerMode,
    setIsGitHubModalOpen 
  } = usePortfolio();
  const { skills } = portfolio;
  const [searchQuery, setSearchQuery] = useState('');

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('ai') || name.includes('agent') || name.includes('ml')) return <Cpu size={18} className="text-[var(--primary)]" />;
    if (name.includes('front') || name.includes('creative') || name.includes('ui') || name.includes('web')) return <Layout size={18} className="text-[var(--primary)]" />;
    if (name.includes('back') || name.includes('system') || name.includes('api')) return <Server size={18} className="text-[var(--primary)]" />;
    return <Cloud size={18} className="text-[var(--primary)]" />;
  };

  return (
    <section id="skills" className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full relative">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-px bg-[var(--primary)]" />
            <span className="font-caps text-xs tracking-widest text-[var(--primary)] font-semibold">
              TECHNICAL MATRIX
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-main)] mb-3 tracking-tight">
            Capabilities & Technical Stack
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Technologies and frameworks inferred from GitHub repositories and active projects.
          </p>
        </div>

        {/* Action / Search Bar */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="w-full md:w-60 relative">
            <input
              type="text"
              placeholder="Filter skills (e.g. React, C++)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-full glass-panel border border-[var(--border-color)] text-xs text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
          </div>

          {isOwnerMode && (
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="btn-icon text-[var(--text-muted)] hover:text-[var(--primary)] shrink-0"
              title="Sync Tech Stack from GitHub"
            >
              <Github size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Extracted GitHub & Project Technologies Banner */}
      {computedTechnologies && computedTechnologies.length > 0 && (
        <div className="glass-panel p-5 md:p-6 rounded-3xl border border-[var(--border-color)] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-caps text-[10px] text-[var(--primary)] tracking-wider uppercase font-bold flex items-center gap-1.5">
              <Zap size={13} className="text-[var(--primary)]" />
              <span>Core Technologies Inferred from GitHub & Stack ({computedTechnologies.length})</span>
            </span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {computedTechnologies.map((tech, i) => (
                <span 
                  key={i} 
                  className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-surface-high)] text-xs font-mono text-[var(--text-main)] border border-white/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {isOwnerMode && (
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="btn-secondary text-xs !py-1.5 !px-3.5 shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>Update from GitHub</span>
            </button>
          )}
        </div>
      )}

      {/* Skills Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skills.map((category, catIdx) => {
          const filteredItems = category.skills.filter(s => 
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery && filteredItems.length === 0) return null;

          return (
            <div
              key={catIdx}
              className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--border-color)] hover:border-[var(--border-highlight)] transition-all duration-300 relative group overflow-hidden"
            >
              {/* Top Category Title */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                    {getCategoryIcon(category.category)}
                  </div>
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-bold text-[var(--text-main)]">
                      {category.category}
                    </h3>
                    <span className="font-caps text-[10px] text-[var(--primary)] tracking-wider font-semibold">
                      {filteredItems.length} TECHNOLOGIES
                    </span>
                  </div>
                </div>
              </div>

              {category.description && (
                <p className="font-sans text-xs text-[var(--text-dim)] mb-6 leading-relaxed">
                  {category.description}
                </p>
              )}

              {/* Skill Bars */}
              <div className="space-y-3.5">
                {filteredItems.map((skill, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center gap-1.5 font-mono text-[var(--text-main)]">
                        {skill.highlight && (
                          <Zap size={11} className="text-[var(--primary)]" />
                        )}
                        {skill.name}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-dim)]">
                        {skill.level || 90}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[var(--bg-surface-high)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--primary-container)] to-[var(--primary)] rounded-full transition-all duration-700 group-hover:shadow-[0_0_10px_var(--primary-glow)]"
                        style={{ width: `${skill.level || 90}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
