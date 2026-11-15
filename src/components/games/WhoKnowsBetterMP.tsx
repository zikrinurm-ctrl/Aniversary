import React from 'react';
import { CheckCircle2, Heart } from 'lucide-react';
import { WHO_KNOWS_BETTER_DECK } from '../../data/multiplayerData';
import { playChime, playGentlePop } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const WhoKnowsBetterMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  isPlayer1,
  onMove,
}) => {
  const gs = room.gameState as {
    deckIds?: number[];
    round?: number;
    targetUid?: string;
    p1Ans?: number;
    p2Ans?: number;
    revealed?: boolean;
  };

  const deckIds =
    Array.isArray(gs.deckIds) && gs.deckIds.length > 0
      ? gs.deckIds
      : [0, 1, 2, 3, 4, 5];
  const round = Number(gs.round || 0);
  const targetUid = String(gs.targetUid || room.player1Id);
  const p1Ans = typeof gs.p1Ans === 'number' ? gs.p1Ans : -1;
  const p2Ans = typeof gs.p2Ans === 'number' ? gs.p2Ans : -1;
  const revealed = Boolean(gs.revealed);

  const amITarget = myUid === targetUid;
  const targetName = targetUid === room.player1Id ? room.player1Name : room.player2Name;
  const guesserName = targetUid === room.player1Id ? room.player2Name : room.player1Name;
  const myAns = isPlayer1 ? p1Ans : p2Ans;
  const partnerAns = isPlayer1 ? p2Ans : p1Ans;

  const qRaw = WHO_KNOWS_BETTER_DECK[deckIds[round] % WHO_KNOWS_BETTER_DECK.length];
  const questionText = qRaw.template.replace('{TARGET}', targetName);
  const guessedRight = revealed && p1Ans >= 0 && p1Ans === p2Ans;

  const handleAnswer = async (optIdx: number) => {
    if (revealed || myAns >= 0) return;
    playGentlePop();

    await onMove((latest, uid) => {
      const curGs = latest.gameState as {
        deckIds?: number[];
        round?: number;
        targetUid?: string;
        p1Ans?: number;
        p2Ans?: number;
        revealed?: boolean;
      };
      if (curGs.revealed) return null;

      const p1 = latest.player1Id === uid;
      const nextP1 = p1 ? optIdx : Number(curGs.p1Ans ?? -1);
      const nextP2 = !p1 ? optIdx : Number(curGs.p2Ans ?? -1);
      const bothDone = nextP1 >= 0 && nextP2 >= 0;
      const curTargetUid = String(curGs.targetUid || latest.player1Id);
      const nextScore = { ...latest.score };

      if (bothDone && nextP1 === nextP2) {
        if (curTargetUid === latest.player1Id) {
          nextScore.player2 += 15; // Player 2 guessed Player 1 correctly!
        } else {
          nextScore.player1 += 15; // Player 1 guessed Player 2 correctly!
        }
        playChime([523.25, 659.25, 783.99], 85);
      }

      return {
        gameState: {
          deckIds: curGs.deckIds || deckIds,
          round: Number(curGs.round || 0),
          targetUid: curTargetUid,
          p1Ans: nextP1,
          p2Ans: nextP2,
          revealed: bothDone,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Who Knows Better?',
      };
    });
  };

  const handleNext = async () => {
    await onMove((latest) => {
      const curGs = latest.gameState as { deckIds?: number[]; round?: number; targetUid?: string };
      const ids = Array.isArray(curGs.deckIds) ? curGs.deckIds : deckIds;
      const r = Number(curGs.round || 0);
      if (r + 1 >= ids.length) {
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
          historyTitle: 'Who Knows Better?',
        };
      }

      const nextTarget =
        curGs.targetUid === latest.player1Id ? latest.player2Id : latest.player1Id;
      return {
        gameState: {
          deckIds: ids,
          round: r + 1,
          targetUid: nextTarget,
          p1Ans: -1,
          p2Ans: -1,
          revealed: false,
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Who Knows Better?',
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#7c5a6c]">
        <span>Ronde {round + 1} / {deckIds.length}</span>
        <span className="text-rose-600">
          {amITarget
            ? `Kamu menjawab tentang dirimu (${targetName})`
            : `Tebak jawaban ${targetName}!`}
        </span>
      </div>

      <h3 className="font-display text-lg font-bold text-[#4a2336] leading-snug">
        {questionText}
      </h3>

      <div className="space-y-2">
        {qRaw.options.map((opt, idx) => {
          const isTargetPick = revealed && (targetUid === room.player1Id ? p1Ans === idx : p2Ans === idx);
          const isGuesserPick = revealed && (targetUid === room.player1Id ? p2Ans === idx : p1Ans === idx);
          return (
            <button
              key={idx}
              type="button"
              disabled={revealed || myAns >= 0}
              onClick={() => void handleAnswer(idx)}
              className={`w-full min-h-[48px] px-4 py-2.5 rounded-2xl border text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                revealed
                  ? isTargetPick && isGuesserPick
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                    : isTargetPick
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                    : isGuesserPick
                    ? 'bg-purple-50 border-purple-300 text-purple-900'
                    : 'bg-white border-pink-100 text-[#7c5a6c]'
                  : myAns === idx
                  ? 'bg-rose-50 border-rose-400 text-rose-700 font-semibold'
                  : 'bg-white border-pink-100 hover:bg-pink-50 text-[#4a2336] cursor-pointer'
              }`}
            >
              <span>{opt}</span>
              {revealed && (isTargetPick || isGuesserPick) && (
                <span className="text-[11px] font-bold shrink-0">
                  {[
                    isTargetPick ? `Asli (${targetName})` : '',
                    isGuesserPick ? `Tebakan (${guesserName})` : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            guessedRight
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-pink-50 border-pink-200 text-[#5e3c4e]'
          }`}
        >
          <div className="text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5">
            {guessedRight ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Tepat sekali! {guesserName} benar-benar mengenal {targetName} (+15 poin)!</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Belum cocok kali ini — jadi tahu hal baru tentang {targetName}!</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => void handleNext()}
            className="w-full min-h-[44px] rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            {round + 1 >= deckIds.length ? 'Lihat Skor Akhir' : 'Tukar Giliran & Lanjut'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-[#7c5a6c]">
          {myAns >= 0 && partnerAns < 0
            ? `Pilihanmu terkunci! Menunggu ${isPlayer1 ? room.player2Name : room.player1Name}...`
            : amITarget
            ? 'Pilih jawaban yang paling menggambarkan dirimu!'
            : `Tebak kira-kira apa yang dipilih ${targetName}!`}
        </p>
      )}
    </div>
  );
};
