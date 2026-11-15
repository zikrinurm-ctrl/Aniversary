import React from 'react';
import { motion } from 'motion/react';
import {
  CalendarHeart,
  Clock,
  Heart,
  Link2,
  MessageCircleHeart,
  Music,
  Sparkles,
  ArrowRight,
  PartyPopper,
  Wifi,
  WifiOff,
  Gamepad2,
} from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { useGlobalMusic } from '../contexts/GlobalMusicContext';
import {
  CountdownBreakdown,
  formatWitDate,
  formatWitTime,
  getRelationshipDuration,
  getWitGreeting,
} from '../lib/time';
import { ALL_NAV_ITEMS } from '../components/NavigationShell';
import { PageId } from '../types';

interface DashboardPageProps {
  nowMs: number;
  countdown: CountdownBreakdown;
  onNavigate: (page: PageId) => void;
  onReplayMidnightSurprise?: () => void;
  focusCountdownOnly?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  nowMs,
  countdown,
  onNavigate,
  onReplayMidnightSurprise,
  focusCountdownOnly = false,
}) => {
  const { siteConfig, playerStatus } = useAppData();
  const { activeSong, isPlaying } = useGlobalMusic();
  const {
    firebaseReady,
    coupleSpace,
    isPaired,
    partnerName,
    partnerPresence,
    unreadChatCount,
  } = useCouple();

  const duration = getRelationshipDuration(nowMs);
  const currentSong = activeSong;

  const partnerOnline =
    Boolean(partnerPresence?.online) &&
    Boolean(partnerPresence?.lastSeenMs) &&
    nowMs - (partnerPresence?.lastSeenMs || 0) < 65000;

  const featureCards = ALL_NAV_ITEMS.filter(
    (item) => item.id !== 'dashboard' && item.id !== 'countdown'
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Split: Couple Portrait + Real-Time WIT Clock & Countdown */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Couple Photo & Greeting Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-5 rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="relative h-60 sm:h-72 lg:flex-1 min-h-[240px] bg-pink-50">
            <img
              src={siteConfig.couplePhotoUrl}
              alt={`Foto pasangan ${siteConfig.coupleNames}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 text-white">
              <p className="text-xs font-medium text-pink-200">{getWitGreeting(nowMs)}</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 text-balance">
                {siteConfig.coupleNames} 💗
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-pink-50/95 leading-relaxed line-clamp-2">
                {siteConfig.heroGreeting}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Real-Time Countdown & WIT Digital Clock Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-white via-[#fff7fa] to-[#f8f2ff] border border-pink-100 shadow-sm p-5 sm:p-7 flex flex-col justify-between gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-4">
            <div>
              <p className="text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Waktu Indonesia Timur (Asia/Jayapura)</span>
              </p>
              <p className="text-xs text-[#7c5a6c] mt-0.5">{formatWitDate(nowMs)}</p>
            </div>
            <div className="font-display text-xl sm:text-2xl font-bold text-[#4a2336] tabular-nums">
              {formatWitTime(nowMs)} <span className="text-xs font-semibold text-rose-500">WIT</span>
            </div>
          </div>

          {!countdown.isAnniversaryReached ? (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336]">
                  Menuju 1st Anniversary
                </h2>
                <span className="text-xs font-medium text-[#7c5a6c]">20 Nov 2026 · 00:00 WIT</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
                {[
                  { label: 'Hari', value: countdown.days },
                  { label: 'Jam', value: countdown.hours },
                  { label: 'Menit', value: countdown.minutes },
                  { label: 'Detik', value: countdown.seconds },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white border border-pink-100 py-3.5 px-2 text-center shadow-xs"
                  >
                    <div className="font-display text-2xl sm:text-4xl font-bold text-rose-600 tabular-nums">
                      {String(item.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs font-medium text-[#7c5a6c] mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white p-5 sm:p-6">
              <div className="flex items-center gap-2 text-pink-100 text-xs font-semibold">
                <PartyPopper className="w-4 h-4" />
                <span>20 November 2026 · Mode Anniversary Aktif</span>
              </div>
              <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-balance">
                Happy First Anniversary, {siteConfig.coupleNames}!
              </h2>
              <p className="mt-2 text-sm text-pink-50 leading-relaxed">
                Hari spesial kita telah tiba! Terima kasih sudah berjalan satu tahun penuh bersama.
              </p>
              {onReplayMidnightSurprise && (
                <button
                  type="button"
                  onClick={onReplayMidnightSurprise}
                  className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-white text-rose-600 text-xs sm:text-sm font-semibold hover:bg-pink-50 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Putar Ulang Kejutan Midnight</span>
                </button>
              )}
            </div>
          )}

          {/* Relationship Duration + Music Quick Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-2xl bg-white/90 border border-pink-100 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-rose-500 flex items-center justify-center shrink-0">
                <CalendarHeart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-[#7c5a6c]">Bersama sejak 20 Nov 2025</div>
                <div className="font-display text-base font-bold text-[#4a2336] tabular-nums">
                  {duration.totalDays} Hari · {duration.hours} Jam
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('music')}
              className="rounded-2xl bg-white/90 border border-pink-100 p-4 flex items-center justify-between gap-3 hover:bg-pink-50/60 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Music className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-[#7c5a6c] truncate">
                    {isPlaying
                      ? 'Sedang diputar'
                      : coupleSpace?.sharedSongTitle
                      ? 'Shared Playlist'
                      : playerStatus === 'error'
                      ? 'Player perlu dicek'
                      : 'Our Love Radio 💗'}
                  </div>
                  <div className="font-display text-sm font-semibold text-[#4a2336] truncate">
                    {coupleSpace?.sharedSongTitle
                      ? `${coupleSpace.sharedSongTitle} · ${coupleSpace.sharedSongArtist}`
                      : currentSong
                      ? `${currentSong.title} · ${currentSong.artist}`
                      : 'Pilih lagu'}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
            </button>
          </div>
        </motion.div>
      </section>

      {!focusCountdownOnly && (
        <>
          {/* Real-Time Couple Connection Status Banner */}
          <section className="rounded-3xl bg-white border border-pink-100 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {!firebaseReady ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-rose-500">Our Connection 💗</p>
                  <h2 className="font-display text-lg font-bold text-[#4a2336]">
                    Firebase Belum Terkonfigurasi
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b485b]">
                    Lengkapi konfigurasi Firebase agar koneksi dua perangkat dapat digunakan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('connection')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold cursor-pointer shrink-0"
                >
                  Cek Status
                </button>
              </>
            ) : !coupleSpace ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                    <Link2 className="w-4 h-4" />
                    <span>Our Connection · Status: Belum Terhubung</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336]">
                    Hubungkan HP Zikri & Diann ke Satu Ruang Privat
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b485b]">
                    Aktifkan Private Chat, Play Together real-time, Shared Memories, dan Shared Music Room.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('connection')}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Hubungkan Sekarang</span>
                </button>
              </>
            ) : !isPaired ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                    <Link2 className="w-4 h-4" />
                    <span>Menunggu Pasangan Bergabung (1 / 2 Anggota)</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336]">
                    Kode Undangan Ruang: <span className="font-mono text-rose-600">{coupleSpace.inviteCode}</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b485b]">
                    Masukkan kode di atas dari akun pasangan di halaman Our Connection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('connection')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-pink-50 border border-pink-200 text-rose-600 text-sm font-semibold hover:bg-pink-100 cursor-pointer shrink-0"
                >
                  Buka Our Connection
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="text-rose-600">Zikri ♡ Diann · Two Hearts, One Little World</span>
                    <span
                      className={`inline-flex items-center gap-1 ${
                        partnerOnline ? 'text-emerald-600' : 'text-[#7c5a6c]'
                      }`}
                    >
                      {partnerOnline ? (
                        <>
                          <Wifi className="w-3.5 h-3.5" />
                          <span>
                            {partnerName} Online
                            {partnerPresence?.sharePage ? ` (${partnerPresence.currentPage})` : ''}
                          </span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3.5 h-3.5" />
                          <span>{partnerName} Offline</span>
                        </>
                      )}
                    </span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#4a2336]">
                    Ruang Pasangan Terhubung Real-Time
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate('chat')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircleHeart className="w-4 h-4" />
                    <span>
                      Private Chat{unreadChatCount > 0 ? ` (${unreadChatCount})` : ''}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('mini-games')}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-pink-50 border border-pink-200 text-rose-600 text-sm font-semibold hover:bg-pink-100 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Play Together</span>
                  </button>
                </div>
              </>
            )}
          </section>

          {/* Quick Highlight Strip */}
          <section className="rounded-3xl bg-gradient-to-r from-[#fff0f5] via-[#fdf2f8] to-[#f5efff] border border-pink-100 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-500">
                <Heart className="w-4 h-4 fill-current" />
                <span>Rekomendasi Aktivitas Hari Ini</span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336]">
                Tiup lilin harapan, main Truth or Dare, atau buka Pesan Rahasia
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('candle')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Tiup Lilin
              </button>
              <button
                type="button"
                onClick={() => onNavigate('virtual-hug')}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-pink-200 text-rose-600 text-sm font-semibold hover:bg-pink-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Kirim Pelukan
              </button>
            </div>
          </section>

          {/* All Feature Cards Grid */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-[#4a2336]">
                Jelajahi Our Little World
              </h2>
              <span className="text-xs text-[#7c5a6c]">{featureCards.length} fitur interaktif</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {featureCards.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="group rounded-2xl bg-white border border-pink-100 p-4 sm:p-5 text-left hover:border-rose-200 hover:shadow-md hover:shadow-pink-100/50 transition-all flex items-start gap-4 cursor-pointer min-h-[84px]"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-base font-semibold text-[#4a2336] truncate">
                          {item.label}
                        </h3>
                        <ArrowRight className="w-4 h-4 text-pink-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-[#7c5a6c] leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
