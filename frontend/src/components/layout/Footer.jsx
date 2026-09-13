import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Download, RotateCcw } from 'lucide-react';

export default function Footer() {
  const { portfolio, exportJSON, resetToDefault, isOwnerMode } = usePortfolio();
  const { personal, socials } = portfolio;

  return (
    <footer className="w-full py-16 bg-[var(--bg-primary)] border-t border-[var(--border-color)] relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand & Tagline */}
        <div className="text-center md:text-left">
          <div className="font-display text-xl md:text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            PORTFOLIO
          </div>
          <p className="text-xs text-[var(--text-dim)] mt-1 font-sans">
            Engineered by {personal.name} &bull; 2025
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 font-sans text-xs font-medium text-[var(--text-muted)]">
          {socials.github && (
            <a href={socials.github} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
              GitHub
            </a>
          )}
          {socials.linkedin && (
            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
              LinkedIn
            </a>
          )}
          {socials.twitter && (
            <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
              X (Twitter)
            </a>
          )}
          {socials.behance && (
            <a href={socials.behance} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
              Behance
            </a>
          )}
          {socials.leetcode && (
            <a href={socials.leetcode} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--primary)] transition-colors">
              LeetCode
            </a>
          )}
        </div>

        {/* Actions & Backup (Owner Mode Only) */}
        {isOwnerMode && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={exportJSON}
              className="btn-secondary !py-1.5 !px-3 text-xs"
              title="Download JSON Portfolio Backup"
              data-cursor-hover
            >
              <Download size={12} />
              <span>Backup JSON</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm("Reset portfolio to default clean settings?")) {
                  resetToDefault();
                }
              }}
              className="btn-icon text-[var(--text-dim)] hover:text-rose-400"
              title="Reset Portfolio Defaults"
              data-cursor-hover
            >
              <RotateCcw size={13} />
            </button>
          </div>
        )}

      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-8 pt-6 border-t border-[var(--border-color)]/30 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-[var(--text-dim)] gap-3">
        <span>&copy; 2025 {personal.name}. All Rights Reserved.</span>
        <span>Built with React 19 &bull; Three.js &bull; Tailwind CSS</span>
      </div>
    </footer>
  );
}
