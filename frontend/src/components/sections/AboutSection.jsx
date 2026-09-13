import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  Quote, 
  Sparkles, 
  Target, 
  Layers, 
  Cpu, 
  BookOpen,
  Code2,
  Users 
} from 'lucide-react';

export default function AboutSection() {
  const { portfolio } = usePortfolio();
  const { personal, testimonials } = portfolio;

  return (
    <section id="about" className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full relative">
      
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="w-5 h-px bg-[var(--primary)]" />
          <span className="font-caps text-xs tracking-widest text-[var(--primary)] font-semibold">
            DEVELOPER MANIFESTO
          </span>
        </div>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-main)] mb-3 tracking-tight">
          How I Learn & Build
        </h2>
        <p className="font-sans text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
          My engineering mindset is rooted in curiosity, consistent problem solving, and learning by building real-world projects.
        </p>
      </div>

      {/* Bento Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        
        {/* Pillar 1 */}
        <div className="md:col-span-4 glass-panel p-6 md:p-7 rounded-3xl border border-[var(--border-color)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
              <BookOpen size={18} />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
              Continuous Learning
            </h3>
            <p className="font-sans text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Actively mastering modern software engineering patterns, generative AI toolkits, and computer science fundamentals beyond the classroom.
            </p>
          </div>
          <span className="font-caps text-[9px] text-[var(--text-dim)] tracking-wider uppercase mt-5 font-semibold">
            PILLAR 01 &bull; CURIOSITY
          </span>
        </div>

        {/* Pillar 2 */}
        <div className="md:col-span-4 glass-panel p-6 md:p-7 rounded-3xl border border-[var(--border-color)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
              <Code2 size={18} />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
              Hands-On Building
            </h3>
            <p className="font-sans text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Believing that the best way to understand an API, database, or ML model is to design, write, and deploy working applications end-to-end.
            </p>
          </div>
          <span className="font-caps text-[9px] text-[var(--text-dim)] tracking-wider uppercase mt-5 font-semibold">
            PILLAR 02 &bull; EXECUTION
          </span>
        </div>

        {/* Pillar 3 */}
        <div className="md:col-span-4 glass-panel p-6 md:p-7 rounded-3xl border border-[var(--border-color)] flex flex-col justify-between hover:border-[var(--primary)]/50 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] border border-[var(--primary)]/20">
              <Target size={18} />
            </div>
            <h3 className="font-display text-lg font-bold text-[var(--text-main)]">
              Core Problem Solving
            </h3>
            <p className="font-sans text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Practicing data structures and algorithms consistently on LeetCode to develop strong algorithmic intuition and write clean, optimal code.
            </p>
          </div>
          <span className="font-caps text-[9px] text-[var(--text-dim)] tracking-wider uppercase mt-5 font-semibold">
            PILLAR 03 &bull; RIGOR
          </span>
        </div>

      </div>

      {/* Target Roles for Student */}
      {personal.openToRoles && personal.openToRoles.length > 0 && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-[var(--border-color)] mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 mb-5">
            <div>
              <span className="font-caps text-[10px] text-[var(--primary)] tracking-wider uppercase block mb-1 font-bold">
                INTERNSHIP OPPORTUNITIES
              </span>
              <h3 className="font-display text-lg md:text-xl font-bold text-[var(--text-main)]">
                Roles & Positions I am Seeking
              </h3>
            </div>
            <span className="font-sans text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 font-semibold">
              Available for Summer / Fall Internships
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {personal.openToRoles.map((role, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-surface-high)] text-[var(--text-main)] text-xs font-sans font-medium border border-[var(--border-color)] hover:border-[var(--primary)] transition-colors"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Peer & Faculty Endorsements */}
      {testimonials && testimonials.length > 0 && (
        <div>
          <h3 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase mb-5 flex items-center gap-2 font-semibold">
            <Users size={15} className="text-[var(--primary)]" />
            Mentor & Teammate Reviews
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] relative flex flex-col justify-between hover:border-[var(--primary)]/40 transition-all"
              >
                <Quote size={20} className="text-[var(--primary)]/30 mb-2.5" />
                <p className="font-sans text-xs md:text-sm text-[var(--text-muted)] italic leading-relaxed mb-4">
                  "{item.quote}"
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-[var(--border-color)]">
                  {item.avatar && (
                    <img
                      src={item.avatar}
                      alt={item.author}
                      className="w-9 h-9 rounded-full object-cover border border-[var(--primary)]/30"
                    />
                  )}
                  <div>
                    <h4 className="font-sans text-xs font-bold text-[var(--text-main)]">
                      {item.author}
                    </h4>
                    <span className="text-[10px] text-[var(--text-dim)] font-mono">
                      {item.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
