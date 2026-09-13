import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  ShieldCheck, 
  KeyRound, 
  Unlock, 
  Mail, 
  Send, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Key,
  ArrowLeft
} from 'lucide-react';
import { getApiUrl } from '../../services/apiConfig';

export default function OwnerAuthModal() {
  const { 
    isOwnerAuthModalOpen, 
    setIsOwnerAuthModalOpen, 
    setIsOwnerMode, 
    showToast 
  } = usePortfolio();

  // Mode: 'login' (default passkey/otp view) or 'reset' (dedicated reset passkey view)
  const [viewMode, setViewMode] = useState('login'); // 'login' | 'reset'
  const [authMethod, setAuthMethod] = useState('pin'); // 'pin' | 'otp'
  
  const [pinInput, setPinInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPasskeyInput, setNewPasskeyInput] = useState('');
  
  const [showPin, setShowPin] = useState(false);
  const [showNewPasskey, setShowNewPasskey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);


  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOwnerAuthModalOpen) {
      setViewMode('login');
      setAuthMethod('pin');
      setPinInput('');
      setOtpInput('');
      setNewPasskeyInput('');
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(false);
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

  // Resilient API Post Helper
  const postAuthApi = async (endpoint, payload = {}) => {
    try {
      const res = await fetch(getApiUrl(`/api/auth/${endpoint}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && (json.success !== false)) {
        return { ok: true, data: json };
      }
      return { ok: false, error: json.error || 'Operation failed' };
    } catch (err) {
      // Direct localhost:3001 fallback
      try {
        const res = await fetch(`http://localhost:3001/api/auth/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (res.ok && (json.success !== false)) {
          return { ok: true, data: json };
        }
        return { ok: false, error: json.error || 'Operation failed' };
      } catch (e) {
        return { ok: false, error: 'Could not connect to authentication daemon.' };
      }
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
      setSuccessMsg('A 6-digit OTP has been sent to your registered email.');
      showToast('✉️ 6-digit OTP dispatched to registered email');
    } else {
      setErrorMsg(res.error || 'Failed to send OTP. Please check backend connection.');
    }
  };

  // Handle Verification & Login (Passkey or OTP)
  const handleVerify = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const submittedCode = authMethod === 'otp' ? otpInput.trim() : pinInput.trim();

    if (!submittedCode) {
      setErrorMsg(`Please enter your ${authMethod === 'otp' ? '6-digit OTP' : 'Master Passkey'}.`);
      return;
    }

    setIsLoading(true);

    try {
      let isVerified = false;

      // Backend verification
      const verifyRes = await postAuthApi('verify-otp', {
        code: submittedCode,
        pin: submittedCode,
        otp: submittedCode
      });

      if (verifyRes.ok && verifyRes.data?.authenticated) {
        isVerified = true;
      }

      // Only trust server-side verification
      if (isVerified) {
        setIsOwnerMode(true);
        setIsOwnerAuthModalOpen(false);
        showToast('👑 Authentication Successful! Welcome back.');
      } else {
        setErrorMsg('Invalid verification code or passkey. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Dedicated Passkey Reset Flow
  const handleResetPasskey = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanOtp = otpInput.trim();
    const cleanPasskey = newPasskeyInput.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP sent to your registered email.');
      return;
    }

    if (!cleanPasskey || cleanPasskey.length < 4) {
      setErrorMsg('New passkey must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const resetRes = await postAuthApi('reset-passkey', {
        otp: cleanOtp,
        newPasskey: cleanPasskey
      });

      if (resetRes.ok) {
        setSuccessMsg('Master passkey successfully updated!');
        showToast('🔑 Master passkey successfully updated!');
        
        // Return to login with updated pin
        setTimeout(() => {
          setViewMode('login');
          setAuthMethod('pin');
          setPinInput(cleanPasskey);
          setOtpInput('');
          setNewPasskeyInput('');
          setSuccessMsg('Passkey updated! You may now unlock owner mode.');
        }, 1200);
      } else {
        setErrorMsg(resetRes.error || 'Failed to reset passkey. Ensure the 6-digit OTP matches the code sent to your email.');
      }
    } catch (err) {
      setErrorMsg('Failed to reset passkey. Please check network connection.');
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
            {viewMode === 'reset' ? (
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="p-2 rounded-2xl bg-[var(--bg-surface-high)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors"
                title="Back to Login"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={20} />
              </div>
            )}
            <div>
              <h2 className="font-display text-base font-bold text-[var(--text-main)]">
                {viewMode === 'reset' ? 'Reset Owner Passkey' : 'Owner Security Verification'}
              </h2>
              <p className="text-[11px] font-mono text-[var(--text-dim)]">
                {viewMode === 'reset' ? 'Ownership Verification' : 'Confidential Access • Owner Mode'}
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

          {/* VIEW 1: NORMAL LOGIN (Passkey or Email OTP) */}
          {viewMode === 'login' && (
            <>
              {/* Method Selector Tabs: ONLY Passkey & Email OTP */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[var(--bg-surface-high)] border border-white/5">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('pin'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    authMethod === 'pin'
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <KeyRound size={13} />
                  <span>Master Passkey</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('otp'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    authMethod === 'otp'
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-md'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Mail size={13} />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Tab 1: Master Passkey PIN Authentication */}
              {authMethod === 'pin' && (
                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-white/5 text-xs text-[var(--text-muted)] space-y-1">
                    <span className="font-semibold text-[var(--text-main)] block">Master Passkey Authentication:</span>
                    <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                      Enter your secret PIN to unlock owner edit permissions.
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold block mb-1.5">
                      Owner Passkey
                    </label>
                    <div className="relative">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        placeholder="Enter Passkey"
                        className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-2xl pl-4 pr-12 py-3 text-sm font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
                      >
                        {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => { 
                        setViewMode('reset'); 
                        setErrorMsg(''); 
                        setSuccessMsg(''); 
                        setOtpInput('');
                        setNewPasskeyInput('');
                      }}
                      className="text-[11px] font-mono text-[var(--primary)] hover:underline font-medium"
                    >
                      Forgot or Reset Passkey? →
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !pinInput}
                    className="w-full btn-primary text-xs !py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50"
                  >
                    <Unlock size={14} />
                    <span>{isLoading ? 'Authenticating...' : 'Authenticate & Unlock'}</span>
                  </button>
                </form>
              )}

              {/* Tab 2: 2-Step Email OTP Authentication */}
              {authMethod === 'otp' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-white/5 text-xs text-[var(--text-muted)] space-y-1">
                    <span className="font-semibold text-[var(--text-main)] block">Registered Email Authentication:</span>
                    <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                      Sends a secure 6-digit One-Time Password to your registered mail.
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
                          <label className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold">
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
                </div>
              )}
            </>
          )}

          {/* VIEW 2: DEDICATED PASSKEY RESET MODAL BOX */}
          {viewMode === 'reset' && (
            <form onSubmit={handleResetPasskey} className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-white/5 text-xs text-[var(--text-muted)] space-y-1.5">
                <span className="font-semibold text-[var(--text-main)] block">Secure Passkey Reset Flow:</span>
                <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                  A verification code will be sent to your registered email to authorize setting your new owner passkey.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Step 1: OTP Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold">
                      Step 1: Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-[11px] font-mono text-[var(--primary)] hover:underline flex items-center gap-1"
                    >
                      {otpSent ? (
                        <span>Resend Code {countdown > 0 ? `(${countdown}s)` : '↻'}</span>
                      ) : (
                        <span>Send Code to Email →</span>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-2xl px-4 py-2.5 text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                {/* Step 2: New Passkey Section */}
                <div>
                  <label className="text-[10px] font-caps uppercase tracking-wider text-[var(--text-dim)] font-bold block mb-1.5">
                    Step 2: Set New Master Passkey
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPasskey ? 'text' : 'password'}
                      value={newPasskeyInput}
                      onChange={(e) => setNewPasskeyInput(e.target.value)}
                      placeholder="Enter new custom PIN or passkey"
                      className="w-full bg-[var(--bg-surface-high)] border border-[var(--border-color)] rounded-2xl pl-4 pr-11 py-2.5 text-xs font-mono text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPasskey(!showNewPasskey)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
                    >
                      {showNewPasskey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="btn-secondary text-xs !py-2.5 !px-4"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !otpInput || !newPasskeyInput || newPasskeyInput.length < 4}
                  className="flex-1 btn-primary text-xs !py-2.5 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50"
                >
                  <Key size={14} />
                  <span>{isLoading ? 'Updating...' : 'Verify OTP & Set Passkey'}</span>
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

