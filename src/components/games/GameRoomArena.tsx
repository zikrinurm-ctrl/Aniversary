import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  LogOut,
  RotateCcw,
  Sparkles,
  Trophy,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useCouple } from '../../contexts/CoupleContext';
import { buildRematchState, MULTIPLAYER_GAMES } from '../../data/multiplayerData';
import { playChime } from '../../lib/sound';
import { GameRoom } from '../../types';
import { ConnectFourMP } from './ConnectFourMP';
import { CoupleQuizBattleMP } from './CoupleQuizBattleMP';
import { GuessEmojiMP } from './GuessEmojiMP';
import { GuessSongMP } from './GuessSongMP';
import { MemoryMatchMP } from './MemoryMatchMP';
import { SpinWheelMP } from './SpinWheelMP';
import { ThisOrThatMP } from './ThisOrThatMP';
import { TicTacToeMP } from './TicTacToeMP';
import { TruthOrDareMP } from './TruthOrDareMP';
import { WhoKnowsBetterMP } from './WhoKnowsBetterMP';

interface GameRoomArenaProps {
  room: GameRoom;
  myUid: string;
  onExitToLobby: () => void;
}

export const GameRoomArena: React.FC<GameRoomArenaProps> = ({
  room,
  myUid,
  onExitToLobby,
}) => {
  const {
    partnerPresence,
    myPresence,
    toggleRoomReady,
    runRoomTransaction,
    voteRematchRoom,
    closeGameRoom,
  } = useCouple();

  const [celebratedWinKey, setCelebratedWinKey] = useState('');

  const gameMeta = MULTIPLAYER_GAMES.find((g) => g.id === room.gameType);
  const isPlayer1 = room.player1Id === myUid;
  const myReady = isPlayer1 ? room.player1Ready : room.player2Ready;
  const partnerReady = isPlayer1 ? room.player2Ready : room.player1Ready;
  const myRematchVote = isPlayer1 ? room.rematchVotes.player1 : room.rematchVotes.player2;
  const partnerRematchVote = isPlayer1 ? room.rematchVotes.player2 : room.rematchVotes.player1;

  const p1Online = isPlayer1
    ? myPresence?.online !== false
    : Boolean(partnerPresence?.online);
  const p2Online = !isPlayer1
    ? myPresence?.online !== false
    : Boolean(partnerPresence?.online);

  // Trigger confetti & celebratory chime when game transitions to finished
  useEffect(() => {
    if (room.status !== 'finished') return;
    const key = `${room.roomId}_${room.turnNumber}`;
    if (celebratedWinKey === key) return;
    setCelebratedWinKey(key);
    playChime([523.25, 659.25, 783.99, 1046.5], 90);
    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Ignore
    }
  }, [celebratedWinKey, room.roomId, room.status, room.turnNumber]);

  const handleCloseRoom = async () => {
    await closeGameRoom(room.roomId);
    onExitToLobby();
  };

  const renderBoard = () => {
    const props = {
      room,
      myUid,
      isPlayer1,
      onMove: (mutator: Parameters<typeof runRoomTransaction>[1]) =>
        runRoomTransaction(room.roomId, mutator),
    };

    switch (room.gameType) {
      case 'tictactoe':
        return <TicTacToeMP {...props} />;
      case 'connect_four':
        return <ConnectFourMP {...props} />;
      case 'memory_match':
        return <MemoryMatchMP {...props} />;
      case 'quiz_battle':
        return <CoupleQuizBattleMP {...props} />;
      case 'guess_emoji':
        return <GuessEmojiMP {...props} />;
      case 'truth_or_dare':
        return <TruthOrDareMP {...props} />;
      case 'spin_wheel':
        return <SpinWheelMP {...props} />;
      case 'this_or_that':
        return <ThisOrThatMP {...props} />;
      case 'who_knows_better':
        return <WhoKnowsBetterMP {...props} />;
      case 'guess_song':
        return <GuessSongMP {...props} />;
    }
  };

  const winnerDisplay =
    room.winnerId === 'draw'
      ? 'Seri Berdua! Sama-Sama Hebat 💗'
      : room.winnerId === room.player1Id
      ? `${room.player1Name} Menang! 🎉`
      : `${room.player2Name} Menang! 🎉`;

  const turnBadgeText =
    room.currentTurn === 'both'
      ? 'Main Bersamaan'
      : room.currentTurn === myUid
      ? 'Giliran Kamu!'
      : `Giliran ${isPlayer1 ? room.player2Name : room.player1Name}`;

  return (
    <div className="space-y-4">
      {/* Arena Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExitToLobby}
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white border border-pink-100 text-xs sm:text-sm font-semibold text-[#5e3c4e] hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="text-center">
          <div className="text-[11px] font-semibold text-rose-500">
            Room #{room.roomId.slice(-6).toUpperCase()}
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold text-[#4a2336]">
            {gameMeta?.title || room.gameType}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => void handleCloseRoom()}
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-100 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Tutup Room</span>
        </button>
      </div>

      {/* Dreamy Glassmorphism Scoreboard & Online Presence Card */}
      <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-pink-200/80 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-3 items-center gap-2">
          {/* Player 1 */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 text-white font-display font-bold text-lg flex items-center justify-center shadow-sm">
              {room.player1Name.slice(0, 1).toUpperCase()}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  p1Online ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              >
                {p1Online ? <Wifi className="w-2.5 h-2.5 text-white" /> : <WifiOff className="w-2.5 h-2.5 text-white" />}
              </span>
            </div>
            <div className="text-xs font-bold text-[#4a2336] truncate max-w-full">
              {room.player1Name}
            </div>
            <motion.div
              key={room.score.player1}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              className="font-display text-xl font-bold text-rose-600 tabular-nums"
            >
              {room.score.player1}
            </motion.div>
          </div>

          {/* Center Turn / Status Indicator */}
          <div className="flex flex-col items-center text-center gap-1.5">
            <Heart className="w-5 h-5 text-rose-400 fill-current" />
            <div
              className={`px-3 py-1 rounded-xl text-[11px] font-bold leading-tight ${
                room.status === 'playing'
                  ? room.currentTurn === myUid || room.currentTurn === 'both'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-pink-50 text-[#6b485b] border border-pink-200'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              {room.status === 'playing'
                ? turnBadgeText
                : room.status === 'finished'
                ? 'Selesai'
                : 'Menunggu Ready'}
            </div>
            <span className="text-[10px] text-[#7c5a6c] tabular-nums">
              Aksi #{room.turnNumber}
            </span>
          </div>

          {/* Player 2 */}
          <div className="flex flex-col items-center text-center gap-1">
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white font-display font-bold text-lg flex items-center justify-center shadow-sm">
              {room.player2Name.slice(0, 1).toUpperCase()}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                  p2Online ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              >
                {p2Online ? <Wifi className="w-2.5 h-2.5 text-white" /> : <WifiOff className="w-2.5 h-2.5 text-white" />}
              </span>
            </div>
            <div className="text-xs font-bold text-[#4a2336] truncate max-w-full">
              {room.player2Name}
            </div>
            <motion.div
              key={room.score.player2}
              initial={{ scale: 1.25 }}
              animate={{ scale: 1 }}
              className="font-display text-xl font-bold text-purple-600 tabular-nums"
            >
              {room.score.player2}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Arena Surface */}
      <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-pink-100 shadow-sm p-5 sm:p-6">
        {room.status === 'invited' || room.status === 'lobby' ? (
          <div className="py-4 text-center space-y-5 max-w-md mx-auto">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                <Sparkles className="w-4 h-4" />
                <span>Room Siap Main Bersama</span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#4a2336]">
                {gameMeta?.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6b485b]">{gameMeta?.howToPlay}</p>
            </div>

            {/* Animated READY Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: room.player1Name, ready: room.player1Ready },
                { name: room.player2Name, ready: room.player2Ready },
              ].map((p) => (
                <motion.div
                  key={p.name}
                  animate={{ scale: p.ready ? 1.02 : 1 }}
                  className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-colors ${
                    p.ready
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-pink-50/50 border-pink-100 text-[#7c5a6c]'
                  }`}
                >
                  <CheckCircle2
                    className={`w-6 h-6 ${p.ready ? 'text-emerald-600' : 'text-pink-300'}`}
                  />
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[11px] font-semibold">
                    {p.ready ? 'SIAP MAIN! 💗' : 'Belum Ready'}
                  </div>
                </motion.div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void toggleRoomReady(room.roomId)}
              className={`w-full min-h-[48px] px-6 py-3 rounded-2xl font-display font-bold text-sm transition-all cursor-pointer ${
                myReady
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-md shadow-rose-200 hover:brightness-105'
              }`}
            >
              {myReady
                ? partnerReady
                  ? 'Memulai Permainan...'
                  : 'Kamu Siap! (Klik untuk Batal Ready)'
                : 'TEKAN SIAP MAIN!'}
            </button>
          </div>
        ) : room.status === 'finished' ? (
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-4 text-center space-y-5 max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-100 to-amber-100 border border-pink-200 flex items-center justify-center mx-auto text-rose-500 shadow-sm">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-rose-500">Permainan Selesai!</p>
              <h3 className="font-display text-2xl font-bold text-[#4a2336]">
                {winnerDisplay}
              </h3>
              <p className="text-sm text-[#6b485b] tabular-nums">
                Skor Akhir: <strong>{room.player1Name} {room.score.player1}</strong> —{' '}
                <strong>{room.score.player2} {room.player2Name}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                disabled={myRematchVote}
                onClick={() => void voteRematchRoom(room.roomId, buildRematchState)}
                className="flex-1 min-h-[48px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-semibold hover:brightness-105 disabled:opacity-65 inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {myRematchVote
                    ? partnerRematchVote
                      ? 'Memulai Rematch...'
                      : 'Menunggu Pasangan Rematch...'
                    : partnerRematchVote
                    ? 'Pasangan Ajak Rematch — Terima!'
                    : 'Main Lagi (Rematch)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => void handleCloseRoom()}
                className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-pink-50 border border-pink-200 text-rose-600 text-sm font-semibold hover:bg-pink-100 cursor-pointer"
              >
                Keluar Room
              </button>
            </div>
          </motion.div>
        ) : (
          renderBoard()
        )}
      </div>
    </div>
  );
};
