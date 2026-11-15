import React from 'react';
import { ArrowDown } from 'lucide-react';
import { playChime, playGentlePop } from '../../lib/sound';
import { MultiplayerBoardProps } from './TicTacToeMP';

const ROWS = 6;
const COLS = 7;

function checkConnectFour(cells: string[]): { winner: string; winCells: number[] } {
  const get = (r: number, c: number) =>
    r >= 0 && r < ROWS && c >= 0 && c < COLS ? cells[r * COLS + c] : '';

  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = get(r, c);
      if (!val) continue;
      for (const [dr, dc] of dirs) {
        const coords = [r * COLS + c];
        let matched = true;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (get(nr, nc) !== val) {
            matched = false;
            break;
          }
          coords.push(nr * COLS + nc);
        }
        if (matched) return { winner: val, winCells: coords };
      }
    }
  }

  if (cells.every((c) => c !== '')) {
    return { winner: 'draw', winCells: [] };
  }
  return { winner: '', winCells: [] };
}

export const ConnectFourMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  isPlayer1,
  onMove,
}) => {
  const gs = room.gameState as {
    cells?: string[];
    winCells?: number[];
    lastRow?: number;
    lastCol?: number;
  };

  const cells =
    Array.isArray(gs.cells) && gs.cells.length === ROWS * COLS
      ? gs.cells
      : Array(ROWS * COLS).fill('');
  const winCells = Array.isArray(gs.winCells) ? gs.winCells : [];
  const isMyTurn = room.status === 'playing' && room.currentTurn === myUid;

  const findAvailableRow = (col: number, arr: string[]): number => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!arr[r * COLS + col]) return r;
    }
    return -1;
  };

  const handleDrop = async (col: number) => {
    if (!isMyTurn) return;
    if (findAvailableRow(col, cells) < 0) return;
    playGentlePop();

    await onMove((latest, uid) => {
      if (latest.currentTurn !== uid) return null;
      const curGs = latest.gameState as { cells?: string[]; starterId?: string };
      const curCells =
        Array.isArray(curGs.cells) && curGs.cells.length === ROWS * COLS
          ? [...curGs.cells]
          : Array(ROWS * COLS).fill('');

      const targetRow = findAvailableRow(col, curCells);
      if (targetRow < 0) return null;

      const p1 = latest.player1Id === uid;
      curCells[targetRow * COLS + col] = p1 ? 'P1' : 'P2';

      const check = checkConnectFour(curCells);
      const nextTurn = p1 ? latest.player2Id : latest.player1Id;
      const nextScore = { ...latest.score };
      let winnerId = '';
      let nextStatus: 'playing' | 'finished' = 'playing';

      if (check.winner === 'P1') {
        winnerId = latest.player1Id;
        nextScore.player1 += 15;
        nextStatus = 'finished';
        playChime([523.25, 659.25, 783.99, 1046.5], 90);
      } else if (check.winner === 'P2') {
        winnerId = latest.player2Id;
        nextScore.player2 += 15;
        nextStatus = 'finished';
        playChime([523.25, 659.25, 783.99, 1046.5], 90);
      } else if (check.winner === 'draw') {
        winnerId = 'draw';
        nextScore.player1 += 5;
        nextScore.player2 += 5;
        nextStatus = 'finished';
      }

      return {
        gameState: {
          cells: curCells,
          lastCol: col,
          lastRow: targetRow,
          winCells: check.winCells,
          starterId: curGs.starterId || latest.player1Id,
        },
        currentTurn: nextTurn,
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId,
        status: nextStatus,
        historyTitle: 'Connect Four',
      };
    });
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-center gap-5 text-xs font-semibold text-[#6b485b]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block shadow-xs" />
          <span>{room.player1Name}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-purple-500 inline-block shadow-xs" />
          <span>{room.player2Name}</span>
        </span>
      </div>

      {/* Column Drop Triggers */}
      <div className="max-w-[360px] mx-auto space-y-2">
        <div className="grid grid-cols-7 gap-1.5 px-2">
          {Array.from({ length: COLS }, (_, col) => {
            const canDrop = isMyTurn && findAvailableRow(col, cells) >= 0;
            return (
              <button
                key={col}
                type="button"
                disabled={!canDrop}
                onClick={() => void handleDrop(col)}
                aria-label={`Jatuhkan koin di kolom ${col + 1}`}
                className={`min-h-[44px] rounded-xl flex items-center justify-center transition-all ${
                  canDrop
                    ? isPlayer1
                      ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white cursor-pointer active:scale-95'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white cursor-pointer active:scale-95'
                    : 'bg-pink-50/40 text-pink-200 cursor-default'
                }`}
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* 7x6 Pastel Connect Four Board */}
        <div className="rounded-3xl bg-gradient-to-b from-pink-200 via-rose-200 to-purple-200 p-2.5 shadow-inner border border-pink-300">
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((val, idx) => {
              const isWin = winCells.includes(idx);
              const isLast =
                typeof gs.lastRow === 'number' &&
                typeof gs.lastCol === 'number' &&
                gs.lastRow * COLS + gs.lastCol === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!isMyTurn || findAvailableRow(idx % COLS, cells) < 0}
                  onClick={() => void handleDrop(idx % COLS)}
                  aria-label={`Kolom ${(idx % COLS) + 1}`}
                  className={`aspect-square rounded-full flex items-center justify-center transition-all duration-200 ${
                    val === 'P1'
                      ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-md border-2 border-white/80'
                      : val === 'P2'
                      ? 'bg-gradient-to-br from-purple-400 to-indigo-600 shadow-md border-2 border-white/80'
                      : 'bg-white/90 border border-pink-200/70'
                  } ${isWin ? 'ring-3 ring-amber-300 scale-105' : ''} ${
                    isLast && !isWin ? 'ring-2 ring-white' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-[#4a2336]">
        {isMyTurn
          ? 'Giliran kamu! Pilih kolom panah untuk menjatuhkan koin.'
          : `Menunggu giliran ${isPlayer1 ? room.player2Name : room.player1Name}...`}
      </p>
    </div>
  );
};
