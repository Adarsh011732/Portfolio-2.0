import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Github, Linkedin, Twitter, Terminal } from '../common/Icons';
import confetti from 'canvas-confetti';
import { 
  Mail, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  Calendar,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function ContactSection() {
  const { portfolio, showToast } = usePortfolio();
  const { personal, socials } = portfolio;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    if (personal.email) {
      navigator.clipboard.writeText(personal.email);
      setCopiedEmail(true);
      showToast("Email copied to clipboard!");
      setTimeout(() => setCopiedEmail(false), 3000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.7 } });
      showToast(`Thank you, ${formData.name}! Your message has been sent.`);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 800);
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full relative">
      
      {/* Section Header */}
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-2.5">
          <span className="w-5 h-px bg-[var(--primary)]" />
          <span className="font-caps text-xs tracking-widest text-[var(--primary)] font-semibold">
            GET IN TOUCH
          </span>
          <span className="w-5 h-px bg-[var(--primary)]" />
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-main)] mb-3 tracking-tight">
          Initiate an Inquiry
        </h2>
        <p className="font-sans text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
          Available for staff-level engineering leadership, high-stakes architecture reviews, and venture advisories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Contact Channels (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Direct Email Card */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--border-color)] space-y-5">
            <div>
              <span className="font-caps text-[10px] text-[var(--primary)] tracking-wider uppercase block mb-1 font-bold">
                DIRECT INBOX
              </span>
              <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
                Email Communication Channel
              </h3>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)]">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Mail size={16} className="text-[var(--primary)] shrink-0" />
                <span className="font-mono text-xs text-[var(--text-main)] truncate">
                  {personal.email || 'contact@portfolio.dev'}
                </span>
              </div>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 rounded-xl hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--primary)] transition-colors shrink-0"
                title="Copy Email Address"
                data-cursor-hover
              >
                {copiedEmail ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--text-dim)] font-mono">
              <Clock size={13} className="text-[var(--primary)]" />
              <span>Response Time: &lt; 4 Hours</span>
            </div>
          </div>

          {/* Social Profiles Grid */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--border-color)]">
            <span className="font-caps text-[10px] text-[var(--text-dim)] tracking-wider uppercase block mb-4 font-bold">
              PROFILES & PROFESSIONAL NETWORKS
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {socials.github && (
                <a
                  href={socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all group font-sans text-xs font-medium"
                  data-cursor-hover
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </a>
              )}

              {socials.linkedin && (
                <a
                  href={socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all group font-sans text-xs font-medium"
                  data-cursor-hover
                >
                  <Linkedin size={16} />
                  <span>LinkedIn</span>
                </a>
              )}

              {socials.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all group font-sans text-xs font-medium"
                  data-cursor-hover
                >
                  <Twitter size={16} />
                  <span>X / Twitter</span>
                </a>
              )}

              {socials.leetcode && (
                <a
                  href={socials.leetcode}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all group font-sans text-xs font-medium"
                  data-cursor-hover
                >
                  <Terminal size={16} />
                  <span>LeetCode</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Interactive Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="glass-panel p-6 md:p-10 rounded-3xl border border-[var(--border-color)] space-y-5 shadow-2xl relative overflow-hidden"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-[var(--text-main)] mb-1">
                Send a Message
              </h3>
              <p className="font-sans text-xs text-[var(--text-dim)]">
                Detail your project requirements, team composition, or role expectations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-caps text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5 font-bold">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              <div>
                <label className="font-caps text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5 font-bold">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="elena@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="font-caps text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5 font-bold">
                Subject / Topic
              </label>
              <input
                type="text"
                placeholder="e.g. Lead AI Architecture / Technical Advisory"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div>
              <label className="font-caps text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5 font-bold">
                Message & Scope *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe your technical roadmap, key challenges, or hiring criteria..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary !py-3.5 text-xs font-bold"
              data-cursor-hover
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-[var(--on-primary)] border-t-transparent animate-spin" />
                  <span>Transmitting Message...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Transmit Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
