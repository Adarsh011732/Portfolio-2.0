import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  Sparkles, 
  Upload, 
  Sliders, 
  Menu, 
  X, 
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';

export default function Navbar() {
  const { 
    portfolio, 
    isOwnerMode,
    toggleOwnerMode,
    setIsResumeModalOpen, 
    setIsAdminOpen,
    setIsGitHubModalOpen,
    setIsLeetCodeModalOpen,
    setIsCertificateModalOpen 
  } = usePortfolio();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-[var(--border-color)] ${
        isScrolled 
          ? 'bg-[var(--bg-primary)]/90 backdrop-blur-xl py-3 shadow-xl shadow-black/20' 
          : 'bg-[var(--bg-primary)]/50 backdrop-blur-md py-4 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex justify-between items-center gap-4">
        {/* Brand Logo */}
        <button 
          onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex items-center gap-2.5 group shrink-0 cursor-pointer text-left"
        >
          <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse shrink-0" />
          <span className="font-display font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors whitespace-nowrap">
            {portfolio.personal.name.toUpperCase()}
          </span>
          <span className="text-[9px] font-mono font-bold text-[var(--primary)] px-2 py-0.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 hidden xl:inline-block shrink-0">
            STUDIO
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-caps tracking-wider text-[var(--text-dim)] font-medium whitespace-nowrap">
          <button onClick={() => document.getElementById('coding-stats')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors py-1 cursor-pointer">DSA & Coding</button>
          <button onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors py-1 cursor-pointer">Projects ({portfolio.projects.length})</button>
          <button onClick={() => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors py-1 cursor-pointer">Skills</button>
          <button onClick={() => document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors py-1 cursor-pointer">Education & Certs</button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors py-1 cursor-pointer">Manifesto</button>
          <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[var(--primary)] transition-colors py-1 cursor-pointer">Contact</button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Owner Mode Controls (Only visible in Owner Mode) */}
          {isOwnerMode && (
            <>
              {/* Sync GitHub */}
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="btn-icon text-[var(--text-muted)] hover:text-[var(--primary)]"
                title="Sync GitHub Repositories"
              >
                <Sparkles size={15} />
              </button>

              {/* Upload Resume Button (AI Resume Parsing) */}
              <button
                onClick={() => setIsResumeModalOpen(true)}
                className="btn-secondary text-xs !py-1.5 !px-3.5 hidden md:flex items-center gap-2 whitespace-nowrap"
                title="Upload Resume to Auto-Extract Profile"
              >
                <Upload size={13} />
                <span>AI Resume Sync</span>
              </button>

              {/* CMS / Admin Portal */}
              <button
                onClick={() => setIsAdminOpen(true)}
                className="btn-icon text-[var(--text-muted)] hover:text-[var(--primary)]"
                title="Owner Portal & Social Links"
              >
                <Sliders size={15} />
              </button>
            </>
          )}


          {/* Owner Mode Switch Toggle */}
          <button
            onClick={toggleOwnerMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-mono ${
              isOwnerMode 
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm' 
                : 'bg-[var(--bg-surface-high)] text-[var(--text-dim)] hover:text-[var(--text-main)] border-white/5'
            }`}
            title={isOwnerMode ? "Owner Mode Active — Click to switch to Visitor View" : "Click to switch to Owner Mode (Enables edit and sync options)"}
          >
            <Lock size={12} className={isOwnerMode ? "text-emerald-400" : "text-[var(--text-dim)]"} />
            <span className="text-[11px] font-semibold hidden sm:inline">
              {isOwnerMode ? 'Owner: ON' : 'Owner'}
            </span>
            {isOwnerMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          </button>

          {/* Inquire CTA Button */}
          <a
            href="#contact"
            className="btn-primary text-xs !py-1.5 !px-4 hidden sm:flex items-center gap-1.5 font-bold"
          >
            <span>Inquire</span>
            <ArrowRight size={13} />
          </a>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[var(--text-main)] hover:text-[var(--primary)] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[64px] bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-b border-[var(--border-color)] px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-2.5 font-sans text-sm font-medium text-[var(--text-muted)]">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('coding-stats')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 border-b border-[var(--border-color)] hover:text-[var(--primary)] text-left cursor-pointer"
            >
              DSA & Coding
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 border-b border-[var(--border-color)] hover:text-[var(--primary)] text-left cursor-pointer"
            >
              Projects ({portfolio.projects.length})
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 border-b border-[var(--border-color)] hover:text-[var(--primary)] text-left cursor-pointer"
            >
              Skills Matrix
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 border-b border-[var(--border-color)] hover:text-[var(--primary)] text-left cursor-pointer"
            >
              Education & Credentials
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 border-b border-[var(--border-color)] hover:text-[var(--primary)] text-left cursor-pointer"
            >
              Manifesto
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="py-1.5 border-b border-[var(--border-color)] hover:text-[var(--primary)] text-left cursor-pointer"
            >
              Contact & Inquiries
            </button>
          </nav>

          {/* Mobile Owner Mode Controls */}
          {isOwnerMode && (
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={() => {
                  setIsGitHubModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="btn-secondary !py-2 text-xs"
              >
                <Sparkles size={14} />
                <span>Sync GitHub</span>
              </button>

              <button
                onClick={() => {
                  setIsResumeModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="btn-primary !py-2 text-xs"
              >
                <Upload size={14} />
                <span>Sync Resume</span>
              </button>
            </div>
          )}


          {/* Owner Mode Toggle in Mobile Drawer */}
          <div className="pt-2 border-t border-[var(--border-color)] flex justify-between items-center text-xs font-mono">
            <span className="text-[var(--text-dim)]">Site View Mode:</span>
            <button
              onClick={() => {
                toggleOwnerMode();
                setIsMobileMenuOpen(false);
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold ${
                isOwnerMode 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                  : 'bg-[var(--bg-surface-high)] text-[var(--text-main)] border-white/10'
              }`}
            >
              <Lock size={12} />
              <span>{isOwnerMode ? 'Owner Mode (ON)' : 'Switch to Owner Mode'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
