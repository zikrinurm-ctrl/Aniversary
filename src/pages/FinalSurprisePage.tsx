import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Music, Sparkles } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { playHugHeartbeat } from '../lib/sound';
import { PageId } from '../types';

export const FinalSurprisePage: React.FC<{ onNavigate: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const { siteConfig } = useAppData();
  const [typedLength, setTypedLength] = useState(0);
  const [hugCount, setHugCount] = useState(0);

  const fullText = siteConfig.finalLetter;

  useEffect(() => {
    setTypedLength(0);
    const timer = window.setInterval(() => {
      setTypedLength((prev) => {
        if (prev >= fullText.length) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 4;
      });
    }, 24);
    return () => window.clearInterval(timer);
  }, [fullText]);

  const handleOneMoreHug = () => {
    setHugCount((c) => c + 1);
    playHugHeartbeat();
    try {
      confetti({
        particleCount: 85,
        spread: 85,
        origin: { y: 0.65 },
        colors: ['#f472b6', '#fbcfe8', '#c084fc', '#fed7aa', '#ffffff'],
      });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-b from-[#fff2f6] via-[#fdf2f8] to-[#f4ecff] border border-pink-200 shadow-lg shadow-pink-100/60 overflow-hidden"
      >
        {/* Couple Hero Header */}
        <div className="relative h-64 sm:h-80 w-full bg-pink-100">
          <img
            src={siteConfig.couplePhotoUrl}
            alt={`Potret ${siteConfig.coupleNames}`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <div className="absolute bottom-5 left-6 right-6 text-white">
            <p className="text-xs font-semibold text-pink-200">
              {siteConfig.coupleNames} · 1st Anniversary Climax
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mt-1 text-balance">
              Thank You For Being My Home
            </h1>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Music Shortcut */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-pink-100">
            <span className="text-xs font-semibold text-rose-500 inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Surat Anniversary Dari Zikri</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('music')}
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-rose-600 hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Buka Ruang Musik</span>
            </button>
          </div>

          {/* Typing Letter */}
          <div className="rounded-2xl bg-white/90 border border-pink-100 p-5 sm:p-7 space-y-4">
            <div className="text-sm sm:text-base text-[#4a2336] leading-relaxed whitespace-pre-line font-sans">
              {fullText.slice(0, typedLength)}
              {typedLength < fullText.length && (
                <span className="inline-block w-0.5 h-5 bg-rose-500 ml-1 animate-pulse align-middle" />
              )}
            </div>

            {typedLength < fullText.length && (
              <button
                type="button"
                onClick={() => setTypedLength(fullText.length)}
                className="text-xs font-semibold text-rose-500 hover:underline cursor-pointer"
              >
                Tampilkan seluruh surat
              </button>
            )}
          </div>

          {/* Emotional Closing & One More Hug */}
          <div className="text-center space-y-4 pt-2">
            <p className="font-handwriting text-3xl sm:text-4xl font-bold text-rose-600">
              Thank You For Being My Home 💗
            </p>
            <button
              type="button"
              onClick={handleOneMoreHug}
              className="min-h-[52px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-display font-semibold text-base shadow-lg shadow-rose-300/40 hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span>One More Hug</span>
            </button>
            {hugCount > 0 && (
              <p className="text-xs font-semibold text-rose-500">
                Pelukan ekstra terkirim ({hugCount}x) — Aku sayang kamu, Diann!
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
