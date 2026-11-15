import React from 'react';
import { Sparkles } from 'lucide-react';
import { playChime, playGentlePop, playSoftError } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const MemoryMatchMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  onMove,
}) => {
  const gs = room.gameState as {
    cards?: string[];
    matched?: number[];
    flipped?: number[];
    lastPair?: number[];
    lastMatchBy?: string;
  };

  const cards = Array.isArray(gs.cards) ? gs.cards : [];
  const matched = Array.isArray(gs.matched) ? gs.matched : [];
  const flipped = Array.isArray(gs.flipped) ? gs.flipped : [];
  const lastPair = Array.isArray(gs.lastPair) ? gs.lastPair : [];

  const isMyTurn = room.status === 'playing' && room.currentTurn === myUid;

  const handleFlipCard = async (idx: number) => {
    if (!isMyTurn) return;
    if (matched.includes(idx) || flipped.includes(idx)) return;
    playGentlePop();

    await onMove((latest, uid) => {
      if (latest.currentTurn !== uid) return null;
      const curGs = latest.gameState as {
        cards?: string[];
        matched?: number[];
        flipped?: number[];
      };
      const curCards = Array.isArray(curGs.cards) ? curGs.cards : [];
      const curMatched = Array.isArray(curGs.matched) ? [...curGs.matched] : [];
      const curFlipped = Array.isArray(curGs.flipped) ? [...curGs.flipped] : [];

      if (curMatched.includes(idx) || curFlipped.includes(idx)) return null;

      const p1 = latest.player1Id === uid;
      const myName = p1 ? latest.player1Name : latest.player2Name;
      const partnerUid = p1 ? latest.player2Id : latest.player1Id;
      const nextScore = { ...latest.score };

      if (curFlipped.length === 0) {
        return {
          gameState: {
            cards: curCards,
            matched: curMatched,
            flipped: [idx],
            lastPair: [],
            lastMatchBy: '',
            pairsCount: curMatched.length / 2,
          },
          currentTurn: uid, // Keep turn to pick 2nd card
          turnNumber: latest.turnNumber + 1,
          score: nextScore,
          winnerId: '',
          status: 'playing',
          historyTitle: 'Memory Match',
        };
      }

      const firstIdx = curFlipped[0];
      const secondIdx = idx;
      const isMatch = curCards[firstIdx] === curCards[secondIdx];

      if (isMatch) {
        curMatched.push(firstIdx, secondIdx);
        if (p1) nextScore.player1 += 10;
        else nextScore.player2 += 10;
        playChime([523.25, 659.25, 783.99], 80);

        const allDone = curMatched.length >= curCards.length;
        let winnerId = '';
        if (allDone) {
          winnerId =
            nextScore.player1 > nextScore.player2
              ? latest.player1Id
              : nextScore.player2 > nextScore.player1
              ? latest.player2Id
              : 'draw';
        }

        return {
          gameState: {
            cards: curCards,
            matched: curMatched,
            flipped: [],
            lastPair: [firstIdx, secondIdx],
            lastMatchBy: `${myName} cocok! (+10)`,
            pairsCount: curMatched.length / 2,
          },
          currentTurn: uid, // Bonus turn on match!
          turnNumber: latest.turnNumber + 1,
          score: nextScore,
          winnerId,
          status: allDone ? 'finished' : 'playing',
          historyTitle: 'Memory Match',
        };
      }

      playSoftError();
      return {
        gameState: {
          cards: curCards,
          matched: curMatched,
          flipped: [],
          lastPair: [firstIdx, secondIdx],
          lastMatchBy: `${myName} belum cocok — gantian!`,
          pairsCount: curMatched.length / 2,
        },
        currentTurn: partnerUid,
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Memory Match',
      };
    });
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6b485b] max-w-xs mx-auto">
        <span>Pasangan Terbuka: {matched.length / 2} / {cards.length / 2}</span>
        {gs.lastMatchBy && <span className="text-rose-500">{gs.lastMatchBy}</span>}
      </div>

      <div className="grid grid-cols-4 gap-2.5 max-w-[330px] mx-auto">
        {cards.map((sym, idx) => {
          const isMatched = matched.includes(idx);
          const isFlipped = flipped.includes(idx);
          const isLastShown = lastPair.includes(idx) && flipped.length === 0;
          const visible = isMatched || isFlipped || isLastShown;

          return (
            <button
              key={idx}
              type="button"
              disabled={!isMyTurn || isMatched || isFlipped}
              onClick={() => void handleFlipCard(idx)}
              aria-label={`Kartu ${idx + 1}`}
              className={`aspect-square rounded-2xl border-2 text-2xl sm:text-3xl flex items-center justify-center transition-all active:scale-95 ${
                isMatched
                  ? 'bg-emerald-50 border-emerald-300 shadow-xs'
                  : isFlipped
                  ? 'bg-rose-50 border-rose-400 shadow-md scale-[1.03]'
                  : isLastShown
                  ? 'bg-amber-50 border-amber-300'
                  : isMyTurn
                  ? 'bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200 hover:border-rose-400 cursor-pointer shadow-xs'
                  : 'bg-pink-50/70 border-pink-100 cursor-default'
              }`}
            >
              {visible ? sym : <Sparkles className="w-5 h-5 text-rose-300" />}
            </button>
          );
        })}
      </div>

      <p className="text-xs sm:text-sm font-semibold text-[#4a2336]">
        {isMyTurn
          ? flipped.length === 0
            ? 'Giliran kamu! Buka kartu pertama.'
            : 'Pilih kartu kedua untuk mencocokkan!'
          : `Menunggu ${myUid === room.player1Id ? room.player2Name : room.player1Name} membuka kartu...`}
      </p>
    </div>
  );
};
