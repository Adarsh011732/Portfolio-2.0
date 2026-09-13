import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  X, 
  Plus, 
  FolderPlus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  Tag, 
  Code2, 
  Link as LinkIcon, 
  Image as ImageIcon,
  CheckCircle2,
  List
} from 'lucide-react';
import { Github } from '../common/Icons';

const PRESET_IMAGES = [
  { label: 'Purple Fluid', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Cyber Dark', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Neural AI', url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Abstract Blue', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80' }
];

export default function AddProjectModal() {
  const { 
    portfolio, 
    addProject, 
    deleteProject, 
    isAddProjectModalOpen, 
    setIsAddProjectModalOpen,
    showToast 
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage'

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('ai');
  const [description, setDescription] = useState('');
  const [challenge, setChallenge] = useState('');
  const [techStack, setTechStack] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [architectureLines, setArchitectureLines] = useState('');

  if (!isAddProjectModalOpen) return null;

  const handleClose = () => {
    setIsAddProjectModalOpen(false);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a project title', 'error');
      return;
    }

    const techArray = techStack
      ? techStack.split(',').map(t => t.trim()).filter(Boolean)
      : ['React', 'JavaScript'];

    const archArray = architectureLines
      ? architectureLines.split('\n').map(a => a.trim()).filter(Boolean)
      : [
          'Engineered with modular, decoupled architecture',
          'Optimized for fast rendering and high responsiveness',
          'Production-ready code with automated verification'
        ];

    const newProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Verified Software Project',
      category: category || 'ai',
      client: 'Independent Project',
      year: new Date().getFullYear().toString(),
      featured: true,
      image: imageUrl || PRESET_IMAGES[0].url,
      thumbnail: imageUrl || PRESET_IMAGES[0].url,
      liveUrl: liveUrl.trim() || '#',
      githubUrl: githubUrl.trim() || '#',
      techStack: techArray,
      description: description.trim() || 'Custom engineered software application.',
      concept: description.trim() || 'Custom engineered software application.',
      challenge: challenge.trim() || 'Designed and developed to specification.',
      architecture: archArray,
      metrics: [
        { label: 'Status', value: 'Production' },
        { label: 'Verified', value: '100%' }
      ]
    };

    addProject(newProject);

    // Reset Form
    setTitle('');
    setSubtitle('');
    setDescription('');
    setChallenge('');
    setTechStack('');
    setGithubUrl('');
    setLiveUrl('');
    setArchitectureLines('');

    setActiveTab('manage');
  };

  const projects = portfolio.projects || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <FolderPlus size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
                  Add Real Project
                </h2>
                <span className="text-[10px] font-mono font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                  PORTFOLIO
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Create and publish a real project card with live links, tech stack, and case study details.
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

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 md:px-8 py-3 bg-[var(--bg-surface-high)]/40 border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('add')}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'add'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Plus size={14} />
            <span>New Project Form</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ml-auto ${
              activeTab === 'manage'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <List size={14} />
            <span>Your Projects ({projects.length})</span>
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: ADD PROJECT FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleCreateProject} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Project Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. NEUROFLOW AI or DISTRIBUTED CACHE SYSTEM"
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-display"
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Tagline / One-Line Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. High-throughput speech recognition pipeline with PyTorch & ONNX"
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-sans"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="ai">AI & Machine Learning</option>
                    <option value="fullstack">Fullstack Web Application</option>
                    <option value="tools">Developer Tools & Systems</option>
                    <option value="motion">Interactive & 3D Web</option>
                  </select>
                </div>

                {/* Tech Stack */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Tech Stack (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="e.g. Python, PyTorch, React, FastAPI, Docker"
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  />
                </div>

                {/* GitHub Repository URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    GitHub Code Repository URL
                  </label>
                  <div className="relative">
                    <Github size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/Adarsh011732/my-project"
                      className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                    />
                  </div>
                </div>

                {/* Live Demo URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Live Demo / Web Deployment URL
                  </label>
                  <div className="relative">
                    <ExternalLink size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      placeholder="https://my-app.vercel.app"
                      className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                    />
                  </div>
                </div>

                {/* Concept & Description */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Concept & Project Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the architectural concept, purpose, and key features of this project..."
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl p-3.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-sans"
                  />
                </div>

                {/* Technical Challenge */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Core Technical Challenge Solved
                  </label>
                  <input
                    type="text"
                    value={challenge}
                    onChange={(e) => setChallenge(e.target.value)}
                    placeholder="e.g. Handled async WebSocket streaming with backpressure control under 10k requests/sec."
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-sans"
                  />
                </div>

                {/* Banner Thumbnail Selection */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                    Banner Background Image (Select Preset or Paste Custom URL)
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setImageUrl(img.url)}
                        className={`relative rounded-xl overflow-hidden h-16 border transition-all text-left group ${
                          imageUrl === img.url ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/40' : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-caps font-bold text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm truncate">
                          {img.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste custom image URL: https://..."
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono mt-2"
                  />
                </div>

              </div>

              <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
                <button
                  type="submit"
                  className="btn-primary text-xs !py-3 !px-7 font-bold flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20"
                >
                  <Sparkles size={15} />
                  <span>Publish & Add Project</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MANAGE PROJECTS */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-display font-bold text-base text-[var(--text-main)]">
                  Active Projects ({projects.length})
                </h3>
                <button
                  onClick={() => setActiveTab('add')}
                  className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Add Another Project</span>
                </button>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((proj, idx) => (
                    <div
                      key={proj.id || idx}
                      className="glass-panel p-4 md:p-5 rounded-2xl border border-[var(--border-color)] hover:border-[var(--primary)]/40 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 overflow-hidden">
                        <img 
                          src={proj.image || proj.thumbnail} 
                          alt={proj.title} 
                          className="w-14 h-14 object-cover rounded-xl border border-white/10 shrink-0" 
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-display font-bold text-xs md:text-sm text-[var(--text-main)] truncate">
                              {proj.title}
                            </h4>
                            <span className="text-[9px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20 uppercase shrink-0">
                              {proj.category || 'AI'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-dim)] truncate">
                            {proj.subtitle || proj.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {proj.githubUrl && proj.githubUrl !== '#' && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[var(--bg-surface-high)] hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] border border-white/5 transition-all text-xs"
                            title="GitHub Source"
                          >
                            <Github size={13} />
                          </a>
                        )}

                        {proj.liveUrl && proj.liveUrl !== '#' && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[var(--bg-surface-high)] hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] border border-white/5 transition-all text-xs"
                            title="Live Demo"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}

                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-10 rounded-2xl border border-[var(--border-color)] text-center text-xs text-[var(--text-dim)] space-y-3">
                  <p>No projects in your portfolio yet.</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="btn-primary text-xs !py-2 !px-4 inline-flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>Create Your First Project</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-8 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-dim)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Projects appear immediately in your Verified Projects section.</span>
          </span>
          <button
            onClick={handleClose}
            className="btn-secondary text-xs !py-1.5 !px-4"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
