import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  Code,
  FileCheck
} from 'lucide-react';

import { API_BASE_URL, getApiUrl } from '../../services/apiConfig';
import { extractTextFromPDF } from '../../services/aiExtractionService';

export default function ResumeUploadModal() {
  const { isResumeModalOpen, setIsResumeModalOpen, applyResumeData, showToast } = usePortfolio();
  
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState('');

  const BACKEND = API_BASE_URL;

  if (!isResumeModalOpen) return null;

  // Convert file to base64 then send to backend
  const handleFileUpload = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setIsParsing(true);
    setExtractedData(null);
    setParseError('');

    try {
      if (file.name.endsWith('.json')) {
        // JSON config — apply directly
        const jsonText = await file.text();
        const json = JSON.parse(jsonText);
        setExtractedData(json);
        showToast('Profile loaded from JSON config!');
        return;
      }

      let response;

      if (file.name.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        let extractedPdfText = '';

        try {
          extractedPdfText = await extractTextFromPDF(arrayBuffer);
          if (extractedPdfText && extractedPdfText.trim().length > 30) {
            setResumeText(extractedPdfText);
          }
        } catch (clientErr) {
          console.warn('Client-side PDF extraction fallback:', clientErr.message);
        }

        if (extractedPdfText && extractedPdfText.trim().length > 30) {
          response = await fetch(getApiUrl('/api/ai/parse-resume'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: extractedPdfText })
          });
        } else {
          // Read PDF as base64 — backend handles extraction
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          bytes.forEach(b => binary += String.fromCharCode(b));
          const base64 = btoa(binary);

          response = await fetch(getApiUrl('/api/ai/parse-resume'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pdf: base64 })
          });
        }
      } else {
        // TXT / DOCX — read as text
        const text = await file.text();
        setResumeText(text);
        response = await fetch(`${BACKEND}/api/ai/parse-resume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const parsed = await response.json();
      setExtractedData(parsed);
      showToast('Resume parsed — review and apply your data below!');
    } catch (err) {
      console.error('Resume parse error:', err);
      setParseError(err.message || 'Failed to parse file. Try pasting text instead.');
      showToast(err.message || 'Parse failed', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePasteParse = async () => {
    if (!resumeText.trim()) {
      showToast('Please paste your resume or profile text first', 'error');
      return;
    }
    setIsParsing(true);
    setExtractedData(null);
    setParseError('');
    try {
      const response = await fetch(`${BACKEND}/api/ai/parse-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: resumeText })
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }
      const parsed = await response.json();
      setExtractedData(parsed);
      showToast('Profile data extracted successfully!');
    } catch (err) {
      setParseError(err.message || 'Failed to parse text');
      showToast(err.message || 'Parse failed', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadPreset = async (preset) => {
    setResumeText(preset.text);
    setIsParsing(true);
    try {
      const parsed = await parseResumeWithAPI(preset.text);
      setExtractedData(parsed);
      showToast(`Loaded preset for ${preset.title}!`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = () => {
    if (!extractedData) return;
    applyResumeData(extractedData);
    setIsResumeModalOpen(false);
    setExtractedData(null);
    setParseError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-2xl flex justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[var(--text-main)]">
                AI Resume & Profile Extractor
              </h2>
              <p className="text-xs text-[var(--text-dim)] font-sans">
                Upload your resume (PDF/TXT/JSON) or paste text to auto-populate your portfolio with verified data.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsResumeModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          
          {!extractedData ? (
            <>
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-[var(--border-color)] pb-3">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                    activeTab === 'upload' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Upload Resume (PDF / TXT / JSON)
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                    activeTab === 'paste' ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
                  }`}
                >
                  Paste Resume Text
                </button>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all relative ${
                    dragActive ? 'border-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.json,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-14 h-14 rounded-full bg-[var(--bg-surface-high)] flex items-center justify-center mx-auto mb-3 text-[var(--primary)]">
                    <Upload size={24} />
                  </div>
                  <h3 className="font-display text-base font-bold text-[var(--text-main)] mb-1">
                    Drag and drop your resume file here
                  </h3>
                  <p className="text-xs text-[var(--text-dim)] mb-4 font-sans">
                    Supports PDF, TXT, or JSON. Extracts verified information without hallucinations.
                  </p>
                  <span className="btn-secondary text-xs !py-2 !px-4">
                    Browse File from Computer
                  </span>
                </div>
              )}

              {/* Paste Text Tab */}
              {activeTab === 'paste' && (
                <div className="space-y-4">
                  <textarea
                    rows={8}
                    placeholder="Paste resume text, GitHub profile URL, Codolio URL, LeetCode profile URL, projects, education..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs md:text-sm font-mono text-[var(--text-main)] placeholder-[var(--text-dim)] focus:outline-none focus:border-[var(--primary)] resize-none"
                  />
                  <button
                    onClick={handlePasteParse}
                    disabled={isParsing || !resumeText.trim()}
                    className="w-full btn-primary text-xs font-bold !py-3 flex items-center justify-center gap-2"
                  >
                    <Sparkles size={15} />
                    <span>Run Verified Profile Extraction</span>
                  </button>
                </div>
              )}
                        {/* Preset tab removed — paste or upload your own resume */}

              {/* Error message */}
              {parseError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-sans">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {isParsing && (
                <div className="flex items-center justify-center gap-3 py-6 text-xs text-[var(--primary)] font-mono">
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Parsing resume via backend... (pdf-parse)</span>
                </div>
              )}
            </>
          ) : (
            /* Review Screen */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Profile Extracted! Review your verified fields below:</span>
                </div>
                <button
                  onClick={() => setExtractedData(null)}
                  className="text-xs text-[var(--text-dim)] hover:text-white underline font-sans"
                >
                  Upload Different File
                </button>
              </div>

              {/* Details Review */}
              <div className="glass-panel p-5 rounded-2xl border border-[var(--border-color)] space-y-4">
                <h3 className="font-display text-sm font-bold text-[var(--primary)]">
                  Extracted Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1 font-bold">Name</label>
                    <input
                      type="text"
                      value={extractedData.personal?.name || ''}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        personal: { ...extractedData.personal, name: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1 font-bold">Title / Role</label>
                    <input
                      type="text"
                      value={extractedData.personal?.title || ''}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        personal: { ...extractedData.personal, title: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1 font-bold">Email</label>
                    <input
                      type="text"
                      value={extractedData.personal?.email || ''}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        personal: { ...extractedData.personal, email: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1 font-bold">GitHub</label>
                    <input
                      type="text"
                      value={extractedData.socials?.github || ''}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        socials: { ...extractedData.socials, github: e.target.value }
                      })}
                      className="w-full p-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)] font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-caps text-[var(--text-dim)] uppercase block mb-1 font-bold">Bio</label>
                  <textarea
                    rows={3}
                    value={extractedData.personal?.bio || ''}
                    onChange={(e) => setExtractedData({
                      ...extractedData,
                      personal: { ...extractedData.personal, bio: e.target.value }
                    })}
                    className="w-full p-2.5 rounded-xl bg-[var(--bg-surface-high)] border border-[var(--border-color)] text-xs text-[var(--text-main)]"
                  />
                </div>
              </div>

              {/* Extracted Skills & Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)]">
                  <h4 className="font-caps text-[10px] text-[var(--text-dim)] uppercase mb-2 font-bold">
                    Extracted Skills ({extractedData.skills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {extractedData.skills && extractedData.skills.length > 0 ? (
                      extractedData.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-[var(--bg-surface-high)] text-[10px] font-mono text-[var(--primary)] border border-white/10">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[var(--text-dim)]">No skills detected in text.</span>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)]">
                  <h4 className="font-caps text-[10px] text-[var(--text-dim)] uppercase mb-2 font-bold">
                    Extracted Projects ({extractedData.projects?.length || 0})
                  </h4>
                  <ul className="text-xs text-[var(--text-muted)] space-y-1.5 max-h-32 overflow-y-auto font-mono text-[10px]">
                    {extractedData.projects && extractedData.projects.length > 0 ? (
                      extractedData.projects.map((p, i) => (
                        <li key={i} className="truncate text-[var(--primary)]">
                          &bull; {p.title}
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-[var(--text-dim)] font-sans">No projects explicitly listed in text.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Extracted Education & Certifications */}
              {(extractedData.education?.length > 0 || extractedData.certifications?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)]">
                    <h4 className="font-caps text-[10px] text-[var(--text-dim)] uppercase mb-2 font-bold flex items-center justify-between">
                      <span>Extracted Education ({extractedData.education?.length || 0})</span>
                    </h4>
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {extractedData.education && extractedData.education.length > 0 ? (
                        extractedData.education.map((edu, i) => (
                          <div key={i} className="p-2.5 rounded-xl bg-[var(--bg-surface-high)]/60 border border-white/5 text-xs">
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-display font-bold text-[var(--text-main)] text-xs">{edu.degree}</span>
                              {edu.year && <span className="text-[10px] font-mono text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-0.5 rounded-full shrink-0">{edu.year}</span>}
                            </div>
                            {edu.institution && <p className="text-[11px] text-[var(--text-dim)] font-mono mt-0.5">{edu.institution}</p>}
                            {edu.honors && <p className="text-[10px] text-[var(--text-muted)] mt-1 font-sans">{edu.honors}</p>}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--text-dim)]">No education parsed from text.</span>
                      )}
                    </div>
                  </div>

                  <div className="glass-panel p-4 rounded-2xl border border-[var(--border-color)]">
                    <h4 className="font-caps text-[10px] text-[var(--text-dim)] uppercase mb-2 font-bold">
                      Extracted Certifications ({extractedData.certifications?.length || 0})
                    </h4>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {extractedData.certifications && extractedData.certifications.length > 0 ? (
                        extractedData.certifications.map((cert, i) => (
                          <div key={i} className="p-2 rounded-xl bg-[var(--bg-surface-high)]/60 border border-white/5 text-xs flex justify-between items-center">
                            <span className="font-medium text-[var(--text-main)] text-[11px] truncate">{cert.name}</span>
                            {cert.date && <span className="text-[10px] font-mono text-[var(--text-dim)] shrink-0 ml-2">{cert.date}</span>}
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--text-dim)]">No certifications parsed.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 md:px-8 py-3.5 border-t border-[var(--border-color)] bg-[var(--bg-surface)]">
          <button
            onClick={() => setIsResumeModalOpen(false)}
            className="text-xs font-sans text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            Cancel
          </button>

          {extractedData && (
            <button
              onClick={handleApply}
              className="btn-primary text-xs !py-2.5 !px-6 flex items-center gap-2 font-bold"
            >
              <Check size={15} />
              <span>Apply Verified Data to Portfolio</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
