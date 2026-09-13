import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { isGoogleDriveUrl, extractGoogleDriveId } from '../../utils/googleDrive';
import { 
  X, 
  Award, 
  UploadCloud, 
  FileText, 
  Check, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Sparkles, 
  Calendar,
  Link as LinkIcon,
  Tag,
  CheckCircle2,
  FolderOpen,
  Edit3,
  HelpCircle,
  Globe
} from 'lucide-react';

const PRESET_ISSUERS = [
  'DeepLearning.AI',
  'Coursera',
  'AWS / Amazon',
  'Google Cloud',
  'Meta',
  'Microsoft',
  'IBM',
  'NPTEL',
  'Stanford Online',
  'Udemy',
  'HackerRank',
  'LeetCode'
];

export default function CertificateModal() {
  const { 
    portfolio, 
    addCertification, 
    updateCertification,
    deleteCertification, 
    isCertificateModalOpen, 
    setIsCertificateModalOpen,
    isOwnerMode,
    showToast 
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState('drive'); // 'drive' | 'upload' | 'manage'
  
  // Form State
  const [certName, setCertName] = useState('');
  const [issuer, setIssuer] = useState('DeepLearning.AI');
  const [issueDate, setIssueDate] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [skills, setSkills] = useState('');
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  
  // Inline editing in manage tab
  const [editingCertId, setEditingCertId] = useState(null);
  const [editLinkValue, setEditLinkValue] = useState('');
  const [editNameValue, setEditNameValue] = useState('');
  const [editIssuerValue, setEditIssuerValue] = useState('');

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  if (!isCertificateModalOpen || !isOwnerMode) return null;

  const handleClose = () => {
    setIsCertificateModalOpen(false);
    setEditingCertId(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessingFile(true);

    // Auto-detect title and issuer from filename
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (!certName) {
      setCertName(cleanFileName);
    }

    const matchedIssuer = PRESET_ISSUERS.find(iss => 
      file.name.toLowerCase().includes(iss.toLowerCase().replace(/[^a-z]/g, ''))
    );
    if (matchedIssuer) {
      setIssuer(matchedIssuer);
    }

    // Generate local preview if image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result);
        setIsProcessingFile(false);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
      setIsProcessingFile(false);
    }

    showToast(`Attached file: ${file.name}`);
  };

  const handleSaveCertificate = (e) => {
    e.preventDefault();
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to add certificates', 'error');
      return;
    }
    if (!certName.trim()) {
      showToast('Please enter a certificate name', 'error');
      return;
    }

    const newCert = {
      id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: certName.trim(),
      issuer: issuer.trim() || 'Certificate Issuer',
      date: issueDate.trim() || new Date().getFullYear().toString(),
      credentialUrl: credentialUrl.trim(),
      skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      previewImage: filePreview || null
    };

    addCertification(newCert);

    // Reset Form
    setCertName('');
    setIssueDate('');
    setCredentialUrl('');
    setSkills('');
    setUploadedFileName('');
    setFilePreview(null);

    setActiveTab('manage');
  };

  const handleStartEdit = (cert) => {
    setEditingCertId(cert.id);
    setEditLinkValue(cert.credentialUrl || '');
    setEditNameValue(cert.name || '');
    setEditIssuerValue(cert.issuer || '');
  };

  const handleSaveInlineEdit = (certId) => {
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to modify certificates', 'error');
      return;
    }
    const cert = certificates.find(c => c.id === certId);
    if (!cert) return;

    const updated = {
      ...cert,
      name: editNameValue.trim() || cert.name,
      issuer: editIssuerValue.trim() || cert.issuer,
      credentialUrl: editLinkValue.trim()
    };

    updateCertification(certId, updated);
    setEditingCertId(null);
    showToast('Certificate link & details updated successfully!');
  };

  const certificates = portfolio.certifications || [];
  const isDrive = isGoogleDriveUrl(credentialUrl);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-[var(--text-main)]">
                  Certificate & Credential Manager
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  DRIVE & URLS
                </span>
              </div>
              <p className="text-xs text-[var(--text-dim)]">
                Add certificate links (Google Drive, Coursera, LeetCode, NPTEL), attach documents, or manage URLs.
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
        <div className="flex flex-wrap items-center gap-2 px-6 md:px-8 py-3 bg-[var(--bg-surface-high)]/40 border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab('drive')}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'drive'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <LinkIcon size={14} />
            <span>Add via Google Drive / URL</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <UploadCloud size={14} />
            <span>Upload File (PDF / Image)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ml-auto ${
              activeTab === 'manage'
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm'
                : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
            }`}
          >
            <FolderOpen size={14} />
            <span>Manage Certificates & Links ({certificates.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: ADD VIA GOOGLE DRIVE / URL OR TAB 2: UPLOAD FILE */}
          {(activeTab === 'drive' || activeTab === 'upload') && (
            <div className="space-y-5">
              
              {/* File Upload zone only in upload tab */}
              {activeTab === 'upload' && (
                <div className="glass-panel p-8 rounded-3xl border-2 border-dashed border-[var(--border-color)] hover:border-[var(--primary)] transition-all text-center space-y-4 relative group">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />

                  <div className="w-14 h-14 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto border border-[var(--primary)]/20 group-hover:scale-105 transition-transform">
                    <UploadCloud size={28} />
                  </div>

                  <div>
                    <h4 className="font-display font-bold text-sm text-[var(--text-main)] mb-1">
                      {uploadedFileName ? uploadedFileName : 'Drag & drop certificate document or click to browse'}
                    </h4>
                    <p className="text-xs text-[var(--text-dim)] font-mono">
                      Supports PDF, PNG, JPG, WEBP formats (Max 15MB)
                    </p>
                  </div>

                  {uploadedFileName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                      <Check size={13} />
                      <span>Document attached: {uploadedFileName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Main Certificate Form */}
              <form onSubmit={handleSaveCertificate} className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                    <Award size={16} className="text-amber-400" />
                    <span>{activeTab === 'drive' ? 'Manually Add Certificate with Google Drive Link' : 'Certificate Details'}</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowDriveGuide(!showDriveGuide)}
                    className="text-[11px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    <HelpCircle size={13} />
                    <span>{showDriveGuide ? 'Hide Drive Guide' : 'How to get Google Drive link?'}</span>
                  </button>
                </div>

                {/* Google Drive Guide Info Box */}
                {showDriveGuide && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--text-main)] space-y-2 animate-in fade-in duration-150">
                    <h5 className="font-bold text-amber-400 flex items-center gap-1.5 font-sans">
                      <Globe size={14} />
                      <span>How to share certificates from Google Drive:</span>
                    </h5>
                    <ol className="list-decimal list-inside space-y-1 text-[var(--text-muted)] font-mono text-[11px]">
                      <li>Upload your certificate PDF or image to <strong>Google Drive</strong>.</li>
                      <li>Right-click the file and select <strong>Share &gt; Share</strong>.</li>
                      <li>Under General access, change to <strong>"Anyone with the link"</strong> (Viewer).</li>
                      <li>Click <strong>Copy Link</strong> and paste it into the Certificate Link field below!</li>
                    </ol>
                  </div>
                )}

                {/* Quick Preset Issuers */}
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold mb-2">
                    Popular Issuing Organizations (Click to Select)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ISSUERS.map(iss => (
                      <button
                        type="button"
                        key={iss}
                        onClick={() => setIssuer(iss)}
                        className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                          issuer === iss
                            ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] font-bold'
                            : 'bg-[var(--bg-surface-high)] text-[var(--text-dim)] hover:text-[var(--text-main)] border-white/5'
                        }`}
                      >
                        {iss}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Certificate Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                      Certificate Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      placeholder="e.g. Deep Learning Specialization or AWS Certified Solutions Architect"
                      className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  {/* Issuing Organization */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                      Issuing Organization / Platform *
                    </label>
                    <input
                      type="text"
                      required
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      placeholder="e.g. DeepLearning.AI or Coursera"
                      className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                    />
                  </div>

                  {/* Issue Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                      Issue Date or Year
                    </label>
                    <input
                      type="text"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      placeholder="e.g. 2024 or Aug 2024"
                      className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                    />
                  </div>

                  {/* Credential URL / Google Drive link */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                        Certificate Link (Google Drive / Verification URL)
                      </label>
                      {isDrive && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>Google Drive Link Detected</span>
                        </span>
                      )}
                    </div>
                    
                    <div className="relative flex items-center">
                      <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                      <input
                        type="url"
                        value={credentialUrl}
                        onChange={(e) => setCredentialUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... or https://coursera.org/verify/..."
                        className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-9 pr-24 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                      />
                      {credentialUrl.trim() && (
                        <a
                          href={credentialUrl.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[var(--bg-surface-variant)] text-[var(--primary)] hover:text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-white/5"
                        >
                          <span>Test</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-dim)] font-mono">
                      Tip: You can paste any Google Drive shareable link, LeetCode badge link, Coursera URL, or direct PDF link.
                    </p>
                  </div>

                  {/* Skills Covered */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-[var(--text-dim)] uppercase">
                      Skills Covered (Comma-separated)
                    </label>
                    <div className="relative">
                      <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. Neural Networks, PyTorch, CNNs, Transformers, Algorithms"
                        className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="btn-primary text-xs !py-3 !px-6 font-bold flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20"
                  >
                    <Sparkles size={15} />
                    <span>Add Certificate to Portfolio</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MANAGE CERTIFICATES & INLINE LINK EDITOR */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--text-main)]">
                    All Certificates & Links ({certificates.length})
                  </h3>
                  <p className="text-xs text-[var(--text-dim)]">
                    Attach, update, or test Google Drive links for each certificate.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('drive')}
                  className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5 font-bold"
                >
                  <Plus size={13} />
                  <span>Add New Certificate</span>
                </button>
              </div>

              {certificates.length > 0 ? (
                <div className="space-y-3">
                  {certificates.map((cert) => {
                    const certIsDrive = isGoogleDriveUrl(cert.credentialUrl);
                    const isEditing = editingCertId === cert.id;

                    return (
                      <div
                        key={cert.id}
                        className={`glass-panel p-5 rounded-2xl border transition-all ${
                          isEditing 
                            ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/30 bg-[var(--bg-surface-high)]/50' 
                            : 'border-[var(--border-color)] hover:border-[var(--primary)]/40'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-sans font-bold text-sm text-[var(--text-main)]">
                                {cert.name}
                              </h4>
                              {certIsDrive && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                                  Google Drive
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-[var(--text-dim)] font-mono block">
                              {cert.issuer} {cert.date ? `• ${cert.date}` : ''}
                            </span>

                            {/* Current Link Preview */}
                            <div className="pt-1">
                              {cert.credentialUrl && cert.credentialUrl !== '#' ? (
                                <div className="flex items-center gap-2 text-xs font-mono">
                                  <LinkIcon size={12} className="text-[var(--primary)] shrink-0" />
                                  <span className="text-[var(--text-muted)] truncate max-w-xs md:max-w-md text-[11px]">
                                    {cert.credentialUrl}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] font-mono text-amber-400/90 flex items-center gap-1 font-medium">
                                  <span>⚠️ No certificate link attached yet</span>
                                </span>
                              )}
                            </div>

                            {cert.skills && cert.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {cert.skills.map((s, i) => (
                                  <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)] text-[var(--primary)] border border-white/5">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                            {cert.credentialUrl && cert.credentialUrl !== '#' && (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-[var(--bg-surface-high)] hover:bg-white/10 text-[var(--text-dim)] hover:text-[var(--text-main)] border border-white/5 transition-all flex items-center gap-1 text-xs"
                                title="Open Certificate Link"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}

                            <button
                              onClick={() => isEditing ? setEditingCertId(null) : handleStartEdit(cert)}
                              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                                isEditing
                                  ? 'bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] font-bold'
                                  : 'bg-[var(--bg-surface-high)] text-[var(--text-dim)] hover:text-[var(--primary)] border-white/5'
                              }`}
                              title={isEditing ? "Close Editor" : "Edit Certificate Link & Details"}
                            >
                              <Edit3 size={14} />
                              <span className="hidden md:inline">{isEditing ? 'Cancel' : (cert.credentialUrl ? 'Edit Link' : '+ Attach Link')}</span>
                            </button>

                            <button
                              onClick={() => {
                                if (!isOwnerMode) {
                                  showToast('🔒 Owner Mode required to delete certificates', 'error');
                                  return;
                                }
                                deleteCertification(cert.id);
                              }}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                              title="Delete Certificate"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Link Editor Form */}
                        {isEditing && (
                          <div className="mt-4 pt-4 border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-surface)] p-4 rounded-xl animate-in slide-in-from-top-2 duration-150">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-caps uppercase tracking-wider text-[var(--primary)] font-bold flex items-center gap-1">
                                <LinkIcon size={12} />
                                <span>Attach / Update Certificate Link</span>
                              </span>
                              {isGoogleDriveUrl(editLinkValue) && (
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                                  Google Drive Link
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editNameValue}
                                  onChange={(e) => setEditNameValue(e.target.value)}
                                  placeholder="Certificate Name"
                                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                                />
                                <input
                                  type="text"
                                  value={editIssuerValue}
                                  onChange={(e) => setEditIssuerValue(e.target.value)}
                                  placeholder="Issuer"
                                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                                />
                              </div>

                              <div className="relative flex items-center">
                                <input
                                  type="url"
                                  value={editLinkValue}
                                  onChange={(e) => setEditLinkValue(e.target.value)}
                                  placeholder="Paste Google Drive link: https://drive.google.com/file/d/..."
                                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-3.5 pr-20 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveInlineEdit(cert.id)}
                                  className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary text-[10px] !py-1 !px-3 font-bold flex items-center gap-1"
                                >
                                  <Check size={11} />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-panel p-10 rounded-2xl border border-[var(--border-color)] text-center text-xs text-[var(--text-dim)] space-y-3">
                  <Award size={36} className="text-amber-400/50 mx-auto" />
                  <p>No certificates in your portfolio yet.</p>
                  <button
                    onClick={() => setActiveTab('drive')}
                    className="btn-primary text-xs !py-2 !px-4 inline-flex items-center gap-1.5 font-bold"
                  >
                    <Plus size={13} />
                    <span>Add Your First Certificate</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 md:px-8 py-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex justify-between items-center text-xs text-[var(--text-dim)]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Certificates & links update in real-time on your portfolio.</span>
          </span>
          <button
            onClick={handleClose}
            className="btn-secondary text-xs !py-2 !px-5 font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
