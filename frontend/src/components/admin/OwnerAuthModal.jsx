import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  ShieldCheck,
  Unlock,
  Mail,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { apiFetch } from '../../services/apiConfig';

/**
 * Owner Security Verification modal.
 *
 * SECURITY CHANGE: the master-PIN login tab has been REMOVED. Email OTP is the
 * only way to unlock Owner Mode. A successful verification mints a server-side
 * session (HttpOnly HMAC cookie + CSRF pair); the CSRF token is kept in
 * sessionStorage and echoed by apiFetch on every mutating request.
 */
export default function OwnerAuthModal() {
  const {
    isOwnerAuthModalOpen,
    setIsOwnerAuthModalOpen,
    setIsOwnerMode,
    showToast
  } = usePortfolio();

  const [otpInput, setOtpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOwnerAuthModalOpen) {
      setOtpInput('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
      setOtpSent(false);
    }
  }, [isOwnerAuthModalOpen]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOwnerAuthModalOpen) return null;

  const postAuthApi = async (endpoint, payload = {}) => {
    try {
      const res = await apiFetch(`/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success !== false) {
        return { ok: true, data: json };
      }
      return { ok: false, error: json.error || 'Operation failed' };
    } catch (err) {
      return { ok: false, error: 'Could not reach the authentication service. Check your connection.' };
    }
  };

  // Handle Requesting OTP via Nodemailer
  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await postAuthApi('send-otp');
    setIsLoading(false);

    if (res.ok) {
      setOtpSent(true);
      setCountdown(300); // 5 minutes
      setSuccessMsg(res.data?.message || 'A 6-digit OTP has been sent to your registered email.');
      showToast('✉️ Verification code dispatched');
    } else {
      setErrorMsg(res.error || 'Failed to send OTP. Please try again in a few minutes.');
    }
  };

  // Handle OTP Verification & Login
  const handleVerify = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const submittedCode = otpInput.trim();
    if (!/^\d{6}$/.test(submittedCode)) {
      setErrorMsg('Please enter the 6-digit OTP sent to your registered email.');
      return;
    }

    setIsLoading(true);
    try {
      const verifyRes = await postAuthApi('verify-otp', { code: submittedCode });

      if (verifyRes.ok && verifyRes.data?.authenticated) {
        // Keep the CSRF token for the double-submit header (session-scoped)
        try {
          if (verifyRes.data.csrfToken) {
            sessionStorage.setItem('portfolio_owner_csrf', verifyRes.data.csrfToken);
          }
        } catch { /* storage unavailable */ }
        setIsOwnerMode(true);
        setIsOwnerAuthModalOpen(false);
        showToast('👑 Authentication Successful! Welcome back.');
      } else {
        setErrorMsg(verifyRes.error || 'Invalid or expired verification code. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex justify-center p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--bg-surface-low)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-color)] bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)]">
                Owner Security Verification
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-dim)]">
                Confidential Access • Owner Mode
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOwnerAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-[var(--bg-surface-variant)] text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-7 space-y-6">

          <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-white/5 text-xs text-[var(--text-muted)] space-y-1">
            <span className="font-semibold text-[var(--text-main)] block">Registered Email Authentication:</span>
            <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
              A secure single-use 6-digit One-Time Password is sent to the owner's registered email.
              OTP is the only authentication method — master passkeys have been retired.
            </p>
          </div>

          {!otpSent ? (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isLoading}
              className="w-full btn-primary text-xs !py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20"
            >
              <Send size={14} />
              <span>{isLoading ? 'Dispatching OTP...' : 'Send Verification Code to Email'}</span>
            </button>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-bold">
                    Enter 6-Digit OTP
                  </label>
                  {countdown > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <Clock size={11} />
                      <span>Expires in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-2xl px-4 py-3 text-center text-xl tracking-[0.3em] font-mono text-[var(--primary)] font-bold focus:outline-none focus:border-[var(--primary)]"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="btn-secondary text-xs !py-2.5 !px-3 font-mono flex items-center gap-1.5"
                >
                  <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                  <span>Resend</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading || otpInput.length < 6}
                  className="flex-1 btn-primary text-xs !py-2.5 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50"
                >
                  <Unlock size={14} />
                  <span>{isLoading ? 'Verifying...' : 'Verify OTP & Unlock'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Success Message Feedback */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Message Feedback */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
