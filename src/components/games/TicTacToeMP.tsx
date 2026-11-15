import React from 'react';
import { GameRoom } from '../../types';
import { playChime, playGentlePop } from '../../lib/sound';

export interface MultiplayerBoardProps {
  room: GameRoom;
  myUid: string;
  isPlayer1: boolean;
  onMove: (
    mutator: (room: GameRoom, myUid: string) => {
      gameState: Record<string, unknown>;
      currentTurn: string;
      turnNumber: number;
      score: { player1: number; player2: number };
      winnerId: string;
      status: 'playing' | 'finished';
      historyTitle?: string;
    } | null
  ) => Promise<void>;
}

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkTicTacToe(board: string[]): { winner: string; line: number[] } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every((cell) => cell !== '')) {
    return { winner: 'draw', line: [] };
  }
  return { winner: '', line: [] };
}

export const TicTacToeMP: React.FC<MultiplayerBoardProps> = ({
  room,
  myUid,
  isPlayer1,
  onMove,
}) => {
  const gs = room.gameState as {
    board?: string[];
    winLine?: number[];
  };

  const board = Array.isArray(gs.board) && gs.board.length === 9 ? gs.board : Array(9).fill('');
  const winLine = Array.isArray(gs.winLine) ? gs.winLine : [];
  const myMark = isPlayer1 ? '💗' : '✨';
  const isMyTurn = room.status === 'playing' && room.currentTurn === myUid;

  const handleCellClick = async (idx: number) => {
    if (!isMyTurn || board[idx]) return;
    playGentlePop();

    await onMove((latest, uid) => {
      if (latest.currentTurn !== uid) return null;
      const curGs = latest.gameState as { board?: string[] };
      const curBoard =
        Array.isArray(curGs.board) && curGs.board.length === 9
          ? [...curGs.board]
          : Array(9).fill('');
      if (curBoard[idx]) return null;

      const p1 = latest.player1Id === uid;
      const mark = p1 ? '💗' : '✨';
      curBoard[idx] = mark;

      const res = checkTicTacToe(curBoard);
      const nextTurn = p1 ? latest.player2Id : latest.player1Id;
      let nextWinner = '';
      let nextStatus: 'playing' | 'finished' = 'playing';
      const nextScore = { ...latest.score };

      if (res.winner === '💗') {
        nextWinner = latest.player1Id;
        nextScore.player1 += 10;
        nextStatus = 'finished';
        playChime([523.25, 659.25, 783.99], 90);
      } else if (res.winner === '✨') {
        nextWinner = latest.player2Id;
        nextScore.player2 += 10;
        nextStatus = 'finished';
        playChime([523.25, 659.25, 783.99], 90);
      } else if (res.winner === 'draw') {
        nextWinner = 'draw';
        nextScore.player1 += 5;
        nextScore.player2 += 5;
        nextStatus = 'finished';
      }

      return {
        gameState: {
          board: curBoard,
          winLine: res.line,
          starterId: (curGs as { starterId?: string }).starterId || latest.player1Id,
        },
        currentTurn: nextTurn,
        turnNumber: latest.turnNumber + 1,
        score: nextScore,
        winnerId: nextWinner,
        status: nextStatus,
        historyTitle: 'Tic Tac Toe',
      };
    });
  };

  return (
    <div className="space-y-5 text-center">
      <div className="flex items-center justify-center gap-4 text-xs font-semibold text-[#6b485b]">
        <span>{room.player1Name}: 💗 (X)</span>
        <span>·</span>
        <span>{room.player2Name}: ✨ (O)</span>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-[285px] mx-auto">
        {board.map((cell, i) => {
          const isWinningCell = winLine.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={!isMyTurn || Boolean(cell)}
              onClick={() => void handleCellClick(i)}
              aria-label={`Kotak ${i + 1}`}
              className={`aspect-square rounded-2xl border-2 text-4xl flex items-center justify-center transition-all active:scale-95 ${
                isWinningCell
                  ? 'bg-rose-100 border-rose-400 shadow-md scale-[1.03]'
                  : cell
                  ? 'bg-[#fff7fa] border-pink-200'
                  : isMyTurn
                  ? 'bg-white border-pink-200 hover:bg-pink-50 hover:border-rose-300 cursor-pointer shadow-xs'
                  : 'bg-pink-50/40 border-pink-100 cursor-default'
              }`}
            >
              {cell}
            </button>
          );
        })}
      </div>

      <p className="text-xs sm:text-sm font-semibold text-[#4a2336]">
        {isMyTurn
          ? `Giliran kamu (${myMark}) — Ketuk kotak kosong!`
          : `Menunggu langkah ${myUid === room.player1Id ? room.player2Name : room.player1Name}...`}
      </p>
    </div>
  );
};
