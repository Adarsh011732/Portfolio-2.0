import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import ThreePrism from '../canvas/ThreePrism';
import { Github, Terminal } from '../common/Icons';
import { 
  ArrowDown, 
  Sparkles, 
  Upload, 
  Mail, 
  Quote, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  Code2 
} from 'lucide-react';

export default function HeroSection() {
  const { 
    portfolio, 
    dynamicStats, 
    isOwnerMode, 
    setIsResumeModalOpen, 
    setIsAddProjectModalOpen, 
    setIsGitHubModalOpen, 
    setIsLeetCodeModalOpen, 
    setIsAdminOpen 
  } = usePortfolio();
  
  const { personal, socials } = portfolio;

  const handleMetricClick = (statId) => {
    if (statId === 'projects') {
      const el = document.getElementById('projects');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (statId === 'coding') {
      const el = document.getElementById('coding-stats');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (statId === 'github' || statId === 'technologies') {
      const el = document.getElementById('skills');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center py-20 px-6 md:px-10 overflow-hidden">
      {/* Background 3D Prism Container (Original atmospheric aesthetic) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
        <ThreePrism />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center mt-4">
        
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-panel border border-[var(--border-color)] mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-caps text-[10px] tracking-wider text-[var(--text-muted)] font-medium">
            {personal.status || 'Actively Seeking Software Engineering Internships (2025/2026)'}
          </span>
        </div>

        {/* Candidate Name & Title Tag */}
        <div className="font-caps text-xs md:text-sm tracking-[0.2em] text-[var(--primary)] mb-2 font-semibold">
          {personal.name} &bull; {personal.title}
        </div>

        {/* Main Display Headline */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] tracking-tight text-[var(--text-main)] mb-4 max-w-4xl leading-[1.08]">
          {personal.headline || "TURNING IDEAS INTO REAL-WORLD CODE & INTELLIGENT SYSTEMS"}
        </h1>

        {/* Front Quote Card */}
        <div className="max-w-2xl mx-auto mb-4 p-3.5 md:p-4 rounded-2xl glass-panel border border-[var(--border-highlight)]/40 relative">
          <Quote size={15} className="text-[var(--primary)]/40 mb-1 mx-auto" />
          <p className="font-sans text-xs md:text-sm text-[var(--text-main)] italic font-medium leading-relaxed">
            "{personal.quote || "Driven by curiosity, powered by code. Building modern software at the intersection of AI, distributed systems, and clean web design."}"
          </p>
        </div>

        {/* Bio Narrative */}
        <p className="font-sans text-xs md:text-sm text-[var(--text-muted)] max-w-2xl mb-5 leading-relaxed">
          {personal.bio}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5">
          <button
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-xs !py-3 !px-6 font-bold cursor-pointer"
          >
            <span>Explore Projects ({portfolio.projects.length})</span>
            <ArrowDown size={14} />
          </button>

          {isOwnerMode ? (
            <>
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="btn-secondary text-xs !py-3 !px-5 flex items-center gap-2"
                title="Sync GitHub Repositories"
              >
                <Github size={14} className="text-[var(--primary)]" />
                <span>Sync GitHub</span>
              </button>

              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="btn-secondary text-xs !py-3 !px-5 flex items-center gap-2"
                title="Upload Resume to Auto-Extract Profile"
              >
                <Upload size={14} />
                <span>AI Resume Sync</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-xs !py-3 !px-6 font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>Get in Touch</span>
              <ArrowDown size={14} className="-rotate-90" />
            </button>
          )}
        </div>

        {/* Social Links Bar */}
        <div className="flex items-center gap-2.5 text-[var(--text-dim)] mb-6">
          {socials.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon"
              title="GitHub Profile"
            >
              <Github size={15} />
            </a>
          )}
          {socials.codolio && (
            <a
              href={socials.codolio}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon text-indigo-400 hover:text-[var(--primary)]"
              title="Codolio Aggregated Profile"
            >
              <Sparkles size={15} />
            </a>
          )}
          {socials.leetcode && (
            <a
              href={socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-icon text-amber-400"
              title="LeetCode Profile"
            >
              <Terminal size={15} />
            </a>
          )}
          {socials.email && (
            <a
              href={socials.email}
              className="btn-icon"
              title="Direct Email"
            >
              <Mail size={15} />
            </a>
          )}
        </div>

        {/* Dynamic Quantitative Metrics Grid (Zero Fake Data) */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
          {dynamicStats.map((stat, idx) => (
            <div 
              key={idx} 
              onClick={() => handleMetricClick(stat.id)}
              className="glass-panel p-3.5 md:p-4 rounded-2xl border border-[var(--border-color)] flex flex-col items-center justify-center hover:border-[var(--primary)]/60 hover:shadow-lg transition-all cursor-pointer group"
              title={`Click to connect or view ${stat.label}`}
            >
              <span className={`font-display text-xl md:text-3xl font-extrabold group-hover:scale-105 transition-transform ${stat.hasData ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] text-base md:text-xl'}`}>
                {stat.value}
              </span>
              <span className="font-caps text-[10px] tracking-wider text-[var(--text-dim)] mt-0.5 uppercase text-center font-medium">
                {stat.label}
              </span>
              {stat.change && (
                <span className={`text-[10px] mt-0.5 font-mono truncate max-w-full ${stat.hasData ? 'text-emerald-400' : 'text-[var(--primary)]'}`}>
                  {stat.change}
                </span>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Scroll Down Hint */}
      <div 
        onClick={() => document.getElementById('coding-stats')?.scrollIntoView({ behavior: 'smooth' })}
        className="mt-5 flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <span className="font-caps text-[9px] tracking-[0.2em] text-[var(--text-dim)] font-medium">SCROLL TO DISCOVER</span>
        <div className="w-px h-5 bg-gradient-to-b from-[var(--text-dim)] to-transparent" />
      </div>
    </section>
  );
}
