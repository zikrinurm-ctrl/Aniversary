import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, Heart, RotateCcw, XCircle } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { playGentlePop, playSoftError } from '../lib/sound';

export const LoveQuizPage: React.FC = () => {
  const { quizQuestions } = useAppData();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const current = quizQuestions[currentIdx];
  const total = quizQuestions.length;
  const progressPct = Math.round(((currentIdx + (completed ? 1 : 0)) / Math.max(1, total)) * 100);

  const handleChoose = (optIdx: number) => {
    if (selectedOption !== null || !current) return;
    setSelectedOption(optIdx);
    if (optIdx === current.correctIndex) {
      playGentlePop();
      setCorrectCount((c) => c + 1);
    } else {
      playSoftError();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= total) {
      setCompleted(true);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedOption(null);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setCompleted(false);
  };

  const getRomanticResult = (scorePct: number) => {
    if (scorePct >= 85) {
      return {
        title: 'Soulmate Terkonfirmasi!',
        msg: 'Kamu hafal dan mengerti banget ritme hati kita berdua. Terima kasih sudah selalu hadir sepenuh hati!',
      };
    }
    if (scorePct >= 60) {
      return {
        title: 'Pasangan Paling Kompak!',
        msg: 'Nilai yang manis banget! Sedikit perbedaan justru bikin kita selalu punya hal baru untuk diceritakan bersama.',
      };
    }
    return {
      title: 'Saatnya Ngedate Lebih Lama!',
      msg: 'Haha, berarti ini tanda kita harus sering-sering ngobrol santai sambil makan es krim biar makin kenal luar dalam!',
    };
  };

  if (completed) {
    const pct = Math.round((correctCount / Math.max(1, total)) * 100);
    const res = getRomanticResult(pct);
    return (
      <div className="max-w-xl mx-auto rounded-3xl bg-white border border-pink-100 shadow-sm p-8 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <p className="text-xs font-semibold text-rose-500">Hasil Love Quiz</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">{res.title}</h1>
        <div className="font-display text-4xl font-bold text-rose-600 tabular-nums">
          {correctCount} / {total} ({pct}%)
        </div>
        <p className="text-sm sm:text-base text-[#5e3c4e] leading-relaxed">{res.msg}</p>
        <button
          type="button"
          onClick={handleRestart}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold text-sm hover:bg-rose-600 inline-flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Ulangi Kuis</span>
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Love Quiz · Pertanyaan {currentIdx + 1} dari {total}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Seberapa Kenal Kita?
          </h1>
        </div>
        <span className="text-sm font-semibold text-[#4a2336] tabular-nums">
          Benar: {correctCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2.5 rounded-full bg-pink-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 sm:p-7 space-y-5">
        <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336] leading-snug">
          {current.question}
        </h2>

        <div className="space-y-2.5">
          {current.options.map((option, idx) => {
            const isChosen = selectedOption === idx;
            const isCorrect = idx === current.correctIndex;
            let btnClass = 'bg-[#fff9fb] border-pink-100 text-[#4a2336] hover:bg-pink-50';
            if (selectedOption !== null) {
              if (isCorrect) {
                btnClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
              } else if (isChosen) {
                btnClass = 'bg-rose-50 border-rose-300 text-rose-800';
              } else {
                btnClass = 'bg-white border-pink-50 text-[#9c7b8c]';
              }
            }
            return (
              <button
                key={idx}
                type="button"
                disabled={selectedOption !== null}
                onClick={() => handleChoose(idx)}
                className={`w-full min-h-[48px] px-4 py-3 rounded-2xl border text-left text-sm sm:text-base transition-colors flex items-center justify-between gap-3 cursor-pointer ${btnClass}`}
              >
                <span>{option}</span>
                {selectedOption !== null && isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {selectedOption !== null && isChosen && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="rounded-2xl bg-pink-50/70 border border-pink-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs sm:text-sm text-[#5e3c4e]">{current.explanation}</p>
            <button
              type="button"
              onClick={handleNext}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>{currentIdx + 1 >= total ? 'Lihat Hasil' : 'Selanjutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
