import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { THIS_OR_THAT_DECK } from '../../data/multiplayerData';
import { playChime, playGentlePop } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const ThisOrThatMP: React.FC<MultiplayerBoardProps> = ({
  room,
  isPlayer1,
  onMove,
}) => {
  const gs = room.gameState as {
    deckIds?: number[];
    round?: number;
    p1Choice?: number;
    p2Choice?: number;
    revealed?: boolean;
    matchesCount?: number;
  };

  const deckIds =
    Array.isArray(gs.deckIds) && gs.deckIds.length > 0
      ? gs.deckIds
      : [0, 1, 2, 3, 4, 5, 6, 7];
  const round = Number(gs.round || 0);
  const p1Choice = typeof gs.p1Choice === 'number' ? gs.p1Choice : -1;
  const p2Choice = typeof gs.p2Choice === 'number' ? gs.p2Choice : -1;
  const revealed = Boolean(gs.revealed);
  const matchesCount = Number(gs.matchesCount || 0);

  const myChoice = isPlayer1 ? p1Choice : p2Choice;
  const partnerChoice = isPlayer1 ? p2Choice : p1Choice;
  const prompt = THIS_OR_THAT_DECK[deckIds[round] % THIS_OR_THAT_DECK.length];
  const isMatched = revealed && p1Choice === p2Choice && p1Choice >= 0;

  const handlePick = async (choiceIdx: 0 | 1) => {
    if (revealed || myChoice >= 0) return;
    playGentlePop();

    await onMove((latest, uid) => {
      const curGs = latest.gameState as {
        deckIds?: number[];
        round?: number;
        p1Choice?: number;
        p2Choice?: number;
        revealed?: boolean;
        matchesCount?: number;
      };
      if (curGs.revealed) return null;

      const p1 = latest.player1Id === uid;
      const nextP1 = p1 ? choiceIdx : Number(curGs.p1Choice ?? -1);
      const nextP2 = !p1 ? choiceIdx : Number(curGs.p2Choice ?? -1);
      const bothPicked = nextP1 >= 0 && nextP2 >= 0;
      const curMatches = Number(curGs.matchesCount || 0);
      const nextScore = { ...latest.score };

      let nextMatches = curMatches;
      if (bothPicked) {
        if (nextP1 === nextP2) {
          nextMatches += 1;
          nextScore.player1 += 10;
          nextScore.player2 += 10;
          playChime([523.25, 659.25, 783.99], 80);
        } else {
          nextScore.player1 += 5;
          nextScore.player2 += 5;
        }
      }

      return {
        gameState: {
          deckIds: curGs.deckIds || deckIds,
          round: Number(curGs.round || 0),
          p1Choice: nextP1,
          p2Choice: nextP2,
          revealed: bothPicked,
          matchesCount: nextMatches,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: '',
        status: 'playing',
        historyTitle: 'This or That',
      };
    });
  };

  const handleNext = async () => {
    await onMove((latest) => {
      const curGs = latest.gameState as { deckIds?: number[]; round?: number; matchesCount?: number };
      const ids = Array.isArray(curGs.deckIds) ? curGs.deckIds : deckIds;
      const r = Number(curGs.round || 0);
      if (r + 1 >= ids.length) {
        return {
          gameState: { ...curGs, round: r },
          currentTurn: 'both',
          turnNumber: latest.turnNumber + 1,
          score: latest.score,
          winnerId: 'draw',
          status: 'finished',
          historyTitle: 'This or That',
        };
      }
      return {
        gameState: {
          deckIds: ids,
          round: r + 1,
          p1Choice: -1,
          p2Choice: -1,
          revealed: false,
          matchesCount: Number(curGs.matchesCount || 0),
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'This or That',
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
        <span>Dilema {round + 1} / {deckIds.length}</span>
        <span className="text-rose-500">Kompak Cocok: {matchesCount}×</span>
      </div>

      <h3 className="font-display text-lg font-bold text-[#4a2336] text-center">
        {prompt.question}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[prompt.optionA, prompt.optionB].map((label, idx) => {
          const pickedByMe = myChoice === idx;
          const p1Picked = revealed && p1Choice === idx;
          const p2Picked = revealed && p2Choice === idx;
          return (
            <button
              key={idx}
              type="button"
              disabled={revealed || myChoice >= 0}
              onClick={() => void handlePick(idx as 0 | 1)}
              className={`min-h-[88px] p-4 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 transition-all ${
                revealed
                  ? p1Picked && p2Picked
                    ? 'bg-rose-50 border-rose-400 text-[#4a2336] font-bold shadow-sm'
                    : p1Picked || p2Picked
                    ? 'bg-purple-50 border-purple-300 text-[#4a2336]'
                    : 'bg-white border-pink-100 text-[#7c5a6c] opacity-60'
                  : pickedByMe
                  ? 'bg-rose-50 border-rose-400 text-rose-700 font-semibold'
                  : 'bg-white border-pink-100 hover:bg-pink-50 hover:border-rose-300 text-[#4a2336] cursor-pointer'
              }`}
            >
              <span className="text-sm sm:text-base font-semibold">{label}</span>
              {revealed && (p1Picked || p2Picked) && (
                <span className="text-[11px] font-bold text-rose-600">
                  {[p1Picked ? room.player1Name : '', p2Picked ? room.player2Name : '']
                    .filter(Boolean)
                    .join(' & ')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div
          className={`rounded-2xl border p-4 text-center space-y-3 ${
            isMatched
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-purple-50 border-purple-200 text-purple-800'
          }`}
        >
          <div className="font-display text-sm font-bold inline-flex items-center gap-1.5">
            {isMatched ? (
              <>
                <Heart className="w-4 h-4 fill-current" />
                <span>Sehati! Pilihan kalian sama persis (+10 poin)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Beda pilihan, tapi tetap saling melengkapi (+5 poin)</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleNext()}
            className="w-full min-h-[44px] rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            {round + 1 >= deckIds.length ? 'Lihat Hasil Kekompakan' : 'Dilema Berikutnya'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-[#7c5a6c]">
          {myChoice >= 0 && partnerChoice < 0
            ? `Pilihanmu tersimpan rahasia! Menunggu ${isPlayer1 ? room.player2Name : room.player1Name}...`
            : partnerChoice >= 0 && myChoice < 0
            ? `${isPlayer1 ? room.player2Name : room.player1Name} sudah memilih! Ayo pilih jawabanmu.`
            : 'Pilih opsi A atau B secara rahasia.'}
        </p>
      )}
    </div>
  );
};
