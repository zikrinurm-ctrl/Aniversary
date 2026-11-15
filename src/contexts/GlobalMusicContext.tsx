import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAppData } from './AppDataContext';
import { useCouple } from './CoupleContext';
import { SongItem } from '../types';

export type RepeatMode = 'off' | 'all' | 'one';

export interface YTPlayerBridge {
  play: () => void;
  pause: () => void;
  seekTo: (sec: number) => void;
  setVolume: (vol0to100: number) => void;
  mute: () => void;
  unMute: () => void;
}

interface GlobalMusicContextValue {
  playlist: SongItem[];
  filteredPlaylist: SongItem[];
  audioPlaylist: SongItem[];
  activePlaylistId: string;
  activeSong: SongItem | null;
  activeIndex: number;
  isYoutubeTrack: boolean;

  isPlaying: boolean;
  isBuffering: boolean;
  errorMsg: string | null;
  listeningNotice: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  isExpanded: boolean;
  followPartnerSync: boolean;
  mediaSessionSupported: boolean;
  recentlyPlayedIds: string[];

  hasJoinedListening: boolean;
  partnerJoinedListening: boolean;

  setActivePlaylistId: (playlistId: string) => void;
  selectTrack: (songId: string, autoPlay?: boolean, broadcastToPartner?: boolean) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setExpanded: (open: boolean) => void;
  setFollowPartnerSync: (val: boolean) => void;
  clearListeningNotice: () => void;

  joinListeningSession: () => Promise<void>;
  leaveListeningSession: () => Promise<void>;

  // Bridge for the single root official YouTube IFrame Player
  registerYTBridge: (bridge: YTPlayerBridge | null) => void;
  reportYTState: (playing: boolean, buffering: boolean, curTime?: number, dur?: number, err?: string | null) => void;
  reportYTEnded: () => void;
}

const GlobalMusicContext = createContext<GlobalMusicContextValue | null>(null);

export function isAudioTrack(song: SongItem): boolean {
  return Boolean(song.audioUrl || song.sourceType === 'audio');
}

export const GlobalMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    songs: defaultSongs,
    setPlayerStatus,
    setPlayerErrorMsg,
    setCurrentSongIndex,
  } = useAppData();
  const {
    coupleSpace,
    spaceSongs,
    radioSync,
    syncSharedSongState,
    updateRadioSync,
    joinListeningTogether,
    leaveListeningTogether,
    recordMusicPlay,
  } = useCouple();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytBridgeRef = useRef<YTPlayerBridge | null>(null);

  const playlist = useMemo(() => {
    const merged = coupleSpace ? [...spaceSongs, ...defaultSongs] : defaultSongs;
    const seen = new Set<string>();
    return merged.filter((s) => {
      const key = s.id || s.youtubeId;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [coupleSpace, defaultSongs, spaceSongs]);

  const [activePlaylistId, setActivePlaylistIdState] = useState<string>('all');

  const filteredPlaylist = useMemo(() => {
    if (activePlaylistId === 'all') return playlist;
    if (activePlaylistId === 'favorites') return playlist.filter((s) => Boolean(s.isFavorite));
    if (activePlaylistId === 'special') {
      return playlist.filter((s) => Boolean(s.isSpecialSong) || s.moodTag === 'Special');
    }
    if (activePlaylistId.startsWith('mood:')) {
      const targetMood = activePlaylistId.replace('mood:', '');
      return playlist.filter((s) => s.moodTag === targetMood);
    }
    const matching = playlist.filter((s) => s.playlistId === activePlaylistId);
    return matching.length > 0 ? matching : playlist;
  }, [activePlaylistId, playlist]);

  const audioPlaylist = useMemo(() => playlist.filter(isAudioTrack), [playlist]);

  const [activeSongId, setActiveSongId] = useState<string>(() => 'audio-our-little-world');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [listeningNotice, setListeningNotice] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isExpanded, setExpanded] = useState(false);
  const [followPartnerSync, setFollowPartnerSync] = useState(true);
  const [recentlyPlayedIds, setRecentlyPlayedIds] = useState<string[]>([]);

  const mediaSessionSupported =
    typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  const activeIndex = useMemo(() => {
    const idx = playlist.findIndex(
      (s) => s.id === activeSongId || s.youtubeId === activeSongId
    );
    return idx >= 0 ? idx : 0;
  }, [activeSongId, playlist]);

  const activeSong = playlist[activeIndex] || playlist[0] || null;
  const isYoutubeTrack = Boolean(activeSong && !isAudioTrack(activeSong));

  const hasJoinedListening = useMemo(() => {
    if (!coupleSpace || !user || !radioSync) return false;
    return coupleSpace.member1Uid === user.uid ? radioSync.member1Joined : radioSync.member2Joined;
  }, [coupleSpace, radioSync, user]);

  const partnerJoinedListening = useMemo(() => {
    if (!coupleSpace || !user || !radioSync) return false;
    return coupleSpace.member1Uid === user.uid ? radioSync.member2Joined : radioSync.member1Joined;
  }, [coupleSpace, radioSync, user]);

  useEffect(() => {
    setCurrentSongIndex(activeIndex);
  }, [activeIndex, setCurrentSongIndex]);

  useEffect(() => {
    if (errorMsg) {
      setPlayerStatus('error');
      setPlayerErrorMsg(errorMsg);
    } else if (isBuffering) {
      setPlayerStatus('loading');
      setPlayerErrorMsg(null);
    } else if (isPlaying) {
      setPlayerStatus('playing');
      setPlayerErrorMsg(null);
    } else {
      setPlayerStatus('paused');
    }
  }, [errorMsg, isBuffering, isPlaying, setPlayerErrorMsg, setPlayerStatus]);

  // Apply volume & mute to both persistent HTML5 audio and YT bridge
  useEffect(() => {
    const el = audioRef.current;
    if (el) {
      el.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
    }
    const yt = ytBridgeRef.current;
    if (yt) {
      yt.setVolume(Math.round(volume * 100));
      if (muted) yt.mute();
      else yt.unMute();
    }
  }, [volume, muted]);

  const registerYTBridge = useCallback(
    (bridge: YTPlayerBridge | null) => {
      ytBridgeRef.current = bridge;
      if (bridge) {
        bridge.setVolume(Math.round(volume * 100));
        if (muted) bridge.mute();
        else bridge.unMute();
      }
    },
    [muted, volume]
  );

  // Mutual Exclusion Guarantee: pausing YT if HTML5 starts, or pausing HTML5 if YT starts
  const reportYTState = useCallback(
    (
      playing: boolean,
      buffering: boolean,
      curTime?: number,
      dur?: number,
      err?: string | null
    ) => {
      if (playing) {
        const el = audioRef.current;
        if (el && !el.paused) {
          el.pause();
        }
      }
      setIsPlaying(playing);
      setIsBuffering(buffering);
      if (typeof curTime === 'number' && Number.isFinite(curTime)) setCurrentTime(curTime);
      if (typeof dur === 'number' && Number.isFinite(dur) && dur > 0) setDuration(dur);
      if (err !== undefined) setErrorMsg(err);
    },
    []
  );

  const pendingPlayAfterLoadRef = useRef(false);
  const pendingSeekSecRef = useRef<number | null>(null);
  const loadedSrcRef = useRef<string>('');

  // Load audio source only when track changes
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !activeSong) return;

    if (!isAudioTrack(activeSong) || !activeSong.audioUrl) {
      if (!el.paused) el.pause();
      loadedSrcRef.current = '';
      setIsPlaying(false);
      setIsBuffering(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // Pause YouTube before playing audio track
    ytBridgeRef.current?.pause();

    const nextSrc = activeSong.audioUrl;
    if (loadedSrcRef.current !== nextSrc) {
      loadedSrcRef.current = nextSrc;
      setErrorMsg(null);
      setIsBuffering(true);
      el.src = nextSrc;
      el.load();
      setDuration(activeSong.durationSec || 0);
      setCurrentTime(0);

      if (pendingSeekSecRef.current !== null) {
        const sec = pendingSeekSecRef.current;
        pendingSeekSecRef.current = null;
        try {
          el.currentTime = Math.max(0, sec);
        } catch {
          // Will seek on loadedmetadata if needed
        }
      }

      if (pendingPlayAfterLoadRef.current) {
        pendingPlayAfterLoadRef.current = false;
        void el
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsBuffering(false);
            setListeningNotice(null);
          })
          .catch(() => {
            setIsPlaying(false);
            setIsBuffering(false);
            setListeningNotice(
              'Ketuk tombol Play pada perangkat ini untuk melanjutkan pemutaran bersama.'
            );
          });
      } else {
        setIsPlaying(false);
        setIsBuffering(false);
      }
    }
  }, [activeSong]);

  const trackPlayTelemetry = useCallback(
    (song: SongItem) => {
      setRecentlyPlayedIds((prev) => {
        const next = [song.id, ...prev.filter((id) => id !== song.id)];
        return next.slice(0, 15);
      });
      if (coupleSpace) {
        void recordMusicPlay(song);
      }
    },
    [coupleSpace, recordMusicPlay]
  );

  const selectTrack = useCallback(
    (songId: string, autoPlay = true, broadcastToPartner = true) => {
      const target = playlist.find((s) => s.id === songId || s.youtubeId === songId);
      if (!target) return;
      setErrorMsg(null);
      setListeningNotice(null);

      if (isAudioTrack(target) && target.audioUrl) {
        ytBridgeRef.current?.pause();
        const el = audioRef.current;
        if (target.id === activeSong?.id && el) {
          if (autoPlay) {
            void el
              .play()
              .then(() => {
                setIsPlaying(true);
                trackPlayTelemetry(target);
              })
              .catch(() =>
                setListeningNotice('Ketuk tombol Play sekali lagi untuk memulai audio di browser ini.')
              );
          }
        } else {
          pendingPlayAfterLoadRef.current = autoPlay;
          setActiveSongId(target.id);
          if (autoPlay) trackPlayTelemetry(target);
        }
      } else {
        // YouTube Track: strictly pause any HTML5 audio
        const el = audioRef.current;
        if (el && !el.paused) el.pause();
        pendingPlayAfterLoadRef.current = false;
        setActiveSongId(target.id);
        if (autoPlay) trackPlayTelemetry(target);
      }

      if (broadcastToPartner && coupleSpace) {
        const targetIndex = Math.max(
          0,
          playlist.findIndex((s) => s.id === target.id)
        );
        void syncSharedSongState(target, autoPlay);
        void updateRadioSync({
          song: target,
          playlistId: activePlaylistId,
          currentIndex: targetIndex,
          playbackStatus: autoPlay ? 'playing' : 'paused',
          currentPosition: 0,
          joinMember: true,
        });
      }
    },
    [
      activePlaylistId,
      activeSong?.id,
      coupleSpace,
      playlist,
      syncSharedSongState,
      trackPlayTelemetry,
      updateRadioSync,
    ]
  );

  // Sync incoming partner changes from radioSync when user has joined or followPartnerSync is enabled
  const lastAppliedSyncRef = useRef<string>('');
  useEffect(() => {
    if (!coupleSpace || !radioSync || !followPartnerSync || !radioSync.songId) return;
    if (user && radioSync.lastUpdatedByUid === user.uid) return;

    const syncFingerprint = `${radioSync.songId}_${radioSync.playbackStatus}_${radioSync.playlistId}_${radioSync.updatedAtMs}`;
    if (lastAppliedSyncRef.current === syncFingerprint) return;
    lastAppliedSyncRef.current = syncFingerprint;

    if (radioSync.playlistId && radioSync.playlistId !== activePlaylistId) {
      setActivePlaylistIdState(radioSync.playlistId);
    }

    const matched = playlist.find(
      (s) => s.id === radioSync.songId || s.youtubeId === radioSync.songId
    );
    if (!matched) return;

    // Never force autoplay unless user explicitly clicked JOIN LISTENING
    if (!hasJoinedListening) {
      if (matched.id !== activeSong?.id) {
        pendingPlayAfterLoadRef.current = false;
        setActiveSongId(matched.id);
        setCurrentTime(radioSync.currentPosition || 0);
      }
      return;
    }

    const wantsPlay = radioSync.playbackStatus === 'playing';
    if (matched.id !== activeSong?.id) {
      pendingSeekSecRef.current = radioSync.currentPosition || 0;
      pendingPlayAfterLoadRef.current = wantsPlay;
      setActiveSongId(matched.id);
    } else if (isAudioTrack(matched) && audioRef.current) {
      const el = audioRef.current;
      if (Math.abs((el.currentTime || 0) - (radioSync.currentPosition || 0)) > 4) {
        el.currentTime = Math.max(0, radioSync.currentPosition || 0);
      }
      if (wantsPlay && el.paused) {
        void el
          .play()
          .then(() => {
            setIsPlaying(true);
            setListeningNotice(null);
          })
          .catch(() => {
            setIsPlaying(false);
            setListeningNotice(
              `${radioSync.lastUpdatedByName} memulai lagu. Ketuk Play di perangkatmu untuk sinkron suara.`
            );
          });
      } else if (!wantsPlay && !el.paused) {
        el.pause();
        setIsPlaying(false);
      }
    } else if (!isAudioTrack(matched) && ytBridgeRef.current) {
      if (wantsPlay) ytBridgeRef.current.play();
      else ytBridgeRef.current.pause();
    }
  }, [
    activePlaylistId,
    activeSong?.id,
    coupleSpace,
    followPartnerSync,
    hasJoinedListening,
    playlist,
    radioSync,
    user,
  ]);

  const joinListeningSession = useCallback(async () => {
    setErrorMsg(null);
    setListeningNotice(null);
    if (coupleSpace) {
      await joinListeningTogether();
    }

    const targetId = radioSync?.songId || activeSong?.id;
    const target = playlist.find((s) => s.id === targetId || s.youtubeId === targetId) || activeSong;
    if (!target) return;

    if (radioSync?.playlistId) {
      setActivePlaylistIdState(radioSync.playlistId);
    }

    const targetPos = radioSync?.currentPosition || 0;
    if (isAudioTrack(target) && target.audioUrl) {
      ytBridgeRef.current?.pause();
      if (target.id === activeSong?.id && audioRef.current) {
        const el = audioRef.current;
        try {
          if (targetPos > 0) el.currentTime = targetPos;
        } catch {
          // Ignore seek fail before load
        }
        await el
          .play()
          .then(() => {
            setIsPlaying(true);
            trackPlayTelemetry(target);
          })
          .catch(() => {
            setListeningNotice('Ketuk tombol Play sekali lagi untuk mulai memutar.');
          });
      } else {
        pendingSeekSecRef.current = targetPos;
        pendingPlayAfterLoadRef.current = true;
        setActiveSongId(target.id);
        trackPlayTelemetry(target);
      }
    } else {
      // YouTube track joined
      const el = audioRef.current;
      if (el && !el.paused) el.pause();
      if (target.id !== activeSong?.id) {
        setActiveSongId(target.id);
      }
      ytBridgeRef.current?.play();
      trackPlayTelemetry(target);
    }
  }, [activeSong, coupleSpace, joinListeningTogether, playlist, radioSync, trackPlayTelemetry]);

  const leaveListeningSession = useCallback(async () => {
    if (coupleSpace) {
      await leaveListeningTogether();
    }
  }, [coupleSpace, leaveListeningTogether]);

  const pickAdjacentSong = useCallback(
    (dir: 1 | -1): SongItem | null => {
      const pool = filteredPlaylist.length > 0 ? filteredPlaylist : playlist;
      if (pool.length === 0) return null;
      const curIdx = pool.findIndex((s) => s.id === activeSong?.id);

      if (shuffle && pool.length > 1) {
        let randIdx = Math.floor(Math.random() * pool.length);
        if (randIdx === curIdx) randIdx = (curIdx + 1) % pool.length;
        return pool[randIdx];
      }

      if (curIdx < 0) return pool[0];
      const nextIdx = (curIdx + dir + pool.length) % pool.length;
      return pool[nextIdx];
    },
    [activeSong?.id, filteredPlaylist, playlist, shuffle]
  );

  const playNext = useCallback(() => {
    const next = pickAdjacentSong(1);
    if (next) selectTrack(next.id, true, true);
  }, [pickAdjacentSong, selectTrack]);

  const playPrev = useCallback(() => {
    const el = audioRef.current;
    if (el && el.currentTime > 4) {
      el.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prev = pickAdjacentSong(-1);
    if (prev) selectTrack(prev.id, true, true);
  }, [pickAdjacentSong, selectTrack]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!activeSong) return;
    setErrorMsg(null);
    setListeningNotice(null);

    if (!isAudioTrack(activeSong)) {
      // Toggle YouTube official bridge if present; pause HTML5 first
      if (el && !el.paused) el.pause();
      if (ytBridgeRef.current) {
        if (isPlaying) {
          ytBridgeRef.current.pause();
          setIsPlaying(false);
          if (coupleSpace) {
            void syncSharedSongState(activeSong, false);
            void updateRadioSync({
              song: activeSong,
              playlistId: activePlaylistId,
              currentIndex: activeIndex,
              playbackStatus: 'paused',
              currentPosition: currentTime,
            });
          }
        } else {
          ytBridgeRef.current.play();
          setIsPlaying(true);
          trackPlayTelemetry(activeSong);
          if (coupleSpace) {
            void syncSharedSongState(activeSong, true);
            void updateRadioSync({
              song: activeSong,
              playlistId: activePlaylistId,
              currentIndex: activeIndex,
              playbackStatus: 'playing',
              currentPosition: currentTime,
              joinMember: true,
            });
          }
        }
      }
      return;
    }

    if (!el) return;
    ytBridgeRef.current?.pause();
    if (el.paused) {
      setIsBuffering(true);
      void el
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
          trackPlayTelemetry(activeSong);
          if (coupleSpace) {
            void syncSharedSongState(activeSong, true);
            void updateRadioSync({
              song: activeSong,
              playlistId: activePlaylistId,
              currentIndex: activeIndex,
              playbackStatus: 'playing',
              currentPosition: el.currentTime || 0,
              joinMember: true,
            });
          }
        })
        .catch(() => {
          setIsPlaying(false);
          setIsBuffering(false);
          setErrorMsg('Browser menunggu interaksi klik langsung untuk memutar audio.');
        });
    } else {
      el.pause();
      setIsPlaying(false);
      if (coupleSpace) {
        void syncSharedSongState(activeSong, false);
        void updateRadioSync({
          song: activeSong,
          playlistId: activePlaylistId,
          currentIndex: activeIndex,
          playbackStatus: 'paused',
          currentPosition: el.currentTime || 0,
        });
      }
    }
  }, [
    activeIndex,
    activePlaylistId,
    activeSong,
    coupleSpace,
    currentTime,
    isPlaying,
    syncSharedSongState,
    trackPlayTelemetry,
    updateRadioSync,
  ]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (!Number.isFinite(seconds)) return;
      if (isYoutubeTrack) {
        const clamped = Math.max(0, Math.min(seconds, duration || seconds));
        ytBridgeRef.current?.seekTo(clamped);
        setCurrentTime(clamped);
        return;
      }
      const el = audioRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(seconds, el.duration || duration || seconds));
      el.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration, isYoutubeTrack]
  );

  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      setVolumeState(clamped);
      if (clamped > 0 && muted) setMuted(false);
    },
    [muted]
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () =>
      setRepeatMode((prev) =>
        prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
      ),
    []
  );
  const setActivePlaylistId = useCallback((id: string) => {
    setActivePlaylistIdState(id);
  }, []);
  const clearListeningNotice = useCallback(() => setListeningNotice(null), []);

  const reportYTEnded = useCallback(() => {
    if (repeatMode === 'one') {
      ytBridgeRef.current?.seekTo(0);
      ytBridgeRef.current?.play();
      return;
    }
    const pool = filteredPlaylist.length > 0 ? filteredPlaylist : playlist;
    const idx = pool.findIndex((s) => s.id === activeSong?.id);
    if (repeatMode === 'off' && !shuffle && idx === pool.length - 1) {
      setIsPlaying(false);
      return;
    }
    playNext();
  }, [activeSong?.id, filteredPlaylist, playNext, playlist, repeatMode, shuffle]);

  // HTML5 Audio Element Event Listeners
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onLoadedMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDuration(el.duration);
      }
      setIsBuffering(false);
    };
    const onCanPlay = () => setIsBuffering(false);
    const onWaiting = () => setIsBuffering(true);
    const onTimeUpdate = () => {
      setCurrentTime(el.currentTime || 0);
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setDuration(el.duration);
      }
    };
    const onPlay = () => {
      ytBridgeRef.current?.pause();
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const onPause = () => {
      if (!isYoutubeTrack) setIsPlaying(false);
    };
    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setErrorMsg('Sumber audio tidak dapat dimuat atau format belum didukung di browser ini.');
    };
    const onEnded = () => {
      if (repeatMode === 'one') {
        el.currentTime = 0;
        void el.play().catch(() => setIsPlaying(false));
        return;
      }
      const pool = audioPlaylist.length > 0 ? audioPlaylist : playlist;
      const idx = pool.findIndex((s) => s.id === activeSong?.id);
      if (repeatMode === 'off' && !shuffle && idx === pool.length - 1) {
        setIsPlaying(false);
        return;
      }
      playNext();
    };

    el.addEventListener('loadedmetadata', onLoadedMeta);
    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('error', onError);
    el.addEventListener('ended', onEnded);

    return () => {
      el.removeEventListener('loadedmetadata', onLoadedMeta);
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('error', onError);
      el.removeEventListener('ended', onEnded);
    };
  }, [activeSong?.id, audioPlaylist, isYoutubeTrack, playNext, playlist, repeatMode, shuffle]);

  // Media Session API (for HTML5 Audio sources when supported by device/OS)
  useEffect(() => {
    if (!mediaSessionSupported || !activeSong || isYoutubeTrack) return;

    const resolveArtworkSrc = (rawUrl?: string): string => {
      if (!rawUrl) return `${window.location.origin}/favicon.ico`;
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
        return rawUrl;
      }
      return `${window.location.origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    };

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeSong.title,
        artist: activeSong.artist,
        album: 'Our Love Radio — Zikri & Diann',
        artwork: [
          {
            src: resolveArtworkSrc(activeSong.artworkUrl),
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    } catch {
      // Ignore partial MediaMetadata implementations
    }

    const safeHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Unsupported action
      }
    };

    safeHandler('play', () => {
      const el = audioRef.current;
      if (el && isAudioTrack(activeSong)) {
        void el.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        togglePlay();
      }
    });
    safeHandler('pause', () => {
      const el = audioRef.current;
      if (el) el.pause();
      setIsPlaying(false);
    });
    safeHandler('previoustrack', () => playPrev());
    safeHandler('nexttrack', () => playNext());
    safeHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number') seekTo(details.seekTime);
    });
    safeHandler('seekbackward', (details) => {
      const step = details.seekOffset || 10;
      seekTo(Math.max(0, (audioRef.current?.currentTime || 0) - step));
    });
    safeHandler('seekforward', (details) => {
      const step = details.seekOffset || 10;
      seekTo((audioRef.current?.currentTime || 0) + step);
    });
  }, [
    activeSong,
    isPlaying,
    isYoutubeTrack,
    mediaSessionSupported,
    playNext,
    playPrev,
    seekTo,
    togglePlay,
  ]);

  useEffect(() => {
    if (!mediaSessionSupported || isYoutubeTrack || !activeSong) return;
    if (typeof navigator.mediaSession.setPositionState !== 'function') return;
    if (!Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position: Math.max(0, Math.min(currentTime, duration)),
      });
    } catch {
      // Ignore
    }
  }, [activeSong, currentTime, duration, isYoutubeTrack, mediaSessionSupported]);

  const value: GlobalMusicContextValue = {
    playlist,
    filteredPlaylist,
    audioPlaylist,
    activePlaylistId,
    activeSong,
    activeIndex,
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
    recentlyPlayedIds,
    hasJoinedListening,
    partnerJoinedListening,
    setActivePlaylistId,
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
    joinListeningSession,
    leaveListeningSession,
    registerYTBridge,
    reportYTState,
    reportYTEnded,
  };

  return (
    <GlobalMusicContext.Provider value={value}>
      {/* Single persistent HTML5 audio element mounted at root */}
      <audio ref={audioRef} preload="metadata" playsInline className="hidden" />
      {children}
    </GlobalMusicContext.Provider>
  );
};

export function useGlobalMusic(): GlobalMusicContextValue {
  const ctx = useContext(GlobalMusicContext);
  if (!ctx) throw new Error('useGlobalMusic must be used inside GlobalMusicProvider');
  return ctx;
}
