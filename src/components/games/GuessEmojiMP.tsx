import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, Smile } from 'lucide-react';
import { EMOJI_PUZZLES } from '../../data/gamesData';
import { playChime, playSoftError } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const GuessEmojiMP: React.FC<MultiplayerBoardProps> = ({
  room,
  onMove,
}) => {
  const gs = room.gameState as {
    pIds?: number[];
    round?: number;
    solvedByUid?: string;
    solvedByName?: string;
    showHint?: boolean;
  };

  const pIds = Array.isArray(gs.pIds) && gs.pIds.length > 0 ? gs.pIds : [0, 1, 2, 3, 4, 5];
  const round = Number(gs.round || 0);
  const solvedByUid = String(gs.solvedByUid || '');
  const solvedByName = String(gs.solvedByName || '');
  const showHint = Boolean(gs.showHint);

  const puzzle = EMOJI_PUZZLES[pIds[round] % EMOJI_PUZZLES.length];

  const [input, setInput] = useState('');
  const [wrongMsg, setWrongMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || solvedByUid) return;
    const clean = input.trim().toLowerCase();
    const ok = puzzle.answers.some(
      (a) => clean === a || clean.includes(a) || (a.includes(clean) && clean.length >= 4)
    );

    if (!ok) {
      playSoftError();
      setWrongMsg(true);
      return;
    }

    setWrongMsg(false);
    setInput('');
    playChime([523.25, 659.25, 783.99], 80);

    await onMove((latest, uid) => {
      const curGs = latest.gameState as {
        pIds?: number[];
        round?: number;
        solvedByUid?: string;
        showHint?: boolean;
      };
      if (curGs.solvedByUid) return null; // Already claimed by partner first
      const p1 = latest.player1Id === uid;
      const solverName = p1 ? latest.player1Name : latest.player2Name;
      const nextScore = { ...latest.score };
      if (p1) nextScore.player1 += 10;
      else nextScore.player2 += 10;

      return {
        gameState: {
          pIds: curGs.pIds || pIds,
          round: Number(curGs.round || 0),
          solvedByUid: uid,
          solvedByName: solverName,
          showHint: Boolean(curGs.showHint),
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Guess The Emoji',
      };
    });
  };

  const toggleHint = async () => {
    await onMove((latest) => {
      const curGs = latest.gameState as Record<string, unknown>;
      return {
        gameState: { ...curGs, showHint: !curGs.showHint },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Guess The Emoji',
      };
    });
  };

  const handleNext = async () => {
    setInput('');
    setWrongMsg(false);
    await onMove((latest) => {
      const curGs = latest.gameState as { pIds?: number[]; round?: number };
      const ids = Array.isArray(curGs.pIds) ? curGs.pIds : pIds;
      const r = Number(curGs.round || 0);
      const isLast = r + 1 >= ids.length;
      if (isLast) {
        const winnerId =
          latest.score.player1 > latest.score.player2
            ? latest.player1Id
            : latest.score.player2 > latest.score.player1
            ? latest.player2Id
            : 'draw';
        return {
          gameState: { ...curGs, round: r },
          currentTurn: 'both',
          turnNumber: latest.turnNumber + 1,
          score: latest.score,
          winnerId,
          status: 'finished',
          historyTitle: 'Guess The Emoji',
        };
      }
      return {
        gameState: {
          pIds: ids,
          round: r + 1,
          solvedByUid: '',
          solvedByName: '',
          showHint: false,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Guess The Emoji',
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
        <span className="inline-flex items-center gap-1.5">
          <Smile className="w-4 h-4 text-rose-500" />
          <span>Level {round + 1} / {pIds.length}</span>
        </span>
        <button
          type="button"
          onClick={() => void toggleHint()}
          className="text-purple-600 inline-flex items-center gap-1 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'Tutup Petunjuk' : 'Buka Petunjuk'}</span>
        </button>
      </div>

      <div className="rounded-2xl bg-[#fff7fa] border border-pink-100 py-8 text-center text-4xl sm:text-5xl tracking-widest">
        {puzzle.emojis}
      </div>

      {showHint && (
        <p className="text-xs text-purple-800 bg-purple-50 border border-purple-100 rounded-xl p-3">
          Petunjuk: {puzzle.hint}
        </p>
      )}

      {!solvedByUid ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setWrongMsg(false);
            }}
            placeholder="Cepat tebak sebelum pasanganmu!"
            className="flex-1 min-h-[46px] px-4 py-2 rounded-xl bg-[#fff9fb] border border-pink-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            type="submit"
            className="min-h-[46px] px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            Jawab!
          </button>
        </form>
      ) : (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 space-y-3">
          <div className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              <strong>{solvedByName}</strong> paling cepat menjawab: {puzzle.displayAnswer} (+10)!
            </span>
          </div>
          <button
            type="button"
            onClick={() => void handleNext()}
            className="w-full min-h-[44px] rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 cursor-pointer"
          >
            {round + 1 >= pIds.length ? 'Lihat Pemenang' : 'Level Berikutnya'}
          </button>
        </div>
      )}

      {wrongMsg && (
        <p className="text-xs font-medium text-rose-600">
          Belum tepat, ayo coba tebakan lain sebelum pasanganmu duluan!
        </p>
      )}
    </div>
  );
};
