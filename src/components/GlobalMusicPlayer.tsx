import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  ChevronDown,
  Disc3,
  ExternalLink,
  Heart,
  ListMusic,
  Loader2,
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  Radio,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useGlobalMusic } from '../contexts/GlobalMusicContext';
import { useCouple } from '../contexts/CoupleContext';
import { EqualizerBars } from './EqualizerBars';
import { PageId } from '../types';

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
            onError?: (e: { data: number }) => void;
          };
        }
      ) => {
        loadVideoById: (videoId: string) => void;
        cueVideoById: (videoId: string) => void;
        playVideo: () => void;
        pauseVideo: () => void;
        seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
        setVolume: (vol: number) => void;
        mute: () => void;
        unMute: () => void;
        getCurrentTime?: () => number;
        getDuration?: () => number;
        destroy: () => void;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const GlobalMusicPlayer: React.FC<{ onNavigate?: (page: PageId) => void }> = ({
  onNavigate,
}) => {
  const {
    filteredPlaylist,
    activeSong,
    isYoutubeTrack,
    isPlaying,
    isBuffering,
    errorMsg,
    listeningNotice,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeatMode,
    isExpanded,
    followPartnerSync,
    mediaSessionSupported,
    selectTrack,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    setExpanded,
    setFollowPartnerSync,
    clearListeningNotice,
    registerYTBridge,
    reportYTState,
    reportYTEnded,
  } = useGlobalMusic();

  const { coupleSpace } = useCouple();
  const [minimizedBubble, setMinimizedBubble] = useState(false);

  // Single root official YouTube Embedded Player (never recreated on internal route navigation)
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<InstanceType<NonNullable<Window['YT']>['Player']> | null>(null);
  const ytTimeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isYoutubeTrack || !activeSong?.youtubeId) {
      if (ytTimeTimerRef.current) {
        window.clearInterval(ytTimeTimerRef.current);
        ytTimeTimerRef.current = null;
      }
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore
        }
        ytPlayerRef.current = null;
      }
      registerYTBridge(null);
      return;
    }

    let cancelled = false;

    const mountOfficialYT = () => {
      if (cancelled || !ytHostRef.current || !window.YT?.Player) return;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById(activeSong.youtubeId);
        } catch {
          reportYTState(false, false, 0, 0, 'Gagal memuat video YouTube.');
        }
        return;
      }

      ytHostRef.current.innerHTML = '<div id="our-love-radio-yt-frame"></div>';
      const mountEl = ytHostRef.current.querySelector('#our-love-radio-yt-frame') as HTMLElement;

      const player = new window.YT.Player(mountEl, {
        videoId: activeSong.youtubeId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: () => {
            if (cancelled) return;
            registerYTBridge({
              play: () => {
                try {
                  player.playVideo();
                } catch {
                  // Ignore
                }
              },
              pause: () => {
                try {
                  player.pauseVideo();
                } catch {
                  // Ignore
                }
              },
              seekTo: (s: number) => {
                try {
                  player.seekTo(s, true);
                } catch {
                  // Ignore
                }
              },
              setVolume: (v: number) => {
                try {
                  player.setVolume(v);
                } catch {
                  // Ignore
                }
              },
              mute: () => {
                try {
                  player.mute();
                } catch {
                  // Ignore
                }
              },
              unMute: () => {
                try {
                  player.unMute();
                } catch {
                  // Ignore
                }
              },
            });
          },
          onStateChange: (e: { data: number }) => {
            if (cancelled) return;
            // YT states: 0=ended, 1=playing, 2=paused, 3=buffering
            const cur = player.getCurrentTime?.() || 0;
            const dur = player.getDuration?.() || 0;
            if (e.data === 1) {
              reportYTState(true, false, cur, dur, null);
            } else if (e.data === 3) {
              reportYTState(false, true, cur, dur, null);
            } else if (e.data === 2) {
              reportYTState(false, false, cur, dur, null);
            } else if (e.data === 0) {
              reportYTState(false, false, dur, dur, null);
              reportYTEnded();
            }
          },
          onError: () => {
            if (!cancelled) {
              reportYTState(
                false,
                false,
                0,
                0,
                'Video YouTube tidak dapat di-embed atau dibatasi oleh pemilik video. Coba ganti URL YouTube lain atau putar Audio HTML5.'
              );
            }
          },
        },
      });
      ytPlayerRef.current = player;

      if (ytTimeTimerRef.current) window.clearInterval(ytTimeTimerRef.current);
      ytTimeTimerRef.current = window.setInterval(() => {
        if (!ytPlayerRef.current) return;
        const cur = ytPlayerRef.current.getCurrentTime?.();
        const dur = ytPlayerRef.current.getDuration?.();
        if (typeof cur === 'number' && typeof dur === 'number' && dur > 0) {
          // Sync scrubber gently while playing
          reportYTState(true, false, cur, dur);
        }
      }, 1000);
    };

    if (window.YT?.Player) {
      mountOfficialYT();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://www.youtube.com/iframe_api"]'
      );
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
      const prevCb = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCb?.();
        mountOfficialYT();
      };
    }

    return () => {
      cancelled = true;
    };
  }, [activeSong?.youtubeId, isYoutubeTrack, registerYTBridge, reportYTEnded, reportYTState]);

  useEffect(() => {
    return () => {
      if (ytTimeTimerRef.current) window.clearInterval(ytTimeTimerRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // Ignore
        }
        ytPlayerRef.current = null;
      }
      registerYTBridge(null);
    };
  }, [registerYTBridge]);

  if (!activeSong) return null;

  const progressPct =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <>
      {/* Persistent Official YouTube Player Dock (visible, compliant >= 200px, survives navigation) */}
      {isYoutubeTrack && (
        <div
          className={`fixed z-40 transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-pink-200 bg-black ${
            isExpanded
              ? 'top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[440px] aspect-video'
              : 'bottom-[140px] md:bottom-[92px] right-3 w-[224px] sm:w-[256px] aspect-video'
          }`}
        >
          <div ref={ytHostRef} className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full" />
        </div>
      )}

      {/* Persistent Floating Mini Player */}
      {!isExpanded && (
        <div className="fixed bottom-[72px] md:bottom-5 right-3 left-3 md:left-auto md:w-[356px] z-30 pointer-events-none flex justify-end">
          {minimizedBubble ? (
            <button
              type="button"
              onClick={() => setMinimizedBubble(false)}
              aria-label="Tampilkan mini player Our Love Radio"
              className="pointer-events-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-500 text-white shadow-lg shadow-rose-300/50 border border-white/70 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer relative"
            >
              <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
              )}
            </button>
          ) : (
            <div className="pointer-events-auto w-full rounded-2xl bg-white/88 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-rose-200/40 overflow-hidden">
              {/* Top Progress Track */}
              <div className="h-1 w-full bg-pink-100">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-[width] duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {listeningNotice && (
                <div className="px-3 py-1.5 bg-rose-50 border-b border-pink-100 flex items-center justify-between gap-2 text-[11px] text-rose-700">
                  <span className="truncate">{listeningNotice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearListeningNotice();
                      togglePlay();
                    }}
                    className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-semibold shrink-0 cursor-pointer"
                  >
                    Putar
                  </button>
                </div>
              )}

              <div className="px-3 py-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-pink-100 overflow-hidden shrink-0 relative flex items-center justify-center border border-pink-200/70">
                    {activeSong.artworkUrl ? (
                      <img
                        src={activeSong.artworkUrl}
                        alt={activeSong.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-xs font-bold text-[#4a2336] truncate">
                        {activeSong.title}
                      </span>
                      <EqualizerBars active={isPlaying && !isBuffering} size="sm" />
                    </div>
                    <div className="text-[11px] text-[#7c5a6c] truncate flex items-center gap-1.5">
                      <span className="truncate">{activeSong.artist}</span>
                      {duration > 0 && (
                        <span className="shrink-0 tabular-nums text-[10px] text-rose-500 font-semibold">
                          {formatSec(currentTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause lagu' : 'Play lagu'}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    {isBuffering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={playNext}
                    aria-label="Lagu berikutnya"
                    className="min-h-[40px] min-w-[36px] rounded-xl bg-pink-50 text-rose-600 hover:bg-pink-100 flex items-center justify-center cursor-pointer"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    aria-label="Buka Full Screen Player"
                    className="min-h-[40px] min-w-[36px] rounded-xl text-[#6b485b] hover:bg-pink-50 flex items-center justify-center cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinimizedBubble(true)}
                    aria-label="Kecilkan mini player"
                    className="min-h-[40px] min-w-[32px] rounded-xl text-[#9b7a8c] hover:bg-pink-50 flex items-center justify-center cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expandable Full Screen Music Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-35 bg-black/55 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full md:max-w-xl max-h-[92vh] bg-gradient-to-b from-[#fff5f9] via-white to-[#f6efff] rounded-t-3xl md:rounded-3xl border border-pink-100 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 pt-3 pb-3 border-b border-pink-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="Tutup full player"
                  className="min-h-[44px] min-w-[44px] rounded-xl text-[#6b485b] hover:bg-pink-50 flex items-center justify-center cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <div className="text-center min-w-0">
                  <div className="text-[11px] font-semibold text-rose-500">
                    OUR LOVE RADIO 💗
                  </div>
                  <div className="font-display text-sm font-bold text-[#4a2336] truncate">
                    Zikri & Diann Player
                  </div>
                </div>
                {onNavigate ? (
                  <button
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      onNavigate('music');
                    }}
                    className="min-h-[40px] px-3 rounded-xl bg-pink-50 text-rose-600 text-xs font-semibold hover:bg-pink-100 inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Radio</span>
                  </button>
                ) : (
                  <div className="w-11" />
                )}
              </div>

              <div className="p-5 overflow-y-auto space-y-5">
                {/* Spacer when floating official YT video sits on top OR Album Art for HTML5 Audio */}
                {isYoutubeTrack ? (
                  <div className="pt-44 sm:pt-56 text-center space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <h2 className="font-display text-xl font-bold text-[#4a2336] text-balance">
                        {activeSong.title}
                      </h2>
                      <EqualizerBars active={isPlaying && !isBuffering} size="md" />
                    </div>
                    <p className="text-xs sm:text-sm text-[#7c5a6c]">{activeSong.artist}</p>
                    <p className="text-[11px] font-medium text-rose-500">
                      Official YouTube Embed · Pemutaran mengikuti kebijakan YouTube
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 border-4 border-white shadow-xl shadow-rose-200/40 flex items-center justify-center">
                      {activeSong.artworkUrl ? (
                        <img
                          src={activeSong.artworkUrl}
                          alt={activeSong.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Heart className="w-12 h-12 text-rose-400 fill-current" />
                      )}
                      {isPlaying && (
                        <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-full bg-rose-500/90 text-white flex items-center gap-1.5 shadow-md">
                          <EqualizerBars active size="sm" light />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 max-w-sm">
                      <h2 className="font-display text-xl font-bold text-[#4a2336] text-balance">
                        {activeSong.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#7c5a6c]">{activeSong.artist}</p>
                      <p className="text-[11px] font-medium text-rose-500">
                        HTML5 Audio · Tetap aktif saat navigasi internal
                      </p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Progress Scrubber */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(1, duration || 1)}
                    step={0.5}
                    value={Math.min(currentTime, Math.max(1, duration || 1))}
                    disabled={duration <= 0}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    aria-label="Progress lagu"
                    className="w-full accent-rose-500 cursor-pointer disabled:opacity-40"
                  />
                  <div className="flex justify-between text-[11px] font-medium text-[#7c5a6c] tabular-nums">
                    <span>{formatSec(currentTime)}</span>
                    <span>{formatSec(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-2 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={toggleShuffle}
                    aria-label="Toggle shuffle"
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      shuffle
                        ? 'bg-rose-100 text-rose-600'
                        : 'text-[#7c5a6c] hover:bg-pink-50'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={playPrev}
                    aria-label="Lagu sebelumnya"
                    className="min-h-[48px] min-w-[48px] rounded-2xl bg-pink-50 text-rose-600 hover:bg-pink-100 flex items-center justify-center cursor-pointer"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="min-h-[56px] min-w-[56px] rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-lg shadow-rose-300/50 hover:brightness-105 active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    {isBuffering ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={playNext}
                    aria-label="Lagu berikutnya"
                    className="min-h-[48px] min-w-[48px] rounded-2xl bg-pink-50 text-rose-600 hover:bg-pink-100 flex items-center justify-center cursor-pointer"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={cycleRepeat}
                    aria-label={`Repeat: ${repeatMode}`}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      repeatMode !== 'off'
                        ? 'bg-rose-100 text-rose-600'
                        : 'text-[#7c5a6c] hover:bg-pink-50'
                    }`}
                  >
                    {repeatMode === 'one' ? (
                      <Repeat1 className="w-5 h-5" />
                    ) : (
                      <Repeat className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3 max-w-sm mx-auto bg-white rounded-2xl border border-pink-100 px-3.5 py-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? 'Unmute' : 'Mute'}
                    className="min-h-[36px] min-w-[36px] rounded-lg text-rose-500 hover:bg-pink-50 flex items-center justify-center cursor-pointer"
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={muted ? 0 : volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Volume musik"
                    className="flex-1 accent-rose-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-[#7c5a6c] w-9 text-right tabular-nums">
                    {Math.round((muted ? 0 : volume) * 100)}%
                  </span>
                </div>

                {/* Honest Capability & Partner Sync Info */}
                <div className="rounded-2xl bg-pink-50/70 border border-pink-100 p-3.5 space-y-2 text-xs text-[#5e3c4e]">
                  {coupleSpace && (
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-pink-100">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600">
                        <Radio className="w-3.5 h-3.5" />
                        <span>Sinkronisasi Lagu Pasangan</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setFollowPartnerSync(!followPartnerSync)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                          followPartnerSync
                            ? 'bg-rose-500 text-white'
                            : 'bg-white border border-pink-200 text-[#6b485b]'
                        }`}
                      >
                        {followPartnerSync ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                  )}
                  <p className="leading-relaxed">
                    {isYoutubeTrack
                      ? 'Video YouTube diputar melalui Official YouTube Player; pemutaran saat layar terkunci bergantung pada kebijakan YouTube & browser perangkatmu.'
                      : mediaSessionSupported
                      ? 'Media Session API tersedia untuk track Audio HTML5 ini; dukungan kontrol latar & lock-screen tetap bergantung pada OS serta browser perangkat.'
                      : 'Pemutaran Audio HTML5 aktif selama sesi tab website berjalan di perangkat.'}
                  </p>
                </div>

                {/* Queue List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#4a2336]">
                    <span className="inline-flex items-center gap-1.5">
                      <ListMusic className="w-4 h-4 text-rose-500" />
                      <span>Antrean Aktif ({filteredPlaylist.length})</span>
                    </span>
                    <span className="text-[#7c5a6c]">Ketuk untuk memutar</span>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {filteredPlaylist.map((song) => {
                      const active = song.id === activeSong.id;
                      const isYt = !song.audioUrl && song.sourceType !== 'audio';
                      return (
                        <button
                          key={song.id}
                          type="button"
                          onClick={() => selectTrack(song.id, true, true)}
                          className={`w-full min-h-[52px] rounded-2xl border px-3 py-2 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-white border-pink-100 hover:bg-pink-50/50'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-pink-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {song.artworkUrl ? (
                              <img
                                src={song.artworkUrl}
                                alt={song.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Music className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm font-semibold text-[#4a2336] truncate">
                              {song.title}
                            </div>
                            <div className="text-[11px] text-[#7c5a6c] truncate">
                              {song.artist} · {isYt ? 'YouTube' : 'Audio HTML5'}
                            </div>
                          </div>
                          {active && <EqualizerBars active={isPlaying} size="sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
