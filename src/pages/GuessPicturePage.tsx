import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, HelpCircle, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { SEED_GUESS_PICTURES } from '../data/gamesData';
import { GuessPictureScene } from '../components/GuessPictureScene';
import { playGentlePop, playSoftError } from '../lib/sound';

export const GuessPicturePage: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [finished, setFinished] = useState(false);

  const puzzle = SEED_GUESS_PICTURES[index];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || feedback === 'correct') return;

    const clean = answer.trim().toLowerCase();
    const isMatch = puzzle.answers.some((a) => clean === a || clean.includes(a) || a.includes(clean) && clean.length >= 3);

    if (isMatch) {
      playGentlePop();
      setFeedback('correct');
      setScore((s) => s + (showHint ? 5 : 10));
    } else {
      playSoftError();
      setFeedback('wrong');
    }
  };

  const handleNext = () => {
    if (index + 1 >= SEED_GUESS_PICTURES.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer('');
    setShowHint(false);
    setFeedback('idle');
  };

  const handleRestart = () => {
    setIndex(0);
    setAnswer('');
    setScore(0);
    setShowHint(false);
    setFeedback('idle');
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white border border-pink-100 p-8 text-center space-y-5">
        <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="font-display text-2xl font-bold text-[#4a2336]">
          Semua 32 Level Selesai!
        </h1>
        <p className="text-base text-[#5e3c4e]">
          Total Skor Akhir: <span className="font-bold text-rose-600 tabular-nums">{score}</span>
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 inline-flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Main Lagi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Tebak Gambar · Level {puzzle.level} dari {SEED_GUESS_PICTURES.length}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Guess The Picture
          </h1>
        </div>
        <div className="text-sm font-semibold text-[#4a2336] inline-flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="tabular-nums">Skor: {score}</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 sm:p-6 space-y-5">
        <GuessPictureScene
          sceneType={puzzle.sceneType}
          imageUrl={puzzle.imageUrl}
          title={puzzle.title}
        />

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[#4a2336]">{puzzle.title}</span>
          <button
            type="button"
            onClick={() => setShowHint((h) => !h)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showHint ? 'Tutup Petunjuk' : 'Lihat Petunjuk'}</span>
          </button>
        </div>

        {showHint && (
          <p className="rounded-xl bg-[#faf5ff] border border-purple-100 px-4 py-2.5 text-xs sm:text-sm text-purple-800">
            Petunjuk: {puzzle.hint}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (feedback === 'wrong') setFeedback('idle');
            }}
            placeholder="Ketik jawabanmu di sini..."
            disabled={feedback === 'correct'}
            className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm text-[#4a2336] focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            type="submit"
            disabled={feedback === 'correct'}
            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 disabled:opacity-50 cursor-pointer"
          >
            Cek Jawaban
          </button>
        </form>

        {feedback === 'correct' && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Benar! Jawabannya memang “{puzzle.answers[0]}”.</span>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[40px] px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {feedback === 'wrong' && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-700 text-sm">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>Belum tepat, coba tebak lagi atau buka petunjuk ya!</span>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="text-xs font-semibold text-rose-600 hover:underline shrink-0 cursor-pointer"
            >
              Lewati Soal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
