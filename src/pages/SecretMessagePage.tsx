import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { KeyRound, Lock, LockOpen, Sparkles } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { sha256Hex } from '../lib/time';
import { playChime, playSoftError } from '../lib/sound';

export const SecretMessagePage: React.FC = () => {
  const { siteConfig } = useAppData();
  const [codeInput, setCodeInput] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeInput.trim()) return;
    setChecking(true);
    setErrorMsg(null);
    try {
      const digest = await sha256Hex(codeInput);
      if (digest === siteConfig.secretCodeHash) {
        setUnlocked(true);
        playChime([523.25, 659.25, 783.99, 1046.5], 95);
        try {
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.55 },
            colors: ['#f472b6', '#fbcfe8', '#c084fc', '#fde68a'],
          });
        } catch {
          // Ignore
        }
      } else {
        playSoftError();
        setErrorMsg('Kode rahasia belum cocok. Cek lagi petunjuk dari Zikri di atas ya!');
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold text-rose-500">Secret Message</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
          Kotak Pesan Rahasia 🔐
        </h1>
        <p className="text-sm text-[#6b485b]">
          Masukkan kode rahasia untuk membuka pesan khusus yang ditulis oleh Zikri.
        </p>
      </div>

      <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 sm:p-8 text-center space-y-6">
        {/* Padlock Animation */}
        <motion.div
          animate={unlocked ? { scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] } : {}}
          transition={{ duration: 0.6 }}
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border ${
            unlocked
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-pink-50 border-pink-200 text-rose-500'
          }`}
        >
          {unlocked ? <LockOpen className="w-9 h-9" /> : <Lock className="w-9 h-9" />}
        </motion.div>

        {!unlocked ? (
          <>
            <div className="rounded-2xl bg-[#fff8fa] border border-pink-100 p-4 text-sm text-[#5e3c4e]">
              <span className="font-semibold text-rose-500">Petunjuk Kode: </span>
              {siteConfig.secretHint}
            </div>

            <form onSubmit={handleUnlock} className="max-w-sm mx-auto space-y-3">
              <div className="relative">
                <KeyRound className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Masukkan kode rahasia..."
                  className="w-full min-h-[46px] pl-10 pr-4 py-2.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm text-[#4a2336] focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}

              <button
                type="submit"
                disabled={checking}
                className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold text-sm hover:brightness-105 cursor-pointer"
              >
                {checking ? 'Memeriksa...' : 'Buka Gembok Pesan'}
              </button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[#fff5f9] to-[#f8f1ff] border border-pink-200 p-6 text-left space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
              <Sparkles className="w-4 h-4" />
              <span>Pesan Rahasia Terbuka</span>
            </div>
            <p className="font-handwriting text-2xl sm:text-[28px] text-[#4a2336] leading-relaxed whitespace-pre-line">
              {siteConfig.secretMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                setUnlocked(false);
                setCodeInput('');
              }}
              className="text-xs font-semibold text-[#7c5a6c] hover:text-rose-500 cursor-pointer"
            >
              Kunci kembali pesan
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
