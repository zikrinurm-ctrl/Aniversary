import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Volume2, VolumeX } from 'lucide-react';
import { playHugHeartbeat } from '../lib/sound';
import { idbGet, idbSet } from '../lib/indexedDb';

const HUG_COUNT_KEY = 'virtual_hug_count_v1';

export const VirtualHugPage: React.FC = () => {
  const [hugging, setHugging] = useState(false);
  const [hugCount, setHugCount] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    void idbGet<number>(HUG_COUNT_KEY).then((count) => {
      if (typeof count === 'number') setHugCount(count);
    });
  }, []);

  const triggerHug = () => {
    setHugging(true);
    const next = hugCount + 1;
    setHugCount(next);
    void idbSet(HUG_COUNT_KEY, next);
    if (soundOn) playHugHeartbeat();

    window.setTimeout(() => {
      setHugging(false);
    }, 2600);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">Virtual Hug</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Pelukan Virtual Hangat 🤗
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setSoundOn((s) => !s)}
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white border border-pink-100 text-xs font-semibold text-[#6b485b] inline-flex items-center gap-1.5 cursor-pointer"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-rose-500" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundOn ? 'Efek Suara Aktif' : 'Suara Mati'}</span>
        </button>
      </div>

      <div className="rounded-3xl bg-gradient-to-b from-[#fff5f9] via-[#fdf2f8] to-[#f6efff] border border-pink-100 shadow-sm p-6 sm:p-10 text-center space-y-6 overflow-hidden relative">
        {/* Bursting Floating Hearts during hug */}
        {hugging && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {[-70, -35, 0, 35, 70].map((offset, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, x: offset, scale: 0.6 }}
                animate={{ opacity: [0, 1, 0], y: -110, scale: [0.6, 1.25, 0.9] }}
                transition={{ duration: 1.8, delay: idx * 0.1 }}
                className="absolute text-rose-500"
              >
                <Heart className="w-6 h-6 fill-current" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Two Cute Characters Moving Toward Each Other */}
        <div className="relative h-44 flex items-center justify-center">
          {/* Zikri Cute Character */}
          <motion.div
            animate={{ x: hugging ? 26 : -36, scale: hugging ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 16 }}
            className="flex flex-col items-center"
          >
            <svg viewBox="0 0 100 110" className="w-24 h-28">
              <circle cx="50" cy="40" r="24" fill="#fde68a" stroke="#4a2336" strokeWidth="2.5" />
              <path d="M27 36 Q50 10 73 36 Q66 20 50 20 Q34 20 27 36 Z" fill="#4a2336" />
              <circle cx="42" cy="42" r="2.8" fill="#4a2336" />
              <circle cx="58" cy="42" r="2.8" fill="#4a2336" />
              <circle cx="36" cy="48" r="3.5" fill="#fda4af" />
              <circle cx="64" cy="48" r="3.5" fill="#fda4af" />
              <path d="M44 50 Q50 55 56 50" fill="none" stroke="#4a2336" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="30" y="64" width="40" height="36" rx="14" fill="#93c5fd" stroke="#4a2336" strokeWidth="2.5" />
            </svg>
            <span className="text-xs font-semibold text-[#4a2336]">Zikri</span>
          </motion.div>

          {/* Center Heart Pulse */}
          <motion.div
            animate={hugging ? { scale: [0.8, 1.4, 1.1], opacity: 1 } : { scale: 0.85, opacity: 0.35 }}
            transition={{ duration: 0.5 }}
            className="z-10 text-rose-500 -mx-2"
          >
            <Heart className="w-8 h-8 fill-current" />
          </motion.div>

          {/* Diann Cute Character */}
          <motion.div
            animate={{ x: hugging ? -26 : 36, scale: hugging ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 16 }}
            className="flex flex-col items-center"
          >
            <svg viewBox="0 0 100 110" className="w-24 h-28">
              <path d="M22 44 Q22 14 50 14 Q78 14 78 44 L80 68 Q72 64 68 58 L32 58 Q28 64 20 68 Z" fill="#4a2336" />
              <circle cx="50" cy="42" r="23" fill="#ffedd5" stroke="#4a2336" strokeWidth="2.5" />
              <circle cx="42" cy="43" r="2.8" fill="#4a2336" />
              <circle cx="58" cy="43" r="2.8" fill="#4a2336" />
              <circle cx="36" cy="49" r="3.5" fill="#fda4af" />
              <circle cx="64" cy="49" r="3.5" fill="#fda4af" />
              <path d="M44 51 Q50 56 56 51" fill="none" stroke="#4a2336" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="30" y="65" width="40" height="36" rx="14" fill="#f9a8d4" stroke="#4a2336" strokeWidth="2.5" />
            </svg>
            <span className="text-xs font-semibold text-[#4a2336]">Diann</span>
          </motion.div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-rose-600">
            {hugging ? 'Sending You A Big Hug 💗' : 'Lagi Kangen atau Capek?'}
          </h2>
          <p className="text-sm text-[#5e3c4e]">
            {hugging
              ? 'Pelukan virtual terkirim erat! Semoga hatimu langsung terasa lebih hangat.'
              : 'Tekan tombol di bawah kapan pun kamu butuh pelukan hangat instan.'}
          </p>
        </div>

        <button
          type="button"
          onClick={triggerHug}
          className="min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-display font-semibold text-base shadow-lg shadow-rose-200 hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span>{hugging ? 'Memeluk Erat...' : 'Peluk Sekarang'}</span>
        </button>

        <p className="text-xs text-[#7c5a6c] tabular-nums">
          Total pelukan dikirim: {hugCount} kali
        </p>
      </div>
    </div>
  );
};
