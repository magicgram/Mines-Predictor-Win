
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
      } else {
        setError(data.message || t('incorrectPassword'));
      }
    } catch (err) {
      setError(t('errorOccurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="w-full max-w-sm bg-[#082f49]/90 backdrop-blur-xl border border-[#38bdf8]/20 text-white rounded-2xl p-6 md:p-8 flex flex-col animate-fade-in shadow-2xl">
        <h1 className="text-2xl font-russo text-center text-[#38bdf8] mb-2 uppercase">{t('adminAccess')}</h1>
        <p className="text-center text-white/70 mb-6 font-poppins">{t('enterPasswordToAccessTestPage')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#083344]/60 border border-[#38bdf8]/30 text-white placeholder-gray-400 font-poppins text-base rounded-full focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="p-3 rounded-lg text-center text-sm bg-red-500/50 text-white border border-red-400/50 font-poppins">
                {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-transparent border-2 border-white/50 text-white font-poppins font-bold text-lg uppercase rounded-full transition-colors hover:bg-white/10"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="py-3 bg-gradient-to-r from-[#4ade80] to-[#16a34a] text-[#064e3b] font-poppins font-bold text-lg uppercase rounded-full transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-lg shadow-black/30 border-b-4 border-[#14532d] active:border-b-0 active:translate-y-1"
            >
              {isLoading ? t('verifying') : t('submit')}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default React.memo(AdminAuthModal);
