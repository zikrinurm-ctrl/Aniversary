import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MailOpen, Sparkles } from 'lucide-react';
import { WELCOME_ENVELOPE_IMAGE } from '../data/seedCore';
import { CountdownBreakdown, formatWitTime } from '../lib/time';
import { playChime } from '../lib/sound';

interface WelcomeViewProps {
  coupleNames: string;
  countdown: CountdownBreakdown;
  nowMs: number;
  onEnter: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  coupleNames,
  countdown,
  nowMs,
  onEnter,
}) => {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);

  const handleOpenEnvelope = () => {
    playChime([523.25, 659.25, 783.99], 100);
    setEnvelopeOpened(true);
  };

  const handleEnterSurprise = () => {
    playChime([587.33, 739.99, 880, 1174.66], 90);
    onEnter();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-b from-[#fff5f8] via-[#fdf2f8] to-[#f6f0ff]">
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Live real-time WIT Countdown immediately visible on the very first screen */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 rounded-3xl bg-white/85 backdrop-blur-md border border-pink-100 shadow-sm px-5 py-4 text-center"
        >
          <p className="text-xs font-medium text-rose-500 tracking-wide">
            {countdown.isAnniversaryReached
              ? '20 November 2026 · Selamat Anniversary Pertama!'
              : `Menuju 20 November 2026 · 00:00:00 WIT · Jam ${formatWitTime(nowMs)} WIT`}
          </p>
          {!countdown.isAnniversaryReached ? (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Hari', val: countdown.days },
                { label: 'Jam', val: countdown.hours },
                { label: 'Menit', val: countdown.minutes },
                { label: 'Detik', val: countdown.seconds },
              ].map((unit) => (
                <div
                  key={unit.label}
                  className="rounded-2xl bg-gradient-to-b from-pink-50/90 to-purple-50/70 py-2.5 px-2 border border-pink-100/80"
                >
                  <div className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336] tabular-nums">
                    {String(unit.val).padStart(2, '0')}
                  </div>
                  <div className="text-[11px] font-medium text-rose-400">{unit.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 font-display text-xl sm:text-2xl font-bold text-rose-600">
              Happy First Anniversary, {coupleNames}!
            </p>
          )}
        </motion.div>

        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl bg-white/90 backdrop-blur-md border border-pink-100 shadow-xl shadow-pink-200/30 overflow-hidden"
        >
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-pink-50">
            <img
              src={WELCOME_ENVELOPE_IMAGE}
              alt="Amplop surat cinta pastel dengan bunga peony"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <p className="text-xs font-medium text-pink-100">
                {coupleNames} · Our Little World
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                Hi, My Favorite Person 💗
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 text-center">
            <AnimatePresence mode="wait">
              {!envelopeOpened ? (
                <motion.div
                  key="closed-envelope"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-5"
                >
                  <button
                    type="button"
                    onClick={handleOpenEnvelope}
                    className="group mx-auto flex flex-col items-center justify-center w-44 h-32 rounded-2xl bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 border border-pink-200 shadow-sm hover:shadow-md transition-transform active:scale-[0.98] cursor-pointer"
                    aria-label="Buka amplop surat pembuka"
                  >
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm mb-2"
                    >
                      <Heart className="w-6 h-6 fill-current" />
                    </motion.div>
                    <span className="text-sm font-semibold text-rose-700">
                      Ketuk Untuk Buka Amplop
                    </span>
                  </button>
                  <p className="text-sm text-[#6b485b] max-w-md mx-auto leading-relaxed">
                    Ada sebuah surat pembuka dan dunia kecil yang kubuat khusus untuk merayakan satu tahun pertama kita.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="opened-letter"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl bg-[#fff8fa] border border-pink-100 p-5 sm:p-6 text-left">
                    <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold mb-2">
                      <MailOpen className="w-4 h-4" />
                      <span>Surat Pembuka Untuk Diann</span>
                    </div>
                    <p className="font-handwriting text-2xl sm:text-[26px] text-[#4a2336] leading-snug">
                      Hai sayangku Diann, selamat datang di Our Little World.
                    </p>
                    <p className="mt-3 text-sm sm:text-base text-[#5e3c4e] leading-relaxed">
                      Sejak 20 November 2025, setiap hari bersamamu menjadi bab favorit dalam hidupku. Di dalam website ini ada hitungan mundur hari jadi kita, kue tiup lilin, permainan berdua, lagu-lagu kita, album kenangan, dan pesan rahasia yang menunggu untuk dibuka.
                    </p>
                    <p className="mt-3 font-handwriting text-xl text-rose-500 text-right">
                      — Dari Zikri, dengan sepenuh hati
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEnterSurprise}
                    className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white font-display font-semibold text-base shadow-lg shadow-rose-300/40 hover:brightness-105 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Open Your Surprise</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
