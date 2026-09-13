import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Github } from '../common/Icons';
import { 
  X, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  MonitorPlay,
  Code2,
  Calendar,
  Tag
} from 'lucide-react';

export default function ProjectModal() {
  const { portfolio, selectedProject, setSelectedProject } = usePortfolio();
  const [showLivePreview, setShowLivePreview] = useState(false);

  if (!selectedProject) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0">
          <button
            onClick={() => setSelectedProject(null)}
            className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Projects</span>
          </button>

          <div className="flex items-center gap-2.5">
            {selectedProject.liveUrl && selectedProject.liveUrl !== '#' && (
              <a
                href={selectedProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs !py-1.5 !px-3.5 flex items-center gap-1.5 font-bold"
              >
                <span>Live Demo</span>
                <ExternalLink size={12} />
              </a>
            )}

            {selectedProject.githubUrl && selectedProject.githubUrl !== '#' && (
              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5"
                title="View Source on GitHub"
              >
                <Github size={13} />
                <span>Code</span>
              </a>
            )}

            <button
              onClick={() => setSelectedProject(null)}
              className="p-1.5 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors ml-1"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* Title & Category Bar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-caps text-[10px] text-[var(--primary)] px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 font-bold">
                {selectedProject.category?.toUpperCase() || 'ENGINEERING'}
              </span>
              {selectedProject.year && (
                <span className="text-xs font-mono text-[var(--text-dim)] flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{selectedProject.year}</span>
                </span>
              )}
              {selectedProject.client && (
                <span className="text-xs text-[var(--text-dim)] font-mono">
                  &bull; {selectedProject.client}
                </span>
              )}
            </div>

            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
              {selectedProject.title}
            </h2>
            {selectedProject.subtitle && (
              <p className="font-sans text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
                {selectedProject.subtitle}
              </p>
            )}
          </div>

          {/* Hero Media / Live Frame */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface)]">
            {showLivePreview && selectedProject.liveUrl && selectedProject.liveUrl !== '#' ? (
              <div className="w-full h-[360px] bg-black">
                <iframe 
                  src={selectedProject.liveUrl} 
                  title={selectedProject.title} 
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="relative h-[220px] md:h-[280px] group">
                <img 
                  src={selectedProject.image || selectedProject.thumbnail} 
                  alt={selectedProject.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-surface-low)] via-transparent to-transparent opacity-85" />
                
                {selectedProject.liveUrl && selectedProject.liveUrl !== '#' && (
                  <button
                    onClick={() => setShowLivePreview(true)}
                    className="absolute bottom-4 right-4 btn-secondary !py-2 !px-4 text-xs shadow-xl flex items-center gap-2 bg-black/60 backdrop-blur-md"
                  >
                    <MonitorPlay size={14} />
                    <span>Launch Embedded Preview</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Metrics Grid */}
          {selectedProject.metrics && selectedProject.metrics.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedProject.metrics.map((metric, i) => (
                <div key={i} className="glass-panel p-3.5 rounded-2xl border border-[var(--border-color)]">
                  <span className="font-display text-lg font-extrabold text-[var(--primary)] block">
                    {metric.value}
                  </span>
                  <span className="font-caps text-[9px] tracking-wider text-[var(--text-dim)] uppercase mt-0.5 block font-medium">
                    {metric.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Bento Concept & Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Concept Column */}
            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
              <h3 className="font-display text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Sparkles size={15} className="text-[var(--primary)]" />
                <span>Concept & Specifications</span>
              </h3>
              <p className="font-sans text-xs text-[var(--text-muted)] leading-relaxed">
                {selectedProject.concept || selectedProject.description}
              </p>
              {selectedProject.challenge && (
                <div className="pt-2 border-t border-white/5">
                  <h4 className="font-caps text-[10px] text-[var(--primary)] tracking-wider uppercase mb-1 font-bold">
                    Technical Solution
                  </h4>
                  <p className="font-sans text-xs text-[var(--text-dim)] leading-relaxed">
                    {selectedProject.challenge}
                  </p>
                </div>
              )}
            </div>

            {/* Architecture Column */}
            <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
              <h3 className="font-display text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                <Layers size={15} className="text-[var(--primary)]" />
                <span>Architecture Highlights</span>
              </h3>
              
              <ul className="space-y-2">
                {(selectedProject.architecture || [
                  "Designed with clean decoupled micro-architectures",
                  "Optimized for high-concurrency and fast load speeds",
                  "Automated validation and responsive interface"
                ]).map((arch, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{arch}</span>
                  </li>
                ))}
              </ul>

              {/* Tech Stack Chips */}
              {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="font-caps text-[9px] text-[var(--text-dim)] uppercase block mb-1.5 font-semibold">
                    Technologies Deployed
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.techStack.map((tech, i) => (
                      <span 
                        key={i} 
                        className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)] text-[var(--text-main)] text-[10px] font-mono border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Action Footer */}
        <div className="flex items-center justify-between px-6 md:px-8 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-surface)] shrink-0">
          <span className="font-mono text-[11px] text-[var(--text-dim)]">
            {portfolio.personal.name} &bull; Case Study
          </span>
          <button
            onClick={() => setSelectedProject(null)}
            className="btn-secondary text-xs !py-1.5 !px-4"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
