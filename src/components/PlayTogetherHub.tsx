import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Clock,
  Disc3,
  Flame,
  Gamepad2,
  Grid3x3,
  Heart,
  HelpCircle,
  History,
  Music,
  Play,
  Smile,
  Sparkles,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  X,
  Brain,
} from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { createInitialGameState, MULTIPLAYER_GAMES } from '../data/multiplayerData';
import { MultiplayerGameType } from '../types';
import { GameRoomArena } from './games/GameRoomArena';

const GAME_ICON_MAP: Record<MultiplayerGameType, React.ComponentType<{ className?: string }>> = {
  tictactoe: Grid3x3,
  connect_four: Sparkles,
  memory_match: Brain,
  quiz_battle: HelpCircle,
  guess_emoji: Smile,
  truth_or_dare: Flame,
  spin_wheel: Disc3,
  this_or_that: Heart,
  who_knows_better: Users,
  guess_song: Music,
};

export const PlayTogetherHub: React.FC = () => {
  const { user } = useAppData();
  const {
    coupleSpace,
    isPaired,
    myRoleName,
    partnerName,
    myPresence,
    partnerPresence,
    incomingGameInvites,
    activeGameRooms,
    gameHistory,
    createGameRoom,
    acceptGameInvite,
    declineGameInvite,
  } = useCouple();

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [creatingGameId, setCreatingGameId] = useState<MultiplayerGameType | null>(null);
  const [hubError, setHubError] = useState<string | null>(null);

  const activeRoom = useMemo(() => {
    if (!selectedRoomId) return null;
    return activeGameRooms.find((r) => r.roomId === selectedRoomId) || null;
  }, [activeGameRooms, selectedRoomId]);

  if (!coupleSpace || !user) return null;

  const isZikriMe = myRoleName === 'Zikri';
  const zikriOnline = isZikriMe
    ? myPresence?.online !== false
    : Boolean(partnerPresence?.online);
  const diannOnline = !isZikriMe
    ? myPresence?.online !== false
    : Boolean(partnerPresence?.online);

  const handleInviteAndCreate = async (gameId: MultiplayerGameType) => {
    setHubError(null);
    if (!isPaired) {
      setHubError(
        'Pasangan belum terhubung ke Couple Space (baru 1/2 anggota). Undang pasangan di halaman Our Connection terlebih dahulu.'
      );
      return;
    }
    setCreatingGameId(gameId);
    try {
      const init = createInitialGameState(gameId, user.uid);
      const roomId = await createGameRoom(gameId, init.gameState, init.turnMode);
      setSelectedRoomId(roomId);
    } catch (err) {
      setHubError(err instanceof Error ? err.message : 'Gagal membuat room permainan.');
    } finally {
      setCreatingGameId(null);
    }
  };

  const handleAcceptInvite = async (roomId: string) => {
    await acceptGameInvite(roomId);
    setSelectedRoomId(roomId);
  };

  if (activeRoom) {
    return (
      <GameRoomArena
        room={activeRoom}
        myUid={user.uid}
        onExitToLobby={() => setSelectedRoomId('')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Couple Presence Strip */}
      <div className="rounded-3xl bg-gradient-to-r from-[#fff3f7] via-white to-[#f5efff] border border-pink-200 p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#4a2336]">
            <Gamepad2 className="w-4 h-4 text-rose-500" />
            <span>Lobby Play Together Real-Time</span>
          </div>
          <span className="text-[11px] font-medium text-[#7c5a6c]">
            10 Game Tersedia · Room & Skor Tersinkronisasi
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { name: 'Zikri', online: zikriOnline, me: isZikriMe },
            { name: 'Diann', online: diannOnline, me: !isZikriMe },
          ].map((member) => (
            <div
              key={member.name}
              className="rounded-2xl bg-white/90 border border-pink-100 px-3.5 py-2.5 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[#4a2336] truncate">
                  {member.name} {member.me ? '(Kamu)' : ''}
                </div>
                <div
                  className={`text-[11px] font-semibold inline-flex items-center gap-1 ${
                    member.online ? 'text-emerald-600' : 'text-[#7c5a6c]'
                  }`}
                >
                  {member.online ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  member.online ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {hubError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs sm:text-sm text-rose-700">
          {hubError}
        </div>
      )}

      {/* Incoming Game Invites */}
      {incomingGameInvites.length > 0 && (
        <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-purple-500 text-white p-5 shadow-lg shadow-rose-200/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-pink-100">
            <Bell className="w-4 h-4" />
            <span>Undangan Bermain dari {partnerName}!</span>
          </div>
          <div className="space-y-2.5">
            {incomingGameInvites.map((inv) => {
              const meta = MULTIPLAYER_GAMES.find((g) => g.id === inv.gameType);
              return (
                <div
                  key={inv.roomId}
                  className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 p-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-display text-base font-bold">
                      {meta?.title || inv.gameType}
                    </div>
                    <div className="text-xs text-pink-100">
                      Room #{inv.roomId.slice(-6).toUpperCase()} · Menunggu kamu bergabung
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleAcceptInvite(inv.roomId)}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-white text-rose-600 text-xs font-bold hover:bg-pink-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Terima & Main</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void declineGameInvite(inv.roomId)}
                      aria-label="Tolak undangan"
                      className="min-h-[42px] min-w-[42px] rounded-xl bg-white/15 text-white hover:bg-white/25 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Game Rooms (Reconnect / Resume Support) */}
      {activeGameRooms.length > 0 && (
        <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-[#4a2336] inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Active Game Room ({activeGameRooms.length})</span>
            </h2>
            <span className="text-[11px] text-[#7c5a6c]">
              Klik Masuk untuk lanjutkan sesi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activeGameRooms.map((room) => {
              const meta = MULTIPLAYER_GAMES.find((g) => g.id === room.gameType);
              const Icon = GAME_ICON_MAP[room.gameType] || Gamepad2;
              return (
                <button
                  key={room.roomId}
                  type="button"
                  onClick={() => setSelectedRoomId(room.roomId)}
                  className="min-h-[64px] p-3.5 rounded-2xl bg-[#fff8fa] border border-pink-200 hover:border-rose-300 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm font-bold text-[#4a2336] truncate">
                        {meta?.title || room.gameType}
                      </div>
                      <div className="text-[11px] text-[#7c5a6c] truncate tabular-nums">
                        Status: <strong className="text-rose-600">{room.status}</strong> ·{' '}
                        {room.score.player1}:{room.score.player2}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold shrink-0 inline-flex items-center gap-1">
                    <span>Masuk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Available 10 Multiplayer Games Catalog */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-[#4a2336]">
            Pilih Game Berdua (10 Games)
          </h2>
          <span className="text-xs text-[#7c5a6c]">Ketuk untuk mengundang {partnerName}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MULTIPLAYER_GAMES.map((game) => {
            const Icon = GAME_ICON_MAP[game.id] || Gamepad2;
            const busy = creatingGameId === game.id;
            return (
              <div
                key={game.id}
                className="rounded-3xl bg-white border border-pink-100 shadow-xs p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-rose-200 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${game.accentFrom}, ${game.accentTo})`,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-[#4a2336] truncate">
                        {game.title}
                      </h3>
                      <span className="text-[10px] font-bold text-rose-500 bg-pink-50 px-2 py-0.5 rounded-lg shrink-0">
                        {game.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#6b485b] leading-snug">{game.subtitle}</p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleInviteAndCreate(game.id)}
                  className="w-full min-h-[44px] px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-xs sm:text-sm font-semibold hover:brightness-105 disabled:opacity-60 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{busy ? 'Membuat Room...' : `Undang ${partnerName} Main`}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match History */}
      <div className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-bold text-[#4a2336] inline-flex items-center gap-2">
            <History className="w-4 h-4 text-rose-500" />
            <span>Game History ({gameHistory.length})</span>
          </h2>
          <span className="text-xs text-[#7c5a6c]">Riwayat skor pertandingan berdua</span>
        </div>

        {gameHistory.length === 0 ? (
          <p className="text-xs sm:text-sm text-[#7c5a6c] py-3 text-center">
            Belum ada pertandingan yang selesai. Ayo buat room dan main bersama!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {gameHistory.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl bg-[#fff9fb] border border-pink-100 px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#4a2336] truncate">
                    {h.gameTitle}
                  </div>
                  <div className="text-[11px] text-[#7c5a6c] truncate">
                    {new Date(h.createdAtMs).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · Pemenang: <strong className="text-rose-600">{h.winnerName}</strong>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4a2336] tabular-nums shrink-0">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {h.score.player1} - {h.score.player2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
