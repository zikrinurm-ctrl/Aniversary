import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { SEED_LOVE_QUIZ } from '../../data/quizAndLettersData';
import { playChime, playGentlePop } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const CoupleQuizBattleMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  isPlayer1,
  onMove,
}) => {
  const gs = room.gameState as {
    qIds?: number[];
    round?: number;
    p1Pick?: number;
    p2Pick?: number;
    revealed?: boolean;
    roundStartedAt?: number;
  };

  const qIds = Array.isArray(gs.qIds) && gs.qIds.length > 0 ? gs.qIds : [0, 1, 2, 3, 4];
  const round = Number(gs.round || 0);
  const p1Pick = typeof gs.p1Pick === 'number' ? gs.p1Pick : -1;
  const p2Pick = typeof gs.p2Pick === 'number' ? gs.p2Pick : -1;
  const revealed = Boolean(gs.revealed);

  const myPick = isPlayer1 ? p1Pick : p2Pick;
  const partnerPick = isPlayer1 ? p2Pick : p1Pick;
  const question = SEED_LOVE_QUIZ[qIds[round] % SEED_LOVE_QUIZ.length];

  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    if (revealed) return;
    const started = Number(gs.roundStartedAt || Date.now());
    const tick = () => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setSecondsLeft(Math.max(0, 20 - elapsed));
    };
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [gs.roundStartedAt, revealed, round]);

  const handleChoose = async (optIdx: number) => {
    if (revealed || myPick >= 0) return;
    playGentlePop();

    await onMove((latest, uid) => {
      const curGs = latest.gameState as {
        qIds?: number[];
        round?: number;
        p1Pick?: number;
        p2Pick?: number;
        revealed?: boolean;
        roundStartedAt?: number;
      };
      if (curGs.revealed) return null;
      const curIds = Array.isArray(curGs.qIds) ? curGs.qIds : qIds;
      const curRound = Number(curGs.round || 0);
      const q = SEED_LOVE_QUIZ[curIds[curRound] % SEED_LOVE_QUIZ.length];

      const p1 = latest.player1Id === uid;
      const nextP1 = p1 ? optIdx : Number(curGs.p1Pick ?? -1);
      const nextP2 = !p1 ? optIdx : Number(curGs.p2Pick ?? -1);
      const bothAnswered = nextP1 >= 0 && nextP2 >= 0;
      const nextScore = { ...latest.score };

      if (bothAnswered) {
        if (nextP1 === q.correctIndex) nextScore.player1 += 10;
        if (nextP2 === q.correctIndex) nextScore.player2 += 10;
        playChime([523.25, 659.25, 783.99], 85);
      }

      return {
        gameState: {
          qIds: curIds,
          round: curRound,
          p1Pick: nextP1,
          p2Pick: nextP2,
          revealed: bothAnswered,
          roundStartedAt: Number(curGs.roundStartedAt || Date.now()),
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Couple Quiz Battle',
      };
    });
  };

  const handleNextOrFinish = async () => {
    await onMove((latest) => {
      const curGs = latest.gameState as { qIds?: number[]; round?: number };
      const curIds = Array.isArray(curGs.qIds) ? curGs.qIds : qIds;
      const curRound = Number(curGs.round || 0);
      const isLast = curRound + 1 >= curIds.length;

      if (isLast) {
        const winnerId =
          latest.score.player1 > latest.score.player2
            ? latest.player1Id
            : latest.score.player2 > latest.score.player1
            ? latest.player2Id
            : 'draw';
        return {
          gameState: { ...curGs, round: curRound, revealed: true },
          currentTurn: 'both',
          turnNumber: latest.turnNumber + 1,
          score: latest.score,
          winnerId,
          status: 'finished',
          historyTitle: 'Couple Quiz Battle',
        };
      }

      return {
        gameState: {
          qIds: curIds,
          round: curRound + 1,
          p1Pick: -1,
          p2Pick: -1,
          revealed: false,
          roundStartedAt: Date.now(),
        },
        currentTurn: 'both',
        turnNumber: latest.turnNumber + 1,
        score: latest.score,
        winnerId: '',
        status: 'playing',
        historyTitle: 'Couple Quiz Battle',
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
        <span className="inline-flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-rose-500" />
          <span>Soal {round + 1} / {qIds.length}</span>
        </span>
        {!revealed && (
          <span
            className={`inline-flex items-center gap-1 tabular-nums px-2.5 py-1 rounded-lg ${
              secondsLeft <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-pink-50 text-[#5e3c4e]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{secondsLeft}d</span>
          </span>
        )}
      </div>

      <h3 className="font-display text-lg font-bold text-[#4a2336] leading-snug">
        {question.question}
      </h3>

      <div className="space-y-2">
        {question.options.map((opt, idx) => {
          const p1PickedThis = revealed && p1Pick === idx;
          const p2PickedThis = revealed && p2Pick === idx;
          let cls = 'bg-white border-pink-100 text-[#4a2336] hover:bg-pink-50/70';
          if (revealed) {
            if (idx === question.correctIndex) {
              cls = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
            } else if (idx === myPick) {
              cls = 'bg-rose-50 border-rose-300 text-rose-800';
            }
          } else if (idx === myPick) {
            cls = 'bg-rose-50 border-rose-400 text-rose-700 font-semibold';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={revealed || myPick >= 0}
              onClick={() => void handleChoose(idx)}
              className={`w-full min-h-[48px] px-4 py-2.5 rounded-2xl border text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                revealed || myPick >= 0 ? 'cursor-default' : 'cursor-pointer'
              } ${cls}`}
            >
              <span>{opt}</span>
              {revealed && (p1PickedThis || p2PickedThis) && (
                <span className="text-[11px] font-bold shrink-0 text-rose-600">
                  {[
                    p1PickedThis ? room.player1Name : '',
                    p2PickedThis ? room.player2Name : '',
                  ]
                    .filter(Boolean)
                    .join(' & ')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="rounded-2xl bg-pink-50/80 border border-pink-200 p-4 space-y-3">
          <div className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{question.explanation}</span>
          </div>
          <button
            type="button"
            onClick={() => void handleNextOrFinish()}
            className="w-full min-h-[44px] rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 cursor-pointer"
          >
            {round + 1 >= qIds.length ? 'Lihat Hasil Akhir' : 'Lanjut Soal Berikutnya'}
          </button>
        </div>
      ) : (
        <p className="text-xs text-center text-[#7c5a6c]">
          {myPick >= 0 && partnerPick < 0
            ? `Jawabanmu terkunci! Menunggu ${isPlayer1 ? room.player2Name : room.player1Name} menjawab...`
            : partnerPick >= 0 && myPick < 0
            ? `${isPlayer1 ? room.player2Name : room.player1Name} sudah memilih! Giliran kamu pilih sekarang.`
            : 'Pilih jawabanmu secara rahasia — jawaban pasangan terbuka setelah keduanya memilih.'}
        </p>
      )}
    </div>
  );
};
