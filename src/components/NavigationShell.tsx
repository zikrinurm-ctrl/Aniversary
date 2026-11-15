import React, { useState } from 'react';
import {
  Camera,
  Flame,
  Gamepad2,
  Heart,
  Home,
  Link2,
  Lock,
  Mail,
  Menu,
  MessageCircleHeart,
  Music,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
  HelpCircle,
  Image as ImageIcon,
  CalendarHeart,
  HandHeart,
  Gem,
  Bell,
  MailOpen,
} from 'lucide-react';
import { useCouple } from '../contexts/CoupleContext';
import { useGlobalMusic } from '../contexts/GlobalMusicContext';
import { MULTIPLAYER_GAMES } from '../data/multiplayerData';
import { SongDedicationModal } from './SongDedicationModal';
import { PageId, SongDedication } from '../types';

interface NavigationShellProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  coupleNames: string;
  children: React.ReactNode;
}

export const ALL_NAV_ITEMS: Array<{
  id: PageId;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Beranda', desc: 'Dashboard utama & ringkasan', icon: Home },
  { id: 'connection', label: 'Our Connection', desc: 'Hubungkan dua akun & status live', icon: Link2 },
  { id: 'chat', label: 'Private Chat', desc: 'Chat real-time, stiker & status baca', icon: MessageCircleHeart },
  { id: 'countdown', label: 'Countdown WIT', desc: 'Hitung mundur 20 Nov 2026', icon: Timer },
  { id: 'candle', label: 'Candle Surprise', desc: 'Kue & tiup lilin virtual', icon: Flame },
  { id: 'truth-or-dare', label: 'Truth or Dare', desc: '100+ pertanyaan & tantangan', icon: Sparkles },
  { id: 'guess-picture', label: 'Tebak Gambar', desc: '32 level tebak visual romantis', icon: ImageIcon },
  { id: 'love-quiz', label: 'Love Quiz', desc: '30 kuis tentang hubungan kita', icon: HelpCircle },
  { id: 'music', label: 'Our Love Radio', desc: 'Radio romantis, Listening Together & dedikasi', icon: Music },
  { id: 'memories', label: 'Our Memories', desc: 'Album foto kenangan bersama', icon: Camera },
  { id: 'love-letter', label: 'Love Letter', desc: '50+ surat cinta acak manis', icon: Mail },
  { id: 'journey', label: 'Our Journey', desc: 'Timeline perjalanan cerita kita', icon: CalendarHeart },
  { id: 'mini-games', label: 'Play Together', desc: 'Game real-time & mode solo', icon: Gamepad2 },
  { id: 'secret-message', label: 'Secret Message', desc: 'Buka gembok pesan rahasia', icon: Lock },
  { id: 'virtual-hug', label: 'Virtual Hug', desc: 'Kirim pelukan hangat instan', icon: HandHeart },
  { id: 'our-promise', label: 'Our Promise', desc: 'Kartu janji pasangan kita', icon: Gem },
  { id: 'final-surprise', label: 'Final Surprise', desc: 'Surat panjang & klimaks cinta', icon: Heart },
  { id: 'admin', label: 'Admin Mode', desc: 'Kelola isi & foto website', icon: ShieldCheck },
];

export const NavigationShell: React.FC<NavigationShellProps> = ({
  activePage,
  onNavigate,
  coupleNames,
  children,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openedDedication, setOpenedDedication] = useState<SongDedication | null>(null);
  const {
    coupleSpace,
    myRoleName,
    unreadChatCount,
    unreadDedications,
    markDedicationOpened,
    addSpaceSong,
    incomingGameInvites,
    acceptGameInvite,
    declineGameInvite,
  } = useCouple();
  const { playlist, selectTrack } = useGlobalMusic();

  const handleOpenUnreadDedication = (d: SongDedication) => {
    setOpenedDedication(d);
    void markDedicationOpened(d.id);
  };

  const handlePlayDedicationFromAnywhere = async (d: SongDedication) => {
    const matched = playlist.find(
      (s) =>
        s.id === d.songId ||
        (d.youtubeUrl && s.youtubeUrl === d.youtubeUrl) ||
        (d.audioUrl && s.audioUrl === d.audioUrl)
    );
    if (matched) {
      selectTrack(matched.id, true, true);
      return;
    }
    if (coupleSpace && (d.audioUrl || d.youtubeUrl)) {
      const addedId = await addSpaceSong({
        title: d.songTitle,
        artist: d.songArtist,
        youtubeUrl: d.youtubeUrl || undefined,
        audioUrl: d.audioUrl || undefined,
        artworkUrl: d.artworkUrl || undefined,
        moodTag: 'Romantic',
      });
      selectTrack(addedId, true, true);
    }
  };

  const handleGo = (page: PageId) => {
    onNavigate(page);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10 pb-36 md:pb-20">
      {/* Clean 3-Zone Top Header */}
      <header className="sticky top-0 z-30 h-13 sm:h-15 bg-white/85 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => handleGo('dashboard')}
            className="font-display text-lg font-bold tracking-tight text-[#4a2336] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {coupleNames} 💗
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6b485b]">
            <button
              type="button"
              onClick={() => handleGo('dashboard')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                activePage === 'dashboard' ? 'text-rose-600 font-semibold' : 'hover:text-rose-500'
              }`}
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => handleGo('connection')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                activePage === 'connection' ? 'text-rose-600 font-semibold' : 'hover:text-rose-500'
              }`}
            >
              Our Connection
            </button>
            <button
              type="button"
              onClick={() => handleGo('chat')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                activePage === 'chat' ? 'text-rose-600 font-semibold' : 'hover:text-rose-500'
              }`}
            >
              <span>Private Chat</span>
              {unreadChatCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold tabular-nums">
                  {unreadChatCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleGo('memories')}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                activePage === 'memories' ? 'text-rose-600 font-semibold' : 'hover:text-rose-500'
              }`}
            >
              Kenangan
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="whitespace-nowrap shrink-0 py-1 hover:text-rose-500 transition-colors cursor-pointer"
            >
              Semua Fitur
            </button>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleGo('final-surprise')}
              className="min-h-[38px] px-4 py-1.5 rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Final Surprise
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {incomingGameInvites.length > 0 && activePage !== 'mini-games' && (
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border border-rose-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {(() => {
              const latestInvite = incomingGameInvites[0];
              const inviterName =
                latestInvite.invitedByUid === latestInvite.player1Id
                  ? latestInvite.player1Name
                  : latestInvite.player2Name;
              const gameTitle =
                MULTIPLAYER_GAMES.find((g) => g.id === latestInvite.gameType)?.title ||
                latestInvite.gameType;
              return (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-rose-600">
                        Undangan Play Together Masuk!
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a2336] font-medium truncate">
                        {inviterName} mengajak main {gameTitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={async () => {
                        await acceptGameInvite(latestInvite.roomId);
                        handleGo('mini-games');
                      }}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
                    >
                      Terima & Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => void declineGameInvite(latestInvite.roomId)}
                      className="min-h-[38px] px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-[#6b485b] hover:bg-pink-50 cursor-pointer"
                    >
                      Tolak
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
        {unreadDedications.length > 0 && (
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-[#fff0f6] via-pink-50 to-purple-50 border border-rose-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {(() => {
              const latestDed = unreadDedications[0];
              return (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-purple-500 text-white flex items-center justify-center shrink-0">
                      <MailOpen className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-rose-600">
                        Someone dedicated a song to you 💗
                      </div>
                      <div className="text-xs sm:text-sm text-[#4a2336] font-medium truncate">
                        {latestDed.senderName}: {latestDed.songTitle} · {latestDed.songArtist}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenUnreadDedication(latestDed)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
                    >
                      Buka Surat Lagu 💌
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
        {children}
      </main>

      <SongDedicationModal
        dedication={openedDedication}
        partnerDisplayName={myRoleName}
        onClose={() => setOpenedDedication(null)}
        onPlaySong={(d) => void handlePlayDedicationFromAnywhere(d)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/92 backdrop-blur-md border-t border-pink-100 grid grid-cols-5 items-center px-1"
      >
        {[
          { id: 'dashboard' as PageId, label: 'Beranda', icon: Home, badge: 0 },
          { id: 'connection' as PageId, label: 'Koneksi', icon: Link2, badge: 0 },
          { id: 'chat' as PageId, label: 'Chat', icon: MessageCircleHeart, badge: unreadChatCount },
          { id: 'memories' as PageId, label: 'Foto', icon: Camera, badge: 0 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activePage === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleGo(tab.id)}
              className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
                active ? 'text-rose-600 font-semibold' : 'text-[#7c5a6c]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'fill-pink-100' : ''}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] leading-tight whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[#7c5a6c] cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] leading-tight whitespace-nowrap">Menu</span>
        </button>
      </nav>

      {/* Full Menu Bottom Sheet / Modal Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full md:max-w-2xl max-h-[85vh] bg-white rounded-t-3xl md:rounded-3xl border border-pink-100 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 pt-3 pb-4 border-b border-pink-100 flex items-center justify-between">
              <div>
                <div className="w-10 h-1 bg-pink-200 rounded-full mx-auto mb-2 md:hidden" />
                <h2 className="font-display text-lg font-bold text-[#4a2336]">
                  Semua Ruang & Aktivitas
                </h2>
                <p className="text-xs text-[#7c5a6c]">Pilih halaman yang ingin dibuka</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#6b485b] hover:bg-pink-50 cursor-pointer"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                const showUnread =
                  (item.id === 'chat' && unreadChatCount > 0) ||
                  (item.id === 'music' && unreadDedications.length > 0);
                const badgeCount =
                  item.id === 'chat' ? unreadChatCount : unreadDedications.length;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleGo(item.id)}
                    className={`min-h-[56px] p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      active
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-pink-100 hover:bg-pink-50/60 text-[#4a2336]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        active ? 'bg-rose-500 text-white' : 'bg-pink-50 text-rose-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-sm font-semibold truncate">
                          {item.label}
                        </span>
                        {showUnread && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold tabular-nums shrink-0">
                            {badgeCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7c5a6c] truncate">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
