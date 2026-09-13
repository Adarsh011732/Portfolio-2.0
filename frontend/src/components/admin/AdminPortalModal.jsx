import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { createProjectFromInput } from '../../services/projectService';
import { isGoogleDriveUrl } from '../../utils/googleDrive';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Layers, 
  User, 
  Globe, 
  Download, 
  Upload, 
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  Award,
  GraduationCap,
  Link as LinkIcon,
  Check,
  ExternalLink,
  Edit3
} from 'lucide-react';

export default function AdminPortalModal() {
  const { 
    portfolio, 
    isAdminOpen, 
    setIsAdminOpen, 
    addProject, 
    deleteProject, 
    updatePersonal, 
    updateSocials,
    addEducation,
    deleteEducation,
    addCertification,
    updateCertification,
    deleteCertification,
    exportJSON,
    importJSON,
    isOwnerMode,
    showToast 
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('socials'); // 'socials' | 'add-project' | 'manage-projects' | 'education' | 'certifications' | 'personal' | 'backup'
  const [isUnlocked, setIsUnlocked] = useState(true);

  const [eduForm, setEduForm] = useState({
    degree: '',
    institution: '',
    year: '',
    honors: ''
  });
  
  const [certForm, setCertForm] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialUrl: ''
  });

  const [editingCertId, setEditingCertId] = useState(null);
  const [editingCertLink, setEditingCertLink] = useState('');
  
  const [projectForm, setProjectForm] = useState({
    title: '',
    subtitle: '',
    client: 'GitHub / Independent Project',
    category: 'ai',
    year: new Date().getFullYear().toString(),
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    liveUrl: '',
    githubUrl: '',
    techStack: 'Python, PyTorch, Transformers',
    description: ''
  });

  const [personalForm, setPersonalForm] = useState(portfolio.personal);
  const [socialsForm, setSocialsForm] = useState(portfolio.socials);

  if (!isAdminOpen || !isOwnerMode) return null;

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      showToast('Please provide project title and description', 'error');
      return;
    }
    try {
      const project = createProjectFromInput(projectForm);
      addProject(project);
      setProjectForm({
        title: '',
        subtitle: '',
        client: 'GitHub / Independent Project',
        category: 'ai',
        year: new Date().getFullYear().toString(),
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
        liveUrl: '',
        githubUrl: '',
        techStack: 'Python, PyTorch, Transformers',
        description: ''
      });
      setActiveTab('manage-projects');
    } catch (err) {
      showToast(err.message || 'Failed to create project', 'error');
    }
  };

  const handleAddCertification = (e) => {
    e.preventDefault();
    if (!certForm.name || !certForm.issuer) {
      showToast('Please fill in certificate name and issuer', 'error');
      return;
    }
    addCertification({
      id: `cert-${Date.now()}`,
      name: certForm.name.trim(),
      issuer: certForm.issuer.trim(),
      date: certForm.date.trim(),
      credentialUrl: certForm.credentialUrl.trim()
    });
    setCertForm({ name: '', issuer: '', date: '', credentialUrl: '' });
  };

  const handleCreateEducation = (e) => {
    e.preventDefault();
    if (!eduForm.degree.trim()) {
      showToast('Please provide degree / program title', 'error');
      return;
    }
    addEducation({
      degree: eduForm.degree.trim(),
      institution: eduForm.institution.trim(),
      year: eduForm.year.trim(),
      honors: eduForm.honors.trim()
    });
    setEduForm({ degree: '', institution: '', year: '', honors: '' });
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    updatePersonal(personalForm);
  };

  const handleSaveSocials = (e) => {
    e.preventDefault();
    updateSocials(socialsForm);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importJSON(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <span>Owner Portal & Social Link Manager</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 font-normal">
                  Owner Active
                </span>
              </h2>
              <p className="text-xs text-[var(--text-dim)] font-sans">
                Manage your real projects, social media handles, and personal profile details.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 px-6 md:px-8 pt-3 pb-2 border-b border-[var(--border-color)] bg-[var(--bg-surface)]/50">
          <button
            onClick={() => setActiveTab('socials')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'socials' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Globe size={13} />
            <span>Social & Platform Links</span>
          </button>

          <button
            onClick={() => setActiveTab('add-project')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'add-project' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Plus size={13} />
            <span>Add Project</span>
          </button>

          <button
            onClick={() => setActiveTab('manage-projects')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'manage-projects' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Layers size={13} />
            <span>Projects ({portfolio.projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('education')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'education' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <GraduationCap size={13} />
            <span>Education ({(portfolio.education || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('certifications')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'certifications' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Award size={13} />
            <span>Certificates ({(portfolio.certifications || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('personal')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'personal' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <User size={13} />
            <span>Personal Info</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`font-sans text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ml-auto ${
              activeTab === 'backup' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <Download size={13} />
            <span>Export / Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: SOCIAL LINKS */}
          {activeTab === 'socials' && (
            <form onSubmit={handleSaveSocials} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-xs text-[var(--text-muted)] space-y-1">
                <span className="font-bold text-[var(--primary)] block">Verified Social & Platform Handles</span>
                <p>
                  These links are used to display your live profiles in the hero bar, DSA matrix, and footer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'github', label: 'GitHub Profile URL', placeholder: 'https://github.com/AdarshSingh001' },
                  { id: 'codolio', label: 'Codolio Profile URL', placeholder: 'https://codolio.com/profile/01AdarshSingh' },
                  { id: 'leetcode', label: 'LeetCode Profile URL', placeholder: 'https://leetcode.com/u/Adarsh_Singh_001/' },
                  { id: 'codeforces', label: 'Codeforces Profile URL', placeholder: 'https://codeforces.com/profile/handle' },
                  { id: 'linkedin', label: 'LinkedIn Profile URL', placeholder: 'https://linkedin.com/in/username' },
                  { id: 'email', label: 'Contact Email', placeholder: 'adarshsingh98635@gmail.com' }
                ].map(field => (
                  <div key={field.id}>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] uppercase block mb-1 font-bold">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={socialsForm[field.id] || ''}
                      onChange={(e) => setSocialsForm({ ...socialsForm, [field.id]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-xs font-bold !py-3 flex items-center justify-center gap-2 mt-4"
              >
                <Save size={15} />
                <span>Save Social Links</span>
              </button>
            </form>
          )}

          {/* TAB 2: ADD PROJECT */}
          {activeTab === 'add-project' && (
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dynamic Time Warping Audio Comparison"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                  />
                </div>

                <div>
                  <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Category *</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                  >
                    <option value="ai">AI / ML Project</option>
                    <option value="fullstack">Fullstack Web App</option>
                    <option value="motion">Interactive & 3D</option>
                    <option value="tools">Developer Tools</option>
                  </select>
                </div>

                <div>
                  <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Live Website / Demo URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={projectForm.liveUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                  />
                </div>

                <div>
                  <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">GitHub Repository URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/AdarshSingh001/..."
                    value={projectForm.githubUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Technologies Used (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Python, PyTorch, Transformers, Scikit-Learn"
                  value={projectForm.techStack}
                  onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                />
              </div>

              <div>
                <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Project Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what the application does, problems it solves, and its technical architecture..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-xs font-bold !py-3 flex items-center justify-center gap-2"
              >
                <Plus size={15} />
                <span>Publish Project to Portfolio</span>
              </button>
            </form>
          )}

          {/* TAB 3: MANAGE PROJECTS */}
          {activeTab === 'manage-projects' && (
            <div className="space-y-3">
              {portfolio.projects.length > 0 ? (
                portfolio.projects.map(proj => (
                  <div
                    key={proj.id}
                    className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <img
                        src={proj.thumbnail || proj.image}
                        alt={proj.title}
                        className="w-14 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <h4 className="font-display text-sm font-bold text-[var(--text-main)] truncate">
                          {proj.title}
                        </h4>
                        <span className="text-[11px] font-mono text-[var(--primary)]">
                          {proj.category?.toUpperCase()} &bull; {proj.year}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/20 text-[var(--text-dim)] hover:text-rose-400 transition-colors shrink-0"
                      title="Delete Project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 glass-panel rounded-2xl border border-[var(--border-color)] text-xs text-[var(--text-dim)]">
                  No custom projects added yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CERTIFICATIONS — Manual Add */}
          {activeTab === 'certifications' && (
            <div className="space-y-5">
              {/* Add Certificate Form */}
              <form onSubmit={handleAddCertification} className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Award size={16} className="text-amber-400" />
                    <span>Add Verified Certificate / Google Drive Link</span>
                  </h4>
                  {isGoogleDriveUrl(certForm.credentialUrl) && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                      Google Drive Link
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Certificate Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Machine Learning Specialization"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Issuer / Platform *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. DeepLearning.AI / Coursera"
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Date / Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024 or June 2024"
                      value={certForm.date}
                      onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Google Drive / Credential URL</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/... or https://coursera.org/..."
                      value={certForm.credentialUrl}
                      onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary text-xs font-bold !py-3 flex items-center justify-center gap-2"
                >
                  <Plus size={15} />
                  <span>Add Certificate to Portfolio</span>
                </button>
              </form>

              {/* Existing Certificates */}
              <div className="space-y-2.5">
                <h4 className="font-caps text-[10px] text-[var(--text-dim)] uppercase font-bold">
                  Your Certificates ({(portfolio.certifications || []).length})
                </h4>
                {(portfolio.certifications || []).length > 0 ? (
                  (portfolio.certifications || []).map(cert => {
                    const isEditing = editingCertId === cert.id;
                    const certIsDrive = isGoogleDriveUrl(cert.credentialUrl);

                    return (
                      <div
                        key={cert.id}
                        className={`glass-panel p-4 rounded-2xl border transition-all ${
                          isEditing ? 'border-[var(--primary)]' : 'border-[var(--border-color)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="overflow-hidden min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-display text-sm font-bold text-[var(--text-main)] truncate">{cert.name}</h4>
                              {certIsDrive && (
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold shrink-0">
                                  Drive
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[var(--primary)]">
                              {cert.issuer}{cert.date ? ` • ${cert.date}` : ''}
                            </span>
                            {cert.credentialUrl && cert.credentialUrl !== '#' ? (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-[var(--text-dim)] hover:text-[var(--primary)] underline flex items-center gap-1 mt-0.5 font-mono truncate max-w-sm"
                              >
                                <span>{cert.credentialUrl}</span>
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                                No link attached
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingCertId(null);
                                } else {
                                  setEditingCertId(cert.id);
                                  setEditingCertLink(cert.credentialUrl || '');
                                }
                              }}
                              className={`p-2 rounded-xl border text-xs transition-colors ${
                                isEditing 
                                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)]' 
                                  : 'bg-[var(--bg-surface-high)] text-[var(--text-dim)] hover:text-[var(--text-main)] border-white/5'
                              }`}
                              title={isEditing ? "Close Link Editor" : "Edit Certificate Link"}
                            >
                              <Edit3 size={14} />
                            </button>

                            <button
                              onClick={() => deleteCertification(cert.id)}
                              className="p-2 rounded-xl hover:bg-rose-500/20 text-[var(--text-dim)] hover:text-rose-400 transition-colors"
                              title="Remove Certificate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Link Editor Form */}
                        {isEditing && (
                          <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center gap-2">
                            <div className="relative flex-1">
                              <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                              <input
                                type="url"
                                value={editingCertLink}
                                onChange={(e) => setEditingCertLink(e.target.value)}
                                placeholder="Paste Google Drive link: https://drive.google.com/file/d/..."
                                className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-main)] font-mono focus:outline-none focus:border-[var(--primary)]"
                                autoFocus
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                updateCertification(cert.id, { ...cert, credentialUrl: editingCertLink.trim() });
                                setEditingCertId(null);
                                showToast('Certificate link updated!');
                              }}
                              className="btn-primary text-xs !py-1.5 !px-3 font-bold flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>Save</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 glass-panel rounded-2xl border border-[var(--border-color)] text-xs text-[var(--text-dim)]">
                    No certificates added yet. Fill in the form above to add your first one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <form onSubmit={handleCreateEducation} className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
                <h3 className="font-display text-sm font-bold text-[var(--primary)] flex items-center gap-2">
                  <GraduationCap size={16} />
                  <span>Add Degree / Academic Qualification</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Degree / Qualification *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor of Technology in CSE"
                      value={eduForm.degree}
                      onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Institution / University</label>
                    <input
                      type="text"
                      placeholder="e.g. KIET Group of Institutions"
                      value={eduForm.institution}
                      onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Year / Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 2023 - 2027"
                      value={eduForm.year}
                      onChange={(e) => setEduForm({ ...eduForm, year: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Key Coursework / Honors</label>
                    <input
                      type="text"
                      placeholder="e.g. DSA, OS, DBMS, ML, CGPA: 8.5"
                      value={eduForm.honors}
                      onChange={(e) => setEduForm({ ...eduForm, honors: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary text-xs !py-2.5 !px-5 flex items-center gap-2 font-bold"
                >
                  <Plus size={14} />
                  <span>Add Education Entry</span>
                </button>
              </form>

              {/* Education List */}
              <div className="space-y-3">
                <h4 className="font-caps text-xs text-[var(--text-dim)] uppercase font-bold">
                  Current Education History ({(portfolio.education || []).length})
                </h4>

                {portfolio.education && portfolio.education.length > 0 ? (
                  portfolio.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] flex items-start justify-between gap-4 hover:border-[var(--primary)]/40 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-display text-sm font-bold text-[var(--text-main)]">
                            {edu.degree}
                          </h5>
                          {edu.year && (
                            <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                              {edu.year}
                            </span>
                          )}
                        </div>
                        {edu.institution && (
                          <p className="text-xs text-[var(--text-muted)] font-mono">
                            {edu.institution}
                          </p>
                        )}
                        {edu.honors && (
                          <p className="text-xs text-[var(--text-dim)] font-sans bg-[var(--bg-surface-high)]/60 px-2.5 py-1.5 rounded-lg mt-1.5">
                            {edu.honors}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEducation(idx)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-[var(--text-dim)] hover:text-rose-400 transition-colors shrink-0"
                        title="Remove Education Entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 glass-panel rounded-2xl border border-[var(--border-color)] text-xs text-[var(--text-dim)]">
                    No education entries added yet. Fill in the form above to add your degree.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSavePersonal} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Name</label>
                  <input
                    type="text"
                    value={personalForm.name}
                    onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                  />
                </div>

                <div>
                  <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Title / Role</label>
                  <input
                    type="text"
                    value={personalForm.title}
                    onChange={(e) => setPersonalForm({ ...personalForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Front Quote</label>
                <input
                  type="text"
                  value={personalForm.quote || ''}
                  onChange={(e) => setPersonalForm({ ...personalForm, quote: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                />
              </div>

              <div>
                <label className="font-caps text-[10px] text-[var(--text-muted)] block mb-1.5 font-bold">Bio</label>
                <textarea
                  rows={4}
                  value={personalForm.bio}
                  onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-xs font-bold !py-3 flex items-center justify-center gap-2"
              >
                <Save size={15} />
                <span>Save Profile Information</span>
              </button>
            </form>
          )}

          {/* TAB 5: BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-5">
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                <h3 className="font-display text-base font-bold text-[var(--text-main)]">
                  Export Portfolio Configuration
                </h3>
                <p className="text-xs text-[var(--text-dim)] font-sans">
                  Download a portable JSON backup of your verified projects, coding stats, and settings.
                </p>
                <button
                  onClick={exportJSON}
                  className="btn-primary text-xs !py-2 !px-4 flex items-center gap-2"
                >
                  <Download size={13} />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-3">
                <h3 className="font-display text-base font-bold text-[var(--text-main)]">
                  Import Portfolio Configuration
                </h3>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full btn-secondary text-xs">
                  <Upload size={13} />
                  <span>Select JSON File from Computer</span>
                  <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                </label>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
