import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { isGoogleDriveUrl, getGoogleDriveEmbedUrl } from '../../utils/googleDrive';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  X,
  FileText,
  Eye,
  CheckCircle2,
  Link as LinkIcon,
  Check,
  Edit3,
  Globe,
  Trash2
} from 'lucide-react';

export default function EducationSection() {
  const { 
    portfolio, 
    isOwnerMode,
    setIsAdminOpen, 
    setIsCertificateModalOpen, 
    updateCertification,
    deleteCertification,
    showToast 
  } = usePortfolio();

  const { education, certifications } = portfolio;
  const [selectedCert, setSelectedCert] = useState(null);
  const [certLinkInput, setCertLinkInput] = useState('');
  const [isEditingLink, setIsEditingLink] = useState(false);

  // Sync modal input when selected certificate changes
  useEffect(() => {
    if (selectedCert) {
      setCertLinkInput(selectedCert.credentialUrl || '');
      setIsEditingLink(isOwnerMode && (!selectedCert.credentialUrl || selectedCert.credentialUrl === '#'));
    }
  }, [selectedCert, isOwnerMode]);

  const handleSaveCertificateLink = (e) => {
    e?.preventDefault();
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to modify certificates', 'error');
      return;
    }
    if (!selectedCert) return;

    const trimmedLink = certLinkInput.trim();
    const updated = {
      ...selectedCert,
      credentialUrl: trimmedLink
    };

    updateCertification(selectedCert.id, updated);
    setSelectedCert(updated);
    setIsEditingLink(false);
    showToast('Certificate link saved successfully!');
  };

  const handleOpenAttachLink = (cert) => {
    if (!isOwnerMode) {
      showToast('🔒 Owner Mode required to edit certificate links', 'error');
      return;
    }
    setSelectedCert(cert);
    setCertLinkInput(cert.credentialUrl || '');
    setIsEditingLink(true);
  };

  return (
    <section id="education" className="py-24 px-6 md:px-10 max-w-7xl mx-auto w-full relative">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="w-5 h-px bg-[var(--primary)]" />
            <span className="font-caps text-xs tracking-widest text-[var(--primary)] font-semibold">
              ACADEMIC FOUNDATION & CREDENTIALS
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-[var(--text-main)] mb-3 tracking-tight">
            Education & Certifications
          </h2>
          <p className="font-sans text-sm md:text-base text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Academic degrees, computer science coursework, and verified professional certifications.
          </p>
        </div>

        {/* Action Buttons (Owner Mode Only) */}
        {isOwnerMode && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="btn-secondary text-xs !py-2.5 !px-4 flex items-center gap-2 shrink-0"
            >
              <GraduationCap size={14} className="text-[var(--primary)]" />
              <span>Manage Degrees</span>
            </button>

            <button
              onClick={() => setIsCertificateModalOpen(true)}
              className="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-2 shrink-0 font-bold shadow-lg shadow-[var(--primary)]/15"
              title="Add a new certificate manually with Google Drive link or verification URL"
            >
              <Award size={14} />
              <span>Add Certificate +</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* University Education (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-bold flex items-center gap-2">
              <GraduationCap size={16} className="text-[var(--primary)]" />
              <span>Academic Degrees & Qualifications</span>
            </h3>
            <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-0.5 rounded-full border border-[var(--primary)]/20 font-semibold">
              {education?.length || 0} Listed
            </span>
          </div>

          <div className="space-y-4">
            {education && education.length > 0 ? (
              education.map((edu, idx) => (
                <div 
                  key={idx} 
                  className="glass-panel p-6 md:p-7 rounded-3xl border border-[var(--border-color)] hover:border-[var(--primary)]/50 transition-all space-y-3 group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors">
                      {edu.degree}
                    </h4>
                    {edu.year && (
                      <span className="font-mono text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20 font-semibold">
                        {edu.year}
                      </span>
                    )}
                  </div>

                  {edu.institution && (
                    <p className="text-xs md:text-sm text-[var(--text-main)]/90 font-mono font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                      <span>{edu.institution}</span>
                    </p>
                  )}

                  {edu.honors && (
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-surface-high)] p-3.5 rounded-2xl border border-white/5 font-sans">
                      {edu.honors}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)] text-center text-xs text-[var(--text-dim)]">
                No education history provided.
              </div>
            )}
          </div>
        </div>

        {/* Certifications (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-caps text-xs tracking-wider text-[var(--text-dim)] uppercase font-bold flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span>Certifications & Credentials</span>
            </h3>
            {isOwnerMode && (
              <button
                onClick={() => setIsCertificateModalOpen(true)}
                className="text-[11px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold"
                title="Add certificate with Google Drive link"
              >
                <Plus size={12} />
                <span>Add / Google Drive</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {certifications && certifications.length > 0 ? (
              certifications.map((cert, idx) => {
                const isDrive = isGoogleDriveUrl(cert.credentialUrl);
                const hasValidLink = cert.credentialUrl && cert.credentialUrl !== '#' && cert.credentialUrl.trim() !== '';

                return (
                  <div 
                    key={cert.id || idx} 
                    onClick={() => setSelectedCert(cert)}
                    className="glass-panel p-4 md:p-5 rounded-2xl border border-[var(--border-color)] flex flex-col justify-between gap-3 hover:border-[var(--primary)]/50 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="font-sans text-xs md:text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                            {cert.name}
                          </h4>
                          {isDrive && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold shrink-0">
                              Drive
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-dim)] font-mono block">
                          {(cert.issuer && !cert.issuer.toLowerCase().includes('verified')) ? cert.issuer : 'Certification'} {cert.date ? `• ${cert.date}` : ''}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCert(cert);
                        }}
                        className="p-1.5 rounded-xl bg-[var(--bg-surface-high)] text-[var(--text-dim)] group-hover:text-[var(--primary)] border border-white/5 shrink-0 transition-colors"
                        title="View Certificate Details"
                      >
                        <Eye size={13} />
                      </button>
                    </div>

                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cert.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)] text-[var(--text-dim)] border border-white/5">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link Action Row */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                      {hasValidLink ? (
                        <>
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="btn-primary text-[10px] !py-1 !px-2.5 flex items-center gap-1 font-bold shadow-sm"
                          >
                            <span>View Certificate</span>
                            <ExternalLink size={11} />
                          </a>

                          {isOwnerMode && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenAttachLink(cert);
                                }}
                                className="text-[10px] font-mono text-[var(--text-dim)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                                title="Edit Certificate Link"
                              >
                                <Edit3 size={11} />
                                <span>Edit Link</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteCertification(cert.id);
                                }}
                                className="text-[10px] font-mono text-red-400/70 hover:text-red-400 flex items-center gap-1 transition-colors"
                                title="Delete Certificate"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        isOwnerMode ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAttachLink(cert);
                            }}
                            className="w-full text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1.5 bg-amber-500/10 px-2.5 py-1.5 rounded-xl border border-amber-500/20 transition-all font-semibold hover:bg-amber-500/20"
                          >
                            <LinkIcon size={12} />
                            <span>+ Attach Google Drive / Credential Link</span>
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono text-[var(--text-dim)] flex items-center gap-1.5 py-0.5">
                            <Award size={11} className="text-amber-400/80" />
                            <span>Verified Credential</span>
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-[var(--border-color)] text-center text-xs text-[var(--text-dim)] space-y-3">
                <p>{isOwnerMode ? "No certifications listed yet." : "Verified certifications and credentials will appear here."}</p>
                {isOwnerMode && (
                  <button
                    onClick={() => setIsCertificateModalOpen(true)}
                    className="btn-primary text-xs !py-2 !px-4 inline-flex items-center gap-1.5 font-bold"
                  >
                    <Plus size={13} />
                    <span>Add First Certificate</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Interactive Certificate Preview & Link Editor Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--text-main)]">
                    Certificate Details & Link
                  </h3>
                  <p className="text-[10px] font-mono text-[var(--text-dim)]">
                    {selectedCert.issuer}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(null)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Document Banner / Graphic or Google Drive Embed */}
              {isGoogleDriveUrl(selectedCert.credentialUrl) && getGoogleDriveEmbedUrl(selectedCert.credentialUrl) ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 h-44 flex flex-col justify-center items-center">
                  <iframe 
                    src={getGoogleDriveEmbedUrl(selectedCert.credentialUrl)}
                    title={selectedCert.name}
                    className="w-full h-full border-0 pointer-events-auto"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-500/20 via-[var(--bg-surface-high)] to-purple-500/10 border border-white/10 flex flex-col justify-center items-center text-center p-4">
                  <Award size={32} className="text-amber-400 mb-1.5 drop-shadow-md" />
                  <h4 className="font-display text-sm font-bold text-white line-clamp-1">
                    {selectedCert.name}
                  </h4>
                  <span className="text-[11px] font-mono text-white/70">
                    {selectedCert.issuer} {selectedCert.date ? `(${selectedCert.date})` : ''}
                  </span>
                </div>
              )}

              {/* Certificate Metadata */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-[var(--text-dim)]">Program:</span>
                  <span className="font-semibold text-[var(--text-main)] text-right line-clamp-1">{selectedCert.name}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-[var(--text-dim)]">Issuer:</span>
                  <span className="font-mono text-[var(--primary)] font-semibold">{selectedCert.issuer}</span>
                </div>

                {selectedCert.date && (
                  <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                    <span className="text-[var(--text-dim)]">Date:</span>
                    <span className="font-mono text-[var(--text-main)]">{selectedCert.date}</span>
                  </div>
                )}

                {selectedCert.skills && selectedCert.skills.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1">Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCert.skills.map((s, idx) => (
                        <span key={idx} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)] text-[var(--primary)] border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Link & Google Drive Section */}
              <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold flex items-center gap-1.5">
                    <LinkIcon size={12} className="text-[var(--primary)]" />
                    <span>Certificate URL / Google Drive Link</span>
                  </label>
                  {isOwnerMode && !isEditingLink && selectedCert.credentialUrl && selectedCert.credentialUrl !== '#' && (
                    <button
                      onClick={() => setIsEditingLink(true)}
                      className="text-[10px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1"
                    >
                      <Edit3 size={11} />
                      <span>Change Link</span>
                    </button>
                  )}
                </div>

                {isOwnerMode && isEditingLink ? (
                  <form onSubmit={handleSaveCertificateLink} className="space-y-2">
                    <div className="relative flex items-center">
                      <input
                        type="url"
                        value={certLinkInput}
                        onChange={(e) => setCertLinkInput(e.target.value)}
                        placeholder="Paste Google Drive link: https://drive.google.com/file/d/..."
                        className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-xl pl-3.5 pr-20 py-2.5 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-primary text-[10px] !py-1 !px-3 font-bold flex items-center gap-1"
                      >
                        <Check size={11} />
                        <span>Save</span>
                      </button>
                    </div>
                    {isGoogleDriveUrl(certLinkInput) && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Google Drive format detected</span>
                      </span>
                    )}
                    <p className="text-[10px] text-[var(--text-dim)] font-mono">
                      Tip: In Google Drive, click Share &gt; "Anyone with the link can view", then copy link.
                    </p>
                  </form>
                ) : (
                  selectedCert.credentialUrl && selectedCert.credentialUrl !== '#' ? (
                    <div className="flex items-center justify-between bg-[var(--bg-surface-high)] p-2.5 rounded-xl border border-white/5 text-xs font-mono">
                      <span className="text-[var(--text-muted)] truncate max-w-[240px] text-[11px]">
                        {selectedCert.credentialUrl}
                      </span>
                      <a
                        href={selectedCert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary)] hover:underline flex items-center gap-1 text-[11px] font-bold shrink-0 ml-2"
                      >
                        <span>Open Link</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ) : (
                    <div className="bg-[var(--bg-surface-high)] p-2.5 rounded-xl border border-white/5 text-xs font-mono text-[var(--text-dim)] flex items-center justify-between">
                      <span className="text-[11px]">No direct document link attached yet</span>
                      {isOwnerMode && (
                        <button
                          onClick={() => setIsEditingLink(true)}
                          className="text-[10px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Plus size={11} />
                          <span>Attach Link</span>
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[var(--border-color)] flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="btn-secondary text-xs !py-2 !px-4"
                  >
                    Close
                  </button>

                  {isOwnerMode && (
                    <button
                      onClick={() => {
                        deleteCertification(selectedCert.id);
                        setSelectedCert(null);
                      }}
                      className="text-xs !py-2 !px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-all font-medium"
                      title="Delete Certificate"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                {selectedCert.credentialUrl && selectedCert.credentialUrl !== '#' ? (
                  <a
                    href={selectedCert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs !py-2 !px-5 flex items-center gap-2 font-bold shadow-lg shadow-[var(--primary)]/20"
                  >
                    <span>View Certificate</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  isOwnerMode && (
                    <button
                      onClick={() => setIsEditingLink(true)}
                      className="btn-primary text-xs !py-2 !px-4 text-[var(--on-primary)] font-bold flex items-center gap-1.5"
                    >
                      <Plus size={12} />
                      <span>Attach Link</span>
                    </button>
                  )
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
