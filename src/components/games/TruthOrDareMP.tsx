import React from 'react';
import { Flame, Shuffle, SkipForward } from 'lucide-react';
import { useAppData } from '../../contexts/AppDataContext';
import { playChime, playGentlePop } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const TruthOrDareMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  isPlayer1,
  onMove,
}) => {
  const { truthOrDareList } = useAppData();
  const gs = room.gameState as {
    phase?: 'pick' | 'card';
    kind?: string;
    category?: string;
    prompt?: string;
    roundsDone?: number;
    maxRounds?: number;
    lastAction?: string;
  };

  const phase = gs.phase === 'card' ? 'card' : 'pick';
  const roundsDone = Number(gs.roundsDone || 0);
  const maxRounds = Number(gs.maxRounds || 6);
  const isMyTurn = room.status === 'playing' && room.currentTurn === myUid;
  const activePlayerName =
    room.currentTurn === room.player1Id ? room.player1Name : room.player2Name;

  const drawCard = async (kind?: 'truth' | 'dare') => {
    if (!isMyTurn) return;
    playGentlePop();
    const pool = kind
      ? truthOrDareList.filter((item) => item.kind === kind)
      : truthOrDareList;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    if (!picked) return;

    await onMove((latest, uid) => {
      if (latest.currentTurn !== uid) return null;
      const curGs = latest.gameState as { roundsDone?: number; maxRounds?: number; lastAction?: string };
      return {
        gameState: {
          phase: 'card',
          kind: picked.kind,
          category: picked.category,
          prompt: picked.prompt,
          roundsDone: Number(curGs.roundsDone || 0),
          maxRounds: Number(curGs.maxRounds || 6),
          lastAction: `${latest.player1Id === uid ? latest.player1Name : latest.player2Name} memilih ${picked.kind.toUpperCase()}`,
        },
        currentTurn: uid, // Keep turn until Complete or Skip
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Truth or Dare Multiplayer',
      };
    });
  };

  const resolveTurn = async (completed: boolean) => {
    if (!isMyTurn) return;
    if (completed) playChime([523.25, 659.25, 783.99], 85);

    await onMove((latest, uid) => {
      if (latest.currentTurn !== uid) return null;
      const p1 = latest.player1Id === uid;
      const partnerUid = p1 ? latest.player2Id : latest.player1Id;
      const myName = p1 ? latest.player1Name : latest.player2Name;

      const curGs = latest.gameState as { roundsDone?: number; maxRounds?: number };
      const nextDone = Number(curGs.roundsDone || 0) + 1;
      const limit = Number(curGs.maxRounds || 6);
      const nextScore = { ...latest.score };
      if (completed) {
        if (p1) nextScore.player1 += 10;
        else nextScore.player2 += 10;
      }

      const isFinished = nextDone >= limit;
      let winnerId = '';
      if (isFinished) {
        winnerId =
          nextScore.player1 > nextScore.player2
            ? latest.player1Id
            : nextScore.player2 > nextScore.player1
            ? latest.player2Id
            : 'draw';
      }

      return {
        gameState: {
          phase: 'pick',
          kind: '',
          category: '',
          prompt: '',
          roundsDone: nextDone,
          maxRounds: limit,
          lastAction: `${myName} ${completed ? 'menyelesaikan tantangan (+10)' : 'melewati ronde'}`,
        },
        currentTurn: partnerUid,
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId,
        status: isFinished ? 'finished' : 'playing',
        historyTitle: 'Truth or Dare Multiplayer',
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#7c5a6c]">
        <span>Ronde {Math.min(roundsDone + 1, maxRounds)} / {maxRounds}</span>
        <span>Giliran: <strong className="text-rose-600">{activePlayerName}</strong></span>
      </div>

      {gs.lastAction && (
        <div className="text-xs text-center text-[#6b485b] bg-pink-50/70 border border-pink-100 rounded-xl px-3 py-2">
          {gs.lastAction}
        </div>
      )}

      {phase === 'pick' ? (
        <div className="rounded-2xl bg-[#fff8fa] border border-pink-100 p-5 text-center space-y-4">
          <p className="text-sm font-semibold text-[#4a2336]">
            {isMyTurn
              ? 'Giliran kamu! Pilih Truth, Dare, atau Acak untuk memunculkan kartu di kedua HP.'
              : `Menunggu ${isPlayer1 ? room.player2Name : room.player1Name} memilih kartu...`}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() => void drawCard('truth')}
              className="min-h-[48px] rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 disabled:opacity-45 cursor-pointer"
            >
              Truth
            </button>
            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() => void drawCard('dare')}
              className="min-h-[48px] rounded-xl bg-purple-500 text-white text-xs sm:text-sm font-semibold hover:bg-purple-600 disabled:opacity-45 cursor-pointer"
            >
              Dare
            </button>
            <button
              type="button"
              disabled={!isMyTurn}
              onClick={() => void drawCard()}
              className="min-h-[48px] rounded-xl bg-white border border-pink-200 text-rose-600 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1 disabled:opacity-45 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Acak</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-gradient-to-br from-[#fff5f9] to-[#f8f2ff] border border-pink-200 p-5 space-y-4">
          <div className="text-xs font-bold text-rose-500 uppercase tracking-wide">
            {gs.kind} · {gs.category} · Untuk {activePlayerName}
          </div>
          <p className="font-display text-lg sm:text-xl font-bold text-[#4a2336] leading-snug">
            {gs.prompt}
          </p>

          {isMyTurn ? (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => void resolveTurn(true)}
                className="flex-1 min-h-[46px] rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Selesai (+10) & Ganti Giliran</span>
              </button>
              <button
                type="button"
                onClick={() => void resolveTurn(false)}
                className="min-h-[46px] px-4 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-[#6b485b] inline-flex items-center justify-center gap-1 cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#7c5a6c]">
              Dengarkan atau saksikan {activePlayerName} menyelesaikan tantangannya!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
