import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Mail, MailOpen, Shuffle } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { playChime } from '../lib/sound';

export const LoveLetterPage: React.FC = () => {
  const { loveLetters } = useAppData();
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [typedText, setTypedText] = useState('');

  const letter = loveLetters[index] || loveLetters[0];

  useEffect(() => {
    if (!opened || !letter) {
      setTypedText('');
      return;
    }
    setTypedText('');
    let cursor = 0;
    const timer = window.setInterval(() => {
      cursor += 2;
      setTypedText(letter.body.slice(0, cursor));
      if (cursor >= letter.body.length) {
        window.clearInterval(timer);
      }
    }, 22);
    return () => window.clearInterval(timer);
  }, [opened, letter]);

  const handleOpen = () => {
    playChime([523.25, 659.25, 783.99], 95);
    setOpened(true);
  };

  const handleNext = () => {
    playChime([587.33, 783.99], 80);
    setIndex((i) => (i + 1) % loveLetters.length);
    setOpened(true);
  };

  const handleRandom = () => {
    playChime([523.25, 659.25, 987.77], 85);
    if (loveLetters.length <= 1) return;
    let next = Math.floor(Math.random() * loveLetters.length);
    if (next === index) next = (index + 1) % loveLetters.length;
    setIndex(next);
    setOpened(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Love Letter · Surat {index + 1} dari {loveLetters.length}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Surat Cinta Untuk Diann 💌
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRandom}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-pink-200 text-rose-600 text-xs sm:text-sm font-semibold hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Acak</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Letter</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope-closed"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-3xl bg-gradient-to-br from-[#fff5f8] to-[#f8f0ff] border border-pink-200 shadow-sm p-8 sm:p-12 text-center space-y-5"
          >
            <button
              type="button"
              onClick={handleOpen}
              className="mx-auto w-36 h-28 rounded-2xl bg-white border border-pink-200 shadow-md hover:shadow-lg transition-transform hover:-translate-y-1 flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <Mail className="w-9 h-9 text-rose-500" />
              <span className="text-xs font-semibold text-rose-600">Buka Surat</span>
            </button>
            <p className="font-handwriting text-2xl text-[#4a2336]">
              Ada {loveLetters.length} surat kecil yang bisa kamu baca kapan pun lagi kangen
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={letter.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold">
                <MailOpen className="w-4 h-4" />
                <span>{letter.title}</span>
              </div>
              <span className="text-xs text-[#7c5a6c] tabular-nums">
                #{index + 1} / {loveLetters.length}
              </span>
            </div>

            <p className="font-handwriting text-2xl sm:text-[28px] text-[#4a2336] leading-relaxed min-h-[120px]">
              {typedText}
              {typedText.length < letter.body.length && (
                <span className="inline-block w-0.5 h-6 bg-rose-400 ml-1 animate-pulse align-middle" />
              )}
            </p>

            <div className="pt-2 flex items-center justify-between text-sm">
              <span className="font-handwriting text-xl text-rose-500">— {letter.author}</span>
              {typedText.length < letter.body.length && (
                <button
                  type="button"
                  onClick={() => setTypedText(letter.body)}
                  className="text-xs text-[#7c5a6c] hover:text-rose-500 cursor-pointer"
                >
                  Tampilkan langsung
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
