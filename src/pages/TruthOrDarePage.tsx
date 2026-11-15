import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, History, RefreshCw, Shuffle, SkipForward, Trophy } from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { TruthOrDareCategory, TruthOrDareItem } from '../types';
import { playGentlePop } from '../lib/sound';

const CATEGORIES: TruthOrDareCategory[] = [
  'Romantic',
  'Funny',
  'Deep Talk',
  'Relationship',
  'Jealousy',
  'Childhood',
  'Future',
  'Random',
];

export const TruthOrDarePage: React.FC = () => {
  const { truthOrDareList } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<'All' | TruthOrDareCategory>('All');
  const [currentItem, setCurrentItem] = useState<TruthOrDareItem | null>(null);
  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<Array<{ item: TruthOrDareItem; status: 'selesai' | 'skip' }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  const pool = useMemo(() => {
    if (selectedCategory === 'All') return truthOrDareList;
    return truthOrDareList.filter((i) => i.category === selectedCategory);
  }, [selectedCategory, truthOrDareList]);

  const remainingForKind = (kind?: 'truth' | 'dare') => {
    const filtered = kind ? pool.filter((i) => i.kind === kind) : pool;
    const unused = filtered.filter((i) => !usedIds.includes(i.id));
    return { filtered, unused };
  };

  const drawPrompt = (kind?: 'truth' | 'dare') => {
    playGentlePop();
    const { filtered, unused } = remainingForKind(kind);
    if (filtered.length === 0) return;

    let candidates = unused;
    let nextUsed = [...usedIds];
    if (candidates.length === 0) {
      // Category exhausted -> reset only IDs belonging to this filtered slice
      const filteredIds = new Set(filtered.map((i) => i.id));
      nextUsed = nextUsed.filter((id) => !filteredIds.has(id));
      candidates = filtered;
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    setUsedIds([...nextUsed, picked.id]);
    setCurrentItem(picked);
  };

  const handleCompleteAndNext = () => {
    if (currentItem) {
      setScore((s) => s + 10);
      setHistory((prev) => [{ item: currentItem, status: 'selesai' }, ...prev]);
    }
    drawPrompt();
  };

  const handleSkip = () => {
    if (currentItem) {
      setHistory((prev) => [{ item: currentItem, status: 'skip' }, ...prev]);
    }
    drawPrompt(currentItem?.kind);
  };

  const remainingTotal = remainingForKind().unused.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Truth or Dare · {truthOrDareList.length} Kartu Tersedia
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Truth or Dare Berdua 💗
          </h1>
        </div>

        <div className="flex items-center gap-3 text-sm font-semibold text-[#4a2336]">
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="tabular-nums">Skor: {score}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-pink-100 text-xs text-[#6b485b] hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Riwayat ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 bg-white/80 p-2 rounded-2xl border border-pink-100">
        {(['All', ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-[#6b485b] hover:bg-pink-50'
            }`}
          >
            {cat === 'All' ? 'Semua Kategori' : cat}
          </button>
        ))}
      </div>

      {/* Mode Picker Buttons */}
      <div className="grid grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => drawPrompt('truth')}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-pink-500 text-white font-display font-semibold text-sm hover:bg-pink-600 transition-colors cursor-pointer"
        >
          Truth
        </button>
        <button
          type="button"
          onClick={() => drawPrompt('dare')}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-purple-500 text-white font-display font-semibold text-sm hover:bg-purple-600 transition-colors cursor-pointer"
        >
          Dare
        </button>
        <button
          type="button"
          onClick={() => drawPrompt()}
          className="min-h-[48px] px-4 py-3 rounded-2xl bg-white border border-pink-200 text-rose-600 font-display font-semibold text-sm hover:bg-pink-50 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>Random</span>
        </button>
      </div>

      {/* Active Prompt Card */}
      <AnimatePresence mode="wait">
        {currentItem ? (
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
              <span>
                {currentItem.kind === 'truth' ? 'TRUTH' : 'DARE'} · {currentItem.category}
              </span>
              <span className="tabular-nums">
                Sisa kategori ini: {remainingTotal} / {pool.length}
              </span>
            </div>

            <p className="font-display text-xl sm:text-2xl font-semibold text-[#4a2336] leading-relaxed">
              {currentItem.prompt}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleCompleteAndNext}
                className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm hover:brightness-105 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4" />
                <span>Selesai (+10 Poin) & Next</span>
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-pink-50 text-rose-600 font-semibold text-sm hover:bg-pink-100 cursor-pointer inline-flex items-center gap-1.5"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl bg-white border border-pink-100 p-8 text-center space-y-3">
            <p className="font-display text-lg font-semibold text-[#4a2336]">
              Siap bermain Truth or Dare?
            </p>
            <p className="text-sm text-[#7c5a6c]">
              Pilih kategori di atas lalu tekan tombol Truth, Dare, atau Random. Pertanyaan tidak akan berulang sebelum seluruh isi kategori habis!
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* History Drawer */}
      {showHistory && (
        <div className="rounded-3xl bg-white border border-pink-100 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#4a2336]">Riwayat Bermain</h2>
            {usedIds.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setUsedIds([]);
                  setHistory([]);
                  setScore(0);
                }}
                className="text-xs font-semibold text-rose-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Sesi</span>
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-[#7c5a6c]">Belum ada pertanyaan yang diselesaikan di sesi ini.</p>
          ) : (
            <ul className="divide-y divide-pink-100 max-h-64 overflow-y-auto">
              {history.map((h, i) => (
                <li key={`${h.item.id}-${i}`} className="py-2.5 text-sm">
                  <div className="text-xs text-[#7c5a6c]">
                    {h.item.kind.toUpperCase()} · {h.item.category} ·{' '}
                    {h.status === 'selesai' ? 'Selesai (+10)' : 'Dilewati'}
                  </div>
                  <div className="text-[#4a2336] mt-0.5">{h.item.prompt}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
