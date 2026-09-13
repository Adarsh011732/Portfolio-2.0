import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Github } from '../common/Icons';
import { 
  Plus, 
  ExternalLink, 
  ArrowUpRight, 
  Sparkles,
  Layers,
  Code2,
  FolderPlus
} from 'lucide-react';

export default function ProjectsSection() {
  const { 
    portfolio, 
    activeCategory, 
    setActiveCategory, 
    setSelectedProject, 
    isOwnerMode,
    setIsAddProjectModalOpen,
    setIsGitHubModalOpen
  } = usePortfolio();

  const { projects, categories } = portfolio;

  const filteredProjects = projects.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <section id="projects" className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full relative">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-px bg-[var(--primary)]" />
            <span className="font-caps text-xs tracking-widest text-[var(--primary)] font-semibold">
              ENGINEERING WORKS
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-main)] mb-3 tracking-tight">
            Featured Projects ({projects.length})
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Real-world applications, tools, and open-source repositories with live demo links and GitHub codebases.
          </p>
        </div>

        {/* Action Buttons (Owner Mode Only) */}
        {isOwnerMode && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="btn-secondary text-xs !py-2.5 !px-4 flex items-center gap-2"
            >
              <Github size={15} />
              <span>Sync from GitHub</span>
            </button>

            <button
              onClick={() => setIsAddProjectModalOpen(true)}
              className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-2 font-bold"
            >
              <Plus size={15} />
              <span>Add Project +</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Pills (shown if projects exist) */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10 border-b border-[var(--border-color)] pb-5">
          {categories.map(cat => {
            const count = cat.id === 'all' 
              ? projects.length 
              : projects.filter(p => p.category === cat.id).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`font-sans text-xs font-semibold px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md shadow-[var(--primary)]/20'
                    : 'glass-panel text-[var(--text-dim)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeCategory === cat.id 
                    ? 'bg-black/20 text-[var(--on-primary)]' 
                    : 'bg-white/5 text-[var(--text-dim)]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Project Grid - Sleek Balanced Dimensions */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filteredProjects.map((project, index) => {
            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="project-card group relative rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface-low)] cursor-pointer transition-all duration-300 hover:border-[var(--primary)]/50 hover:shadow-xl hover:shadow-black/40 h-[300px] md:h-[320px] flex flex-col justify-between"
              >
                {/* Background Image */}
                <img
                  src={project.image || project.thumbnail}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Clean Dark Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/65 to-[var(--bg-primary)]/20 z-10 pointer-events-none" />

                {/* Top Meta Bar */}
                <div className="relative z-20 p-4 flex justify-between items-center">
                  <span className="font-caps text-[9px] font-bold text-[var(--primary)] bg-[var(--bg-primary)]/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-[var(--primary)]/25">
                    0{index + 1} &bull; {project.category?.toUpperCase() || 'PROJECT'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {project.githubUrl && project.githubUrl !== '#' && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl glass-panel border border-[var(--border-color)] text-[var(--text-main)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
                        title="GitHub Source"
                      >
                        <Github size={13} />
                      </a>
                    )}
                    {project.liveUrl && project.liveUrl !== '#' && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-xl glass-panel border border-[var(--border-color)] text-[var(--text-main)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 transition-colors"
                        title="Live Deployment"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Content Area */}
                <div className="relative z-20 p-5 pt-0 space-y-2.5">
                  <div>
                    {project.subtitle && (
                      <span className="font-caps text-[9px] tracking-wider text-[var(--text-dim)] block uppercase font-medium line-clamp-1 mb-0.5">
                        {project.subtitle}
                      </span>
                    )}
                    <h3 className="font-display text-base md:text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors leading-tight line-clamp-2">
                      {project.title}
                    </h3>
                  </div>

                  {/* Tech stack chips */}
                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 4).map((tech, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)]/90 backdrop-blur-sm text-[9px] font-mono text-[var(--text-muted)] border border-white/10"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[var(--bg-surface-high)]/90 text-[9px] font-mono text-[var(--text-dim)]">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  {/* View Details Hint */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-[var(--text-dim)] font-mono">
                    <span>Explore details</span>
                    <ArrowUpRight size={13} className="text-[var(--primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : projects.length > 0 ? (
        /* Projects exist, but active category has none */
        <div className="glass-panel p-10 rounded-3xl border border-[var(--border-color)] text-center max-w-md mx-auto space-y-3">
          <p className="text-sm text-[var(--text-main)] font-semibold">
            No projects found in this category
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            You have {projects.length} project{projects.length > 1 ? 's' : ''} in total across all categories.
          </p>
          <button
            onClick={() => setActiveCategory('all')}
            className="btn-secondary text-xs !py-2 !px-4 mt-2"
          >
            Show All Projects ({projects.length})
          </button>
        </div>
      ) : (
        /* Zero Fake Projects - Clean Empty State */
        <div className="glass-panel p-10 md:p-16 rounded-3xl border border-[var(--border-color)] text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto border border-[var(--primary)]/20">
            <FolderPlus size={26} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-[var(--text-main)] mb-1">
              {isOwnerMode ? "No Projects Added Yet" : "Projects Showcase"}
            </h3>
            <p className="font-sans text-xs text-[var(--text-muted)] leading-relaxed">
              {isOwnerMode 
                ? "Add your real project links or sync public repositories from your GitHub account." 
                : "Curated software applications and research projects will be showcased here."}
            </p>
          </div>
          {isOwnerMode && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="btn-primary text-xs !py-2.5 !px-5 font-bold"
              >
                <Plus size={14} />
                <span>Add Real Project</span>
              </button>

              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="btn-secondary text-xs !py-2.5 !px-5"
              >
                <Github size={14} />
                <span>Sync GitHub Repos</span>
              </button>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
