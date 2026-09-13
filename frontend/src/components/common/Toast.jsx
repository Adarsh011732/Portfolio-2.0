import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = usePortfolio();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type !== 'error';

  return (
    <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
      <div className={`px-5 py-3.5 rounded-2xl glass-panel border flex items-center gap-3 shadow-2xl backdrop-blur-2xl ${
        isSuccess ? 'border-emerald-500/40 text-emerald-300' : 'border-rose-500/40 text-rose-300'
      }`}>
        {isSuccess ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-rose-400 shrink-0" />}
        <span className="text-xs font-mono text-[var(--text-main)] font-medium">
          {toastMessage.message}
        </span>
      </div>
    </div>
  );
}
