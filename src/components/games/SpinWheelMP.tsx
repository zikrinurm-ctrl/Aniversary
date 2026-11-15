import React from 'react';
import confetti from 'canvas-confetti';
import { Disc3, Sparkles } from 'lucide-react';
import { WHEEL_REWARDS } from '../../data/gamesData';
import { playChime, playGentlePop } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

export const SpinWheelMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  isPlayer1,
  onMove,
}) => {
  const gs = room.gameState as {
    rotation?: number;
    spinsDone?: number;
    maxSpins?: number;
    lastSpinnerName?: string;
    lastRewardLabel?: string;
    lastRewardDetail?: string;
  };

  const rotation = Number(gs.rotation || 0);
  const spinsDone = Number(gs.spinsDone || 0);
  const maxSpins = Number(gs.maxSpins || 4);
  const count = WHEEL_REWARDS.length;
  const sliceDeg = 360 / count;
  const isMyTurn = room.status === 'playing' && room.currentTurn === myUid;
  const spinnerTurnName =
    room.currentTurn === room.player1Id ? room.player1Name : room.player2Name;

  const handleSpin = async () => {
    if (!isMyTurn) return;
    playGentlePop();

    const targetIdx = Math.floor(Math.random() * count);
    const reward = WHEEL_REWARDS[targetIdx];

    await onMove((latest, uid) => {
      if (latest.currentTurn !== uid) return null;
      const curGs = latest.gameState as { rotation?: number; spinsDone?: number; maxSpins?: number };
      const curRot = Number(curGs.rotation || 0);
      const stopAngle = 360 - (targetIdx * sliceDeg + sliceDeg / 2);
      const nextRot = curRot - (curRot % 360) + 360 * 5 + stopAngle;

      const p1 = latest.player1Id === uid;
      const myName = p1 ? latest.player1Name : latest.player2Name;
      const partnerUid = p1 ? latest.player2Id : latest.player1Id;
      const nextSpins = Number(curGs.spinsDone || 0) + 1;
      const limit = Number(curGs.maxSpins || 4);

      const nextScore = { ...latest.score };
      if (p1) nextScore.player1 += 10;
      else nextScore.player2 += 10;

      const finished = nextSpins >= limit;
      let winnerId = '';
      if (finished) {
        winnerId =
          nextScore.player1 > nextScore.player2
            ? latest.player1Id
            : nextScore.player2 > nextScore.player1
            ? latest.player2Id
            : 'draw';
      }

      return {
        gameState: {
          rotation: nextRot,
          spinsDone: nextSpins,
          maxSpins: limit,
          lastIndex: targetIdx,
          lastSpinnerName: myName,
          lastRewardLabel: reward.label,
          lastRewardDetail: reward.detail,
        },
        currentTurn: partnerUid,
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId,
        status: finished ? 'finished' : 'playing',
        historyTitle: 'Spin The Wheel',
      };
    });

    playChime([523.25, 659.25, 783.99], 85);
    try {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-5 text-center">
      <div className="flex items-center justify-between text-xs font-semibold text-[#7c5a6c]">
        <span>Putaran {Math.min(spinsDone + 1, maxSpins)} / {maxSpins}</span>
        <span>Giliran Putar: <strong className="text-rose-600">{spinnerTurnName}</strong></span>
      </div>

      <div className="relative w-60 h-60 sm:w-64 sm:h-64 mx-auto">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-600" />
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full drop-shadow-md"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 3.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
                  fontSize="6.6"
                  fontWeight="700"
                  textAnchor="middle"
                  transform={`rotate(${midAngle} 100 100)`}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="16" fill="#ffffff" stroke="#f43f5e" strokeWidth="4" />
        </svg>
      </div>

      <button
        type="button"
        disabled={!isMyTurn}
        onClick={() => void handleSpin()}
        className="min-h-[48px] px-7 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-semibold disabled:opacity-45 inline-flex items-center gap-2 cursor-pointer"
      >
        <Disc3 className="w-4 h-4" />
        <span>
          {isMyTurn
            ? 'Putar Roda Sekarang!'
            : `Menunggu ${isPlayer1 ? room.player2Name : room.player1Name} memutar...`}
        </span>
      </button>

      {gs.lastRewardLabel && (
        <div className="rounded-2xl bg-pink-50 border border-pink-200 p-4 max-w-md mx-auto space-y-1">
          <div className="text-xs font-semibold text-rose-500 inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diputar oleh {gs.lastSpinnerName}</span>
          </div>
          <div className="font-display text-base font-bold text-[#4a2336]">
            {gs.lastRewardLabel}
          </div>
          <p className="text-xs text-[#5e3c4e]">{gs.lastRewardDetail}</p>
        </div>
      )}
    </div>
  );
};
