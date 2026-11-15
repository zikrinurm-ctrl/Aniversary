import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Disc3,
  Heart,
  HelpCircle,
  Link2,
  Music,
  RotateCcw,
  Smile,
  Sparkles,
  Trophy,
  Users,
  Volume2,
  XCircle,
} from 'lucide-react';
import { PlayTogetherHub } from '../components/PlayTogetherHub';
import { useCouple } from '../contexts/CoupleContext';
import { EMOJI_PUZZLES, GUESS_SONG_ITEMS, WHEEL_REWARDS } from '../data/gamesData';
import { playChime, playGentlePop, playMelodyNotes, playSoftError } from '../lib/sound';
import { PageId } from '../types';

type GameTab = 'tictactoe' | 'emoji' | 'song' | 'lovemeter' | 'wheel';

export const MiniGamesPage: React.FC<{ onNavigate?: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const { coupleSpace, isPaired } = useCouple();
  const [playMode, setPlayMode] = useState<'together' | 'solo'>(() =>
    coupleSpace ? 'together' : 'solo'
  );
  const [activeTab, setActiveTab] = useState<GameTab>('tictactoe');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-rose-500">
            Mini Games · Main Sendiri & Play Together Real-Time
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336]">
            Arena Bermain Zikri & Diann
          </h1>
        </div>

        <div className="inline-flex bg-white p-1 rounded-2xl border border-pink-100">
          <button
            type="button"
            onClick={() => setPlayMode('together')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
              playMode === 'together' ? 'bg-rose-500 text-white' : 'text-[#6b485b]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Play Together</span>
          </button>
          <button
            type="button"
            onClick={() => setPlayMode('solo')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
              playMode === 'solo' ? 'bg-rose-500 text-white' : 'text-[#6b485b]'
            }`}
          >
            Main Sendiri
          </button>
        </div>
      </div>

      {playMode === 'together' ? (
        coupleSpace ? (
          <div className="space-y-4">
            {!isPaired && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                Kamu sudah di Couple Space, namun pasangan belum bergabung (1/2 anggota). Bagikan kode undangan di halaman Our Connection agar giliran & skor bisa dimainkan dua perangkat bersama.
              </div>
            )}
            <PlayTogetherHub />
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-8 text-center space-y-4">
            <Users className="w-10 h-10 text-rose-500 mx-auto" />
            <h2 className="font-display text-xl font-bold text-[#4a2336]">
              Hubungkan Couple Space untuk Play Together Real-Time
            </h2>
            <p className="text-sm text-[#6b485b] max-w-md mx-auto">
              10 game real-time multiplayer (Tic Tac Toe, Connect Four, Memory Match, Couple Quiz Battle, Tebak Emoji, Truth or Dare, Spin The Wheel, This or That, Who Knows Better?, dan Tebak Lagu) akan tersinkronisasi di dua perangkat setelah kedua akun terhubung di Our Connection.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('connection')}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Buka Our Connection</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setPlayMode('solo')}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-pink-50 text-rose-600 text-sm font-semibold hover:bg-pink-100 cursor-pointer"
              >
                Main Mode Solo Dulu
              </button>
            </div>
          </div>
        )
      ) : (
        <>
          {/* Game Switcher Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-white/85 p-2 rounded-2xl border border-pink-100">
            {[
              { id: 'tictactoe' as GameTab, label: 'Tic Tac Toe' },
              { id: 'emoji' as GameTab, label: 'Tebak Emoji' },
              { id: 'song' as GameTab, label: 'Tebak Lagu' },
              { id: 'lovemeter' as GameTab, label: 'Love Meter' },
              { id: 'wheel' as GameTab, label: 'Spin The Wheel' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-rose-500 text-white' : 'text-[#6b485b] hover:bg-pink-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'tictactoe' && <TicTacToeGame />}
          {activeTab === 'emoji' && <GuessEmojiGame />}
          {activeTab === 'song' && <GuessSongGame />}
          {activeTab === 'lovemeter' && <LoveMeterGame />}
          {activeTab === 'wheel' && <SpinWheelGame />}
        </>
      )}
    </div>
  );
};

// 1. Tic Tac Toe (vs Smart Bot or 2 Player)
const TicTacToeGame: React.FC = () => {
  const [board, setBoard] = useState<Array<'💗' | '✨' | null>>(Array(9).fill(null));
  const [turn, setTurn] = useState<'💗' | '✨'>('💗');
  const [vsBot, setVsBot] = useState(true);
  const [scores, setScores] = useState({ heart: 0, star: 0, draw: 0 });

  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  const checkWinner = (b: Array<'💗' | '✨' | null>): '💗' | '✨' | 'draw' | null => {
    for (const [a, c, d] of lines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    if (b.every((cell) => cell !== null)) return 'draw';
    return null;
  };

  const winner = checkWinner(board);

  const pickBotMove = (b: Array<'💗' | '✨' | null>): number => {
    const empty = b.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
    for (const sym of ['✨', '💗'] as const) {
      for (const idx of empty) {
        const copy = [...b];
        copy[idx] = sym;
        if (checkWinner(copy) === sym) return idx;
      }
    }
    if (b[4] === null) return 4;
    return empty[Math.floor(Math.random() * empty.length)];
  };

  const applyWinScore = (res: '💗' | '✨' | 'draw' | null) => {
    if (!res) return;
    playChime([523.25, 659.25, 783.99], 90);
    setScores((prev) => ({
      heart: prev.heart + (res === '💗' ? 1 : 0),
      star: prev.star + (res === '✨' ? 1 : 0),
      draw: prev.draw + (res === 'draw' ? 1 : 0),
    }));
  };

  const handleCell = (idx: number) => {
    if (board[idx] || winner) return;
    playGentlePop();
    const next = [...board];
    next[idx] = turn;
    const res1 = checkWinner(next);
    setBoard(next);
    if (res1) {
      applyWinScore(res1);
      return;
    }

    if (vsBot) {
      const botIdx = pickBotMove(next);
      if (botIdx !== undefined) {
        next[botIdx] = '✨';
        const res2 = checkWinner(next);
        setBoard([...next]);
        if (res2) applyWinScore(res2);
      }
    } else {
      setTurn(turn === '💗' ? '✨' : '💗');
    }
  };

  const resetBoard = () => {
    setBoard(Array(9).fill(null));
    setTurn('💗');
  };

  return (
    <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-[#4a2336]">Tic Tac Toe Romantis</h2>
          <p className="text-xs text-[#7c5a6c]">
            💗 {scores.heart} · Seri {scores.draw} · ✨ {scores.star}
          </p>
        </div>
        <div className="flex gap-1.5 bg-pink-50 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setVsBot(true);
              resetBoard();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              vsBot ? 'bg-white text-rose-600 shadow-xs' : 'text-[#6b485b]'
            }`}
          >
            Lawan Bot
          </button>
          <button
            type="button"
            onClick={() => {
              setVsBot(false);
              resetBoard();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              !vsBot ? 'bg-white text-rose-600 shadow-xs' : 'text-[#6b485b]'
            }`}
          >
            Berdua (2P)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5 max-w-[270px] mx-auto">
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleCell(i)}
            className="h-20 rounded-2xl bg-[#fff8fa] border border-pink-200 text-3xl flex items-center justify-center hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
          >
            {cell}
          </button>
        ))}
      </div>

      <div className="text-center space-y-3">
        <p className="text-sm font-semibold text-[#4a2336]">
          {winner === 'draw'
            ? 'Hasil Seri! Sama-sama jago!'
            : winner
            ? `Pemenangnya adalah ${winner}!`
            : `Giliran: ${turn}`}
        </p>
        <button
          type="button"
          onClick={resetBoard}
          className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Main Lagi</span>
        </button>
      </div>
    </div>
  );
};

// 2. Guess The Emoji
const GuessEmojiGame: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [done, setDone] = useState(false);

  const item = EMOJI_PUZZLES[idx];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'correct') return;
    const clean = input.trim().toLowerCase();
    const ok = item.answers.some((a) => clean === a || clean.includes(a) || (a.includes(clean) && clean.length >= 4));
    if (ok) {
      playGentlePop();
      setStatus('correct');
      setScore((s) => s + 10);
    } else {
      playSoftError();
      setStatus('wrong');
    }
  };

  const handleNext = () => {
    if (idx + 1 >= EMOJI_PUZZLES.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setInput('');
    setShowHint(false);
    setStatus('idle');
  };

  const restart = () => {
    setIdx(0);
    setInput('');
    setScore(0);
    setShowHint(false);
    setStatus('idle');
    setDone(false);
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-white border border-pink-100 p-8 text-center space-y-4">
        <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="font-display text-xl font-bold text-[#4a2336]">Tebak Emoji Selesai!</h2>
        <p className="text-sm text-[#5e3c4e]">Skor kamu: <span className="font-bold text-rose-600 tabular-nums">{score}</span></p>
        <button
          type="button"
          onClick={restart}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Replay</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
        <span className="inline-flex items-center gap-1"><Smile className="w-4 h-4 text-rose-500" /> Soal {idx + 1} / {EMOJI_PUZZLES.length}</span>
        <span className="tabular-nums">Skor: {score}</span>
      </div>

      <div className="rounded-2xl bg-[#fff8fa] border border-pink-100 py-8 text-center text-4xl sm:text-5xl tracking-widest">
        {item.emojis}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="text-xs font-semibold text-purple-600 inline-flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'Tutup Petunjuk' : 'Petunjuk'}</span>
        </button>
      </div>

      {showHint && <p className="text-xs text-purple-700 bg-purple-50 rounded-xl p-3">{item.hint}</p>}

      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (status === 'wrong') setStatus('idle');
          }}
          placeholder="Tebak arti rangkaian emoji ini..."
          disabled={status === 'correct'}
          className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
        />
        <button
          type="submit"
          disabled={status === 'correct'}
          className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer"
        >
          Cek
        </button>
      </form>

      {status === 'correct' && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Benar: {item.displayAnswer}!</span>
          <button type="button" onClick={handleNext} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer">Next</button>
        </div>
      )}

      {status === 'wrong' && (
        <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          <span className="inline-flex items-center gap-1.5"><XCircle className="w-4 h-4" /> Belum tepat, coba lagi!</span>
          <button type="button" onClick={handleNext} className="font-semibold underline cursor-pointer">Lewati</button>
        </div>
      )}
    </div>
  );
};

// 3. Guess The Song
const GuessSongGame: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const item = GUESS_SONG_ITEMS[idx];

  const handleChoose = (optIdx: number) => {
    if (chosen !== null) return;
    setChosen(optIdx);
    if (optIdx === item.correctIndex) {
      playGentlePop();
      setScore((s) => s + 10);
    } else {
      playSoftError();
    }
  };

  const handleNext = () => {
    if (idx + 1 >= GUESS_SONG_ITEMS.length) {
      setDone(true);
      return;
    }
    setIdx((i) => i + 1);
    setChosen(null);
  };

  const restart = () => {
    setIdx(0);
    setChosen(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="rounded-3xl bg-white border border-pink-100 p-8 text-center space-y-4">
        <Music className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="font-display text-xl font-bold text-[#4a2336]">Tebak Lagu Selesai!</h2>
        <p className="text-sm text-[#5e3c4e]">Skor akhir: <span className="font-bold text-rose-600 tabular-nums">{score}</span> / {GUESS_SONG_ITEMS.length * 10}</p>
        <button
          type="button"
          onClick={restart}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Main Lagi</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
        <span>Lagu {idx + 1} / {GUESS_SONG_ITEMS.length}</span>
        <span className="tabular-nums">Skor: {score}</span>
      </div>

      <div className="rounded-2xl bg-[#fff8fa] border border-pink-100 p-5 space-y-3">
        <p className="text-sm sm:text-base font-medium text-[#4a2336] italic">{item.lyricClue}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-[#7c5a6c]">Hint: {item.hint}</span>
          <button
            type="button"
            onClick={() => playMelodyNotes(item.melody)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Putar Nada Clue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {item.options.map((opt, i) => {
          let cls = 'bg-white border-pink-200 text-[#4a2336] hover:bg-pink-50';
          if (chosen !== null) {
            if (i === item.correctIndex) cls = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
            else if (i === chosen) cls = 'bg-rose-50 border-rose-300 text-rose-800';
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={chosen !== null}
              onClick={() => handleChoose(i)}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl border text-left text-xs sm:text-sm cursor-pointer ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {chosen !== null && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer"
          >
            Lagu Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};

// 4. Love Meter
const LoveMeterGame: React.FC = () => {
  const [name1, setName1] = useState('Zikri');
  const [name2, setName2] = useState('Diann');
  const [score, setScore] = useState<number | null>(null);
  const [reading, setReading] = useState('');

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    playChime([523.25, 659.25, 783.99, 1046.5], 90);
    const a = name1.trim().toLowerCase();
    const b = name2.trim().toLowerCase();
    const isCouple = (a.includes('zikri') && b.includes('diann')) || (a.includes('diann') && b.includes('zikri'));
    let val = 99;
    if (!isCouple) {
      const sum = [...(a + b)].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      val = 78 + (sum % 22);
    } else {
      // 98-100% deterministic daily boost for Zikri & Diann
      const daySeed = new Date().getDate();
      val = 98 + (daySeed % 3);
    }
    setScore(val);
    if (val >= 95) {
      setReading('Koneksi hati super kuat! Cocok jadi partner cerita seumur hidup.');
    } else if (val >= 85) {
      setReading('Chemistry kalian manis banget, tinggal tambah es krim berdua!');
    } else {
      setReading('Pasangan unik yang selalu saling melengkapi dengan cara lucu!');
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 space-y-5">
      <h2 className="font-display text-xl font-bold text-[#4a2336]">Love Meter</h2>
      <form onSubmit={calculate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          value={name1}
          onChange={(e) => setName1(e.target.value)}
          placeholder="Nama pertama"
          required
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
        />
        <input
          type="text"
          value={name2}
          onChange={(e) => setName2(e.target.value)}
          placeholder="Nama kedua"
          required
          className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm"
        />
        <button
          type="submit"
          className="min-h-[44px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Heart className="w-4 h-4 fill-current" />
          <span>Hitung Cinta</span>
        </button>
      </form>

      {score !== null && (
        <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 p-6 text-center space-y-3">
          <div className="font-display text-5xl font-bold text-rose-600 tabular-nums">{score}%</div>
          <div className="w-full max-w-sm mx-auto h-3 rounded-full bg-white overflow-hidden border border-pink-200">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-purple-500 transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="text-sm text-[#4a2336] font-medium">{reading}</p>
        </div>
      )}
    </div>
  );
};

// 5. Spin The Wheel
const SpinWheelGame: React.FC = () => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof WHEEL_REWARDS)[number] | null>(null);

  const count = WHEEL_REWARDS.length;
  const sliceDeg = 360 / count;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    playGentlePop();

    const targetIndex = Math.floor(Math.random() * count);
    // Pointer at top (0deg). Slice center is targetIndex * sliceDeg + sliceDeg/2
    const stopAngle = 360 - (targetIndex * sliceDeg + sliceDeg / 2);
    const extraSpins = 360 * 5;
    const nextRot = rotation - (rotation % 360) + extraSpins + stopAngle;
    setRotation(nextRot);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(WHEEL_REWARDS[targetIndex]);
      playChime([523.25, 659.25, 783.99, 1046.5], 85);
      try {
        confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
      } catch {
        // Ignore
      }
    }, 3600);
  };

  return (
    <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-6 space-y-6 text-center">
      <div>
        <h2 className="font-display text-xl font-bold text-[#4a2336]">Spin The Wheel Berdua</h2>
        <p className="text-xs text-[#7c5a6c]">Putar roda dan lakukan hadiah atau tantangan manisnya!</p>
      </div>

      <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto">
        {/* Top pointer */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-rose-600" />

        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        >
          {WHEEL_REWARDS.map((item, idx) => {
            const startAngle = (idx * sliceDeg - 90) * (Math.PI / 180);
            const endAngle = ((idx + 1) * sliceDeg - 90) * (Math.PI / 180);
            const x1 = 100 + 96 * Math.cos(startAngle);
            const y1 = 100 + 96 * Math.sin(startAngle);
            const x2 = 100 + 96 * Math.cos(endAngle);
            const y2 = 100 + 96 * Math.sin(endAngle);
            const midAngle = idx * sliceDeg + sliceDeg / 2;

            return (
              <g key={item.label}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 96 96 0 0 1 ${x2} ${y2} Z`}
                  fill={item.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x="100"
                  y="32"
                  fill="#4a2336"
                  fontSize="6.8"
                  fontWeight="700"
                  textAnchor="middle"
                  transform={`rotate(${midAngle} 100 100)`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="18" fill="#ffffff" stroke="#f43f5e" strokeWidth="4" />
        </svg>
      </div>

      <button
        type="button"
        onClick={handleSpin}
        disabled={spinning}
        className="min-h-[48px] px-7 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white font-display font-semibold text-sm hover:brightness-105 disabled:opacity-60 inline-flex items-center gap-2 cursor-pointer"
      >
        <Disc3 className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
        <span>{spinning ? 'Memutar...' : result ? 'Putar Lagi' : 'Putar Roda'}</span>
      </button>

      {result && (
        <div className="rounded-2xl bg-pink-50 border border-pink-200 p-4 max-w-md mx-auto space-y-1">
          <div className="text-xs font-semibold text-rose-500 inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hasil Putaran</span>
          </div>
          <h3 className="font-display text-lg font-bold text-[#4a2336]">{result.label}</h3>
          <p className="text-sm text-[#5e3c4e]">{result.detail}</p>
        </div>
      )}
    </div>
  );
};
