import React, { useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  BookHeart,
  CheckCircle2,
  Clock,
  Disc3,
  ExternalLink,
  FileAudio,
  FolderPlus,
  Heart,
  History,
  ImagePlus,
  Link as LinkIcon,
  ListMusic,
  Loader2,
  MailOpen,
  Maximize2,
  Music,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat,
  Repeat1,
  Search,
  Send,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppData } from '../contexts/AppDataContext';
import { useCouple } from '../contexts/CoupleContext';
import { useGlobalMusic } from '../contexts/GlobalMusicContext';
import { EqualizerBars, FloatingMusicNotes } from '../components/EqualizerBars';
import { SongDedicationModal } from '../components/SongDedicationModal';
import {
  buildYouTubeSearchUrl,
  CURATED_RADIO_CATALOG,
  CatalogCollectionId,
  RADIO_CATALOG_COLLECTIONS,
  verifyYouTubeUrlViaOEmbed,
} from '../data/radioCatalog';
import { COUPLE_HERO_IMAGE } from '../data/seedCore';
import { RadioMoodTag, SharedPlaylistMood, SongDedication, SongItem } from '../types';

type RadioTab = 'playlist' | 'catalog' | 'dedications' | 'stories';
type PlaylistFilter =
  | 'all'
  | 'favorites'
  | 'special'
  | 'recent'
  | 'mood:Romantic'
  | 'mood:Chill'
  | 'mood:Sad'
  | 'mood:Mood'
  | string;

function formatSec(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const MusicRoomPage: React.FC = () => {
  const { user, addSong, removeSong, isAdmin, siteConfig } = useAppData();
  const {
    coupleSpace,
    isPaired,
    myRoleName,
    partnerName,
    partnerPresence,
    spaceSongs,
    spacePlaylists,
    radioSync,
    songDedications,
    songStories,
    musicHistory,
    addSpaceSong,
    removeSpaceSong,
    toggleSongFavorite,
    toggleSongSpecial,
    moveSongOrder,
    createSpacePlaylist,
    deleteSpacePlaylist,
    sendSongDedication,
    markDedicationOpened,
    deleteSongDedication,
    addSongStory,
    deleteSongStory,
  } = useCouple();

  const {
    playlist,
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
    followPartnerSync,
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
  } = useGlobalMusic();

  const [activeTab, setActiveTab] = useState<RadioTab>('playlist');
  const [searchQuery, setSearchQuery] = useState('');
  const [playlistFilter, setPlaylistFilter] = useState<PlaylistFilter>('all');

  // Add Song Panel State
  const [showAddSongForm, setShowAddSongForm] = useState(false);
  const [sourceTab, setSourceTab] = useState<'youtube' | 'audio_url' | 'audio_file'>('youtube');
  const [urlInput, setUrlInput] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [moodInput, setMoodInput] = useState<RadioMoodTag>('Romantic');
  const [targetPlaylistInput, setTargetPlaylistInput] = useState<string>('');
  const [markSpecialInput, setMarkSpecialInput] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingSong, setSavingSong] = useState(false);

  // Create Playlist Panel State
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlName, setNewPlName] = useState('');
  const [newPlDesc, setNewPlDesc] = useState('');
  const [newPlMood, setNewPlMood] = useState<SharedPlaylistMood>('Romantic');
  const [creatingPl, setCreatingPl] = useState(false);

  // Curated 4-Theme Catalog State
  const [catalogCollectionFilter, setCatalogCollectionFilter] = useState<CatalogCollectionId | 'all'>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [verifyingCatalogId, setVerifyingCatalogId] = useState<string | null>(null);
  const [catalogUrlDraft, setCatalogUrlDraft] = useState('');
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogStatus, setCatalogStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Song Dedication Composer & Modal State
  const [dedSongKey, setDedSongKey] = useState<string>('');
  const [dedCustomTitle, setDedCustomTitle] = useState('');
  const [dedCustomArtist, setDedCustomArtist] = useState('');
  const [dedMessage, setDedMessage] = useState('');
  const [sendingDed, setSendingDed] = useState(false);
  const [dedStatus, setDedStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [openedDedication, setOpenedDedication] = useState<SongDedication | null>(null);

  // Our Song Story State
  const [storySongTitle, setStorySongTitle] = useState('');
  const [storyArtist, setStoryArtist] = useState('');
  const [storyDate, setStoryDate] = useState('');
  const [storyBody, setStoryBody] = useState('');
  const [storyPhoto, setStoryPhoto] = useState<File | null>(null);
  const [savingStory, setSavingStory] = useState(false);
  const [storyStatus, setStoryStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const storyFileRef = useRef<HTMLInputElement | null>(null);

  const spaceSongIds = useMemo(() => new Set(spaceSongs.map((s) => s.id)), [spaceSongs]);
  const specialSongs = useMemo(
    () => playlist.filter((s) => Boolean(s.isSpecialSong)),
    [playlist]
  );

  const displayedSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = playlist;
    if (playlistFilter === 'favorites') {
      list = list.filter((s) => Boolean(s.isFavorite));
    } else if (playlistFilter === 'special') {
      list = list.filter((s) => Boolean(s.isSpecialSong) || s.moodTag === 'Special');
    } else if (playlistFilter === 'recent') {
      const rank = new Map(recentlyPlayedIds.map((id, idx) => [id, idx]));
      list = list
        .filter((s) => rank.has(s.id))
        .sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
    } else if (playlistFilter.startsWith('mood:')) {
      const m = playlistFilter.replace('mood:', '');
      list = list.filter((s) => s.moodTag === m);
    } else if (playlistFilter !== 'all') {
      list = list.filter((s) => s.playlistId === playlistFilter);
    }

    if (!q) return list;
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        (s.uploaderName || '').toLowerCase().includes(q)
    );
  }, [playlist, playlistFilter, recentlyPlayedIds, searchQuery]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return CURATED_RADIO_CATALOG.filter((item) => {
      if (catalogCollectionFilter !== 'all' && item.collectionId !== catalogCollectionFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.artist.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q)
      );
    });
  }, [catalogCollectionFilter, catalogSearch]);

  const progressPct =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const activeArtwork =
    activeSong?.artworkUrl ||
    (isYoutubeTrack && activeSong?.youtubeId
      ? `https://i.ytimg.com/vi/${activeSong.youtubeId}/hqdefault.jpg`
      : siteConfig.couplePhotoUrl || COUPLE_HERO_IMAGE);

  const chooserName = radioSync?.lastUpdatedByName || myRoleName;
  const receiverName = chooserName === 'Zikri' ? 'Diann' : 'Zikri';
  const bothJoined = hasJoinedListening && partnerJoinedListening;

  const handleFilterSelect = (f: PlaylistFilter) => {
    setPlaylistFilter(f);
    if (f !== 'recent') {
      setActivePlaylistId(f);
    }
  };

  const handleAddSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    setSavingSong(true);

    try {
      if (sourceTab === 'youtube') {
        const verified = await verifyYouTubeUrlViaOEmbed(urlInput);
        const title = titleInput.trim() || verified.title || 'Lagu YouTube';
        const artist = artistInput.trim() || verified.authorName || 'YouTube';
        if (coupleSpace) {
          const newId = await addSpaceSong({
            title,
            artist,
            youtubeUrl: verified.canonicalUrl,
            artworkUrl: verified.thumbnailUrl,
            playlistId: targetPlaylistInput || undefined,
            moodTag: moodInput,
            isSpecialSong: markSpecialInput,
          });
          selectTrack(newId, false, true);
        } else {
          await addSong({
            title,
            artist,
            youtubeUrl: verified.canonicalUrl,
            artworkUrl: verified.thumbnailUrl,
          });
        }
        setFormMsg({
          type: 'ok',
          text: `Link YouTube terverifikasi (${verified.title || title}) & ditambahkan ke playlist.`,
        });
      } else if (sourceTab === 'audio_url') {
        const raw = urlInput.trim();
        if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
          throw new Error('Masukkan URL file audio (MP3/WAV/OGG) yang valid (https://...).');
        }
        if (!titleInput.trim() || !artistInput.trim()) {
          throw new Error('Judul lagu dan nama artis wajib diisi.');
        }
        if (coupleSpace) {
          const newId = await addSpaceSong({
            title: titleInput.trim(),
            artist: artistInput.trim(),
            audioUrl: raw,
            playlistId: targetPlaylistInput || undefined,
            moodTag: moodInput,
            isSpecialSong: markSpecialInput,
          });
          selectTrack(newId, false, true);
        } else {
          await addSong({
            title: titleInput.trim(),
            artist: artistInput.trim(),
            audioUrl: raw,
          });
        }
        setFormMsg({ type: 'ok', text: 'Track Audio URL ditambahkan ke playlist bersama.' });
      } else {
        if (!coupleSpace) {
          throw new Error('Hubungkan Couple Space di Our Connection untuk upload file audio.');
        }
        if (!audioFile) throw new Error('Pilih file audio (.mp3, .wav, .m4a) terlebih dahulu.');
        if (audioFile.size > 15 * 1024 * 1024) {
          throw new Error('Ukuran file maksimal 15 MB agar tetap ringan di perangkat mobile.');
        }
        if (!titleInput.trim() || !artistInput.trim()) {
          throw new Error('Judul lagu dan nama artis wajib diisi.');
        }
        const newId = await addSpaceSong({
          title: titleInput.trim(),
          artist: artistInput.trim(),
          audioFile,
          playlistId: targetPlaylistInput || undefined,
          moodTag: moodInput,
          isSpecialSong: markSpecialInput,
        });
        selectTrack(newId, false, true);
        setAudioFile(null);
        setFormMsg({ type: 'ok', text: 'File audio berhasil diunggah & disinkronkan!' });
      }

      setUrlInput('');
      setTitleInput('');
      setArtistInput('');
      setMarkSpecialInput(false);
    } catch (err) {
      setFormMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal menambahkan lagu.',
      });
    } finally {
      setSavingSong(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupleSpace) {
      setFormMsg({
        type: 'err',
        text: 'Hubungkan akun di Our Connection untuk membuat playlist bersama.',
      });
      return;
    }
    if (!newPlName.trim()) return;
    setCreatingPl(true);
    try {
      const pid = await createSpacePlaylist({
        name: newPlName.trim(),
        description: newPlDesc.trim(),
        moodType: newPlMood,
      });
      setNewPlName('');
      setNewPlDesc('');
      setShowCreatePlaylist(false);
      handleFilterSelect(pid);
    } finally {
      setCreatingPl(false);
    }
  };

  const handleVerifyCatalogSong = async (
    catalogTitle: string,
    catalogArtist: string,
    catalogMood: RadioMoodTag
  ) => {
    setCatalogStatus(null);
    if (!coupleSpace) {
      setCatalogStatus({
        type: 'err',
        text: 'Hubungkan Couple Space di Our Connection agar dapat menyimpan lagu terverifikasi ke playlist bersama.',
      });
      return;
    }
    setCatalogBusy(true);
    try {
      const verified = await verifyYouTubeUrlViaOEmbed(catalogUrlDraft);
      const newId = await addSpaceSong({
        title: catalogTitle,
        artist: catalogArtist,
        youtubeUrl: verified.canonicalUrl,
        artworkUrl: verified.thumbnailUrl,
        moodTag: catalogMood,
      });
      setCatalogUrlDraft('');
      setVerifyingCatalogId(null);
      setCatalogStatus({
        type: 'ok',
        text: `${catalogTitle} (${catalogArtist}) terverifikasi via YouTube oEmbed & tersimpan!`,
      });
      selectTrack(newId, true, true);
    } catch (err) {
      setCatalogStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal verifikasi link YouTube.',
      });
    } finally {
      setCatalogBusy(false);
    }
  };

  const handleQuickDedicate = (title: string, artist: string, song?: SongItem) => {
    if (song) {
      setDedSongKey(`pl:${song.id}`);
    } else {
      setDedSongKey('custom');
      setDedCustomTitle(title);
      setDedCustomArtist(artist);
    }
    setActiveTab('dedications');
    window.scrollTo({ top: 480, behavior: 'smooth' });
  };

  const handleSendDedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setDedStatus(null);
    if (!coupleSpace) {
      setDedStatus({
        type: 'err',
        text: 'Hubungkan Couple Space terlebih dahulu agar bisa mengirim surat dedikasi.',
      });
      return;
    }

    let songId = 'custom';
    let songTitle = dedCustomTitle.trim();
    let songArtist = dedCustomArtist.trim();
    let artworkUrl = '';
    let youtubeUrl = '';
    let audioUrl = '';

    if (dedSongKey.startsWith('pl:')) {
      const id = dedSongKey.replace('pl:', '');
      const found = playlist.find((s) => s.id === id);
      if (found) {
        songId = found.id;
        songTitle = found.title;
        songArtist = found.artist;
        artworkUrl = found.artworkUrl || '';
        youtubeUrl = found.youtubeUrl || '';
        audioUrl = found.audioUrl || '';
      }
    } else if (dedSongKey.startsWith('cat:')) {
      const cid = dedSongKey.replace('cat:', '');
      const foundCat = CURATED_RADIO_CATALOG.find((c) => c.catalogId === cid);
      if (foundCat) {
        songId = foundCat.catalogId;
        songTitle = foundCat.title;
        songArtist = foundCat.artist;
      }
    }

    if (!songTitle) {
      setDedStatus({ type: 'err', text: 'Pilih atau tulis judul lagu yang ingin didedikasikan.' });
      return;
    }

    setSendingDed(true);
    try {
      await sendSongDedication({
        songId,
        songTitle,
        songArtist: songArtist || 'Artis Pilihan',
        artworkUrl,
        youtubeUrl,
        audioUrl,
        message: dedMessage,
      });
      setDedMessage('');
      setDedStatus({
        type: 'ok',
        text: `Dedikasi "${songTitle}" terkirim ke ${partnerName}! 💌`,
      });
    } catch (err) {
      setDedStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal mengirim dedikasi.',
      });
    } finally {
      setSendingDed(false);
    }
  };

  const handleOpenDedication = (d: SongDedication) => {
    setOpenedDedication(d);
    if (user && d.senderUid !== user.uid && !d.openedByPartner) {
      void markDedicationOpened(d.id);
    }
  };

  const handlePlayDedicationSong = async (d: SongDedication) => {
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

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoryStatus(null);
    if (!coupleSpace) {
      setStoryStatus({
        type: 'err',
        text: 'Hubungkan Couple Space terlebih dahulu untuk menyimpan Our Song Story.',
      });
      return;
    }
    if (!storySongTitle.trim() || !storyBody.trim()) {
      setStoryStatus({ type: 'err', text: 'Judul lagu dan cerita kenangan wajib diisi.' });
      return;
    }
    setSavingStory(true);
    try {
      await addSongStory({
        songTitle: storySongTitle,
        artist: storyArtist || 'Artis Favorit',
        dateLabel: storyDate || 'Kenangan Kita',
        story: storyBody,
        photoFile: storyPhoto || undefined,
      });
      setStorySongTitle('');
      setStoryArtist('');
      setStoryDate('');
      setStoryBody('');
      setStoryPhoto(null);
      if (storyFileRef.current) storyFileRef.current.value = '';
      setStoryStatus({ type: 'ok', text: 'Our Song Story berhasil disimpan ke ruang berdua!' });
    } catch (err) {
      setStoryStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'Gagal menyimpan Our Song Story.',
      });
    } finally {
      setSavingStory(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* 1. Glassmorphism Hero Music Player Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff3f8]/95 via-white/85 to-[#f3eaff]/95 backdrop-blur-xl border border-pink-200/80 shadow-xl shadow-rose-200/35 p-5 sm:p-7">
        <FloatingMusicNotes active={isPlaying && !isBuffering} />

        {/* Subtle ambient corner glow */}
        <div
          className="pointer-events-none absolute -top-14 -right-14 w-48 h-48 rounded-full bg-rose-300/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-12 w-52 h-52 rounded-full bg-purple-300/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-5">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wide text-rose-500 flex items-center gap-1.5">
                <Radio className="w-4 h-4" />
                <span>OUR LOVE RADIO 💗</span>
              </p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#4a2336] mt-0.5">
                Stasiun Musik Zikri & Diann
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="min-h-[44px] px-4 py-2 rounded-2xl bg-white/90 border border-pink-200 text-rose-600 text-xs sm:text-sm font-semibold hover:bg-pink-50 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full Player</span>
            </button>
          </div>

          {listeningNotice && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 flex items-center justify-between gap-3 text-xs text-rose-700">
              <span>{listeningNotice}</span>
              <button
                type="button"
                onClick={() => {
                  clearListeningNotice();
                  togglePlay();
                }}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-500 text-white font-semibold shrink-0 cursor-pointer"
              >
                Putar Sekarang
              </button>
            </div>
          )}

          {/* Large Artwork + Track Info (Mobile One-Hand Centered Layout) */}
          <div className="flex flex-col items-center text-center gap-4 pt-1">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-4 border-white bg-gradient-to-br from-pink-100 to-purple-100 shadow-2xl shadow-rose-300/35 flex items-center justify-center">
              {activeArtwork ? (
                <img
                  src={activeArtwork}
                  alt={activeSong?.title || 'Album Artwork'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Disc3 className={`w-14 h-14 text-rose-400 ${isPlaying ? 'animate-spin' : ''}`} />
              )}
              <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-xl bg-[#4a2336]/80 backdrop-blur-md text-white flex items-center gap-1.5">
                <EqualizerBars active={isPlaying && !isBuffering} size="sm" light />
              </div>
            </div>

            <div className="space-y-1 max-w-md">
              <div className="flex items-center justify-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#4a2336] text-balance">
                  {activeSong?.title || 'Pilih lagu dari playlist'}
                </h2>
              </div>
              <p className="text-sm text-[#6b485b] font-medium">
                {activeSong?.artist || 'Our Little World'}
              </p>
              {activeSong && (
                <p className="text-xs text-[#7c5a6c]">
                  {isYoutubeTrack ? 'YouTube Official Player' : 'Audio HTML5'}
                  {activeSong.moodTag ? ` · ${activeSong.moodTag}` : ''}
                  {activeSong.uploaderName ? ` · Ditambahkan oleh ${activeSong.uploaderName}` : ''}
                </p>
              )}
            </div>

            {/* Quick Track Actions (Fav, Special, Dedicate) */}
            {activeSong && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {spaceSongIds.has(activeSong.id) && (
                  <>
                    <button
                      type="button"
                      onClick={() => void toggleSongFavorite(activeSong)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                        activeSong.isFavorite
                          ? 'bg-rose-500 border-rose-500 text-white'
                          : 'bg-white/90 border-pink-200 text-[#6b485b] hover:bg-pink-50'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${activeSong.isFavorite ? 'fill-current' : ''}`} />
                      <span>{activeSong.isFavorite ? 'Favorit' : 'Sukai'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleSongSpecial(activeSong)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                        activeSong.isSpecialSong
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-white/90 border-pink-200 text-[#6b485b] hover:bg-pink-50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${activeSong.isSpecialSong ? 'fill-current' : ''}`} />
                      <span>{activeSong.isSpecialSong ? 'Lagu Spesial' : 'Jadikan Spesial'}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() =>
                    handleQuickDedicate(activeSong.title, activeSong.artist, activeSong)
                  }
                  className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white/90 border border-pink-200 text-rose-600 text-xs font-semibold hover:bg-pink-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <MailOpen className="w-3.5 h-3.5" />
                  <span>Dedikasikan 💌</span>
                </button>
              </div>
            )}
          </div>

          {isYoutubeTrack && activeSong && (
            <div className="rounded-2xl bg-pink-50/90 border border-pink-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#5e3c4e]">
              <span>
                Video YouTube diputar lewat single Official YouTube Dock di pojok bawah agar musik tidak terhenti saat berpindah halaman.
              </span>
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-rose-500 text-white font-semibold shrink-0 cursor-pointer"
              >
                Perbesar Video
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Scrubber + Controls */}
          <div className="max-w-md mx-auto space-y-4">
            <div className="space-y-1">
              <div className="relative h-2 bg-pink-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 transition-[width] duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
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
              <div className="flex justify-between text-xs font-semibold text-[#7c5a6c] tabular-nums">
                <span>{formatSec(currentTime)}</span>
                <span>{formatSec(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label="Shuffle playlist"
                className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center cursor-pointer ${
                  shuffle ? 'bg-rose-100 text-rose-600' : 'text-[#7c5a6c] hover:bg-pink-50'
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
                className="min-h-[58px] min-w-[58px] rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white shadow-lg shadow-rose-300/60 hover:brightness-105 active:scale-95 flex items-center justify-center cursor-pointer"
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
                className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center cursor-pointer ${
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

            {/* Volume */}
            <div className="flex items-center gap-3 rounded-2xl bg-white/90 border border-pink-100 px-3.5 py-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Aktifkan suara' : 'Bisukan suara'}
                className="min-h-[40px] min-w-[40px] rounded-xl text-rose-500 hover:bg-pink-50 flex items-center justify-center cursor-pointer"
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
                aria-label="Volume player"
                className="flex-1 accent-rose-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#7c5a6c] w-9 text-right tabular-nums">
                {Math.round((muted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LISTENING TOGETHER 💗 Real-Time Session Card */}
      <section className="rounded-3xl bg-white/85 backdrop-blur-md border border-pink-100 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Couple Avatars */}
            <div className="flex -space-x-2.5 shrink-0">
              <div
                className={`w-11 h-11 rounded-full border-2 border-white flex items-center justify-center font-display font-bold text-sm shadow-xs ${
                  coupleSpace && (coupleSpace.member1Uid === user?.uid ? hasJoinedListening : partnerJoinedListening)
                    ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white ring-2 ring-emerald-400'
                    : 'bg-pink-100 text-rose-600'
                }`}
              >
                {coupleSpace?.member1Name?.[0] || 'Z'}
              </div>
              <div
                className={`w-11 h-11 rounded-full border-2 border-white flex items-center justify-center font-display font-bold text-sm shadow-xs ${
                  coupleSpace && (coupleSpace.member2Uid === user?.uid ? hasJoinedListening : partnerJoinedListening)
                    ? 'bg-gradient-to-br from-purple-500 to-rose-400 text-white ring-2 ring-emerald-400'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                {coupleSpace?.member2Name?.[0] || 'D'}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>LISTENING TOGETHER 💗</span>
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#4a2336]">
                {coupleSpace
                  ? bothJoined
                    ? 'Now Playing Together ♡'
                    : partnerJoinedListening
                    ? `${partnerName} sedang mendengarkan`
                    : hasJoinedListening
                    ? `Kamu aktif di sesi dengar bersama`
                    : 'Dengarkan Lagu di Saat yang Sama'
                  : 'Mode Solo — Hubungkan Couple Space untuk Sync'}
              </h2>
            </div>
          </div>

          {coupleSpace && (
            <div className="flex flex-wrap items-center gap-2">
              {!hasJoinedListening ? (
                <button
                  type="button"
                  onClick={() => void joinListeningSession()}
                  className="min-h-[44px] px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-200/50 hover:brightness-105 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>JOIN LISTENING 💗</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void leaveListeningSession()}
                  className="min-h-[44px] px-4 py-2 rounded-2xl bg-pink-50 border border-pink-200 text-rose-600 text-xs font-semibold hover:bg-pink-100 cursor-pointer"
                >
                  Keluar Sesi Sync
                </button>
              )}
            </div>
          )}
        </div>

        {coupleSpace && radioSync ? (
          <div className="rounded-2xl bg-gradient-to-r from-[#fff6fa] to-[#f8f2ff] border border-pink-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="text-xs font-semibold text-rose-600">
                {chooserName} memilih lagu untuk {receiverName} 💗
              </div>
              <div className="text-sm font-bold text-[#4a2336] truncate">
                {radioSync.songTitle} · {radioSync.songArtist}
              </div>
              <div className="text-xs text-[#6b485b]">
                {partnerJoinedListening
                  ? `${partnerName} sedang mendengarkan lagu yang sama.`
                  : partnerPresence?.online
                  ? `${partnerName} online · menunggu tap JOIN LISTENING di perangkatnya.`
                  : `${partnerName} sedang tidak berada di radio.`}{' '}
                Status: {radioSync.playbackStatus === 'playing' ? 'Diputar' : 'Dijeda'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFollowPartnerSync(!followPartnerSync)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer border ${
                followPartnerSync
                  ? 'bg-white border-rose-200 text-rose-600'
                  : 'bg-pink-50 border-pink-200 text-[#6b485b]'
              }`}
            >
              {followPartnerSync ? 'Sync Real-Time: Aktif' : 'Sync Real-Time: Jeda'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#6b485b]">
            {isPaired
              ? 'Pilih lagu apa saja atau ketuk JOIN LISTENING untuk memulai sesi sinkron dengan pasanganmu.'
              : 'Masuk & pasangkan dua akun di halaman Our Connection untuk mengaktifkan Listening Together secara real-time.'}
          </p>
        )}
      </section>

      {/* 3. OUR SPECIAL SONG SPOTLIGHT */}
      {specialSongs.length > 0 && (
        <section className="rounded-3xl bg-gradient-to-r from-[#fff0f6] via-white to-[#f6edff] border border-pink-200/80 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-500 text-white flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-rose-500">OUR SPECIAL SONG ★</div>
              <div className="font-display text-sm sm:text-base font-bold text-[#4a2336] truncate">
                {specialSongs[0].title} · {specialSongs[0].artist}
              </div>
              {specialSongs.length > 1 && (
                <div className="text-xs text-[#7c5a6c]">
                  +{specialSongs.length - 1} lagu spesial lainnya tersimpan
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => selectTrack(specialSongs[0].id, true, true)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Putar Lagu Spesial</span>
          </button>
        </section>
      )}

      {/* 4. Segmented Tab Bar */}
      <nav
        aria-label="Menu Our Love Radio"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-pink-100"
      >
        {(
          [
            { id: 'playlist', label: 'Playlist Kita', icon: ListMusic },
            { id: 'catalog', label: 'Katalog 4 Tema', icon: Sparkles },
            { id: 'dedications', label: 'Dedikasi Lagu', icon: MailOpen },
            { id: 'stories', label: 'Story & Riwayat', icon: BookHeart },
          ] as Array<{ id: RadioTab; label: string; icon: React.ComponentType<{ className?: string }> }>
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow-sm'
                  : 'text-[#6b485b] hover:bg-pink-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================== TAB 1: SHARED PLAYLIST & FILTER ==================== */}
      {activeTab === 'playlist' && (
        <section className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-4">
          {/* Top Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <h2 className="font-display text-lg font-bold text-[#4a2336]">
              Playlist Bersama ({displayedSongs.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreatePlaylist((v) => !v);
                  setShowAddSongForm(false);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Playlist Baru</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddSongForm((v) => !v);
                  setShowCreatePlaylist(false);
                }}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Lagu</span>
              </button>
            </div>
          </div>

          {/* Search Songs */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9b7a8c] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul lagu, artis, atau pengunggah..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-2xl border border-pink-200 bg-[#fff9fc] text-sm text-[#4a2336]"
            />
          </div>

          {/* Mood & Custom Playlist Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'favorites', label: 'Favorit ♥' },
                { id: 'special', label: 'Special ★' },
                { id: 'mood:Romantic', label: 'Romantic' },
                { id: 'mood:Chill', label: 'Chill' },
                { id: 'mood:Sad', label: 'Sad' },
                { id: 'mood:Mood', label: 'Mood' },
                { id: 'recent', label: 'Recently Played' },
              ] as Array<{ id: PlaylistFilter; label: string }>
            ).map((chip) => {
              const active = playlistFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleFilterSelect(chip.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border transition-colors ${
                    active
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-pink-50/70 border-pink-100 text-[#6b485b] hover:bg-pink-100/60'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}

            {spacePlaylists.map((pl) => {
              const active = playlistFilter === pl.id;
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => handleFilterSelect(pl.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer border transition-colors ${
                    active
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-purple-50/80 border-purple-100 text-purple-700 hover:bg-purple-100/70'
                  }`}
                >
                  {pl.name}
                </button>
              );
            })}
          </div>

          {/* Active Custom Playlist Delete Option (Permission Gated) */}
          {spacePlaylists.some((p) => p.id === playlistFilter) && (
            <div className="rounded-2xl bg-purple-50/60 border border-purple-100 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
              {(() => {
                const pl = spacePlaylists.find((p) => p.id === playlistFilter);
                if (!pl) return null;
                const canDeletePl =
                  pl.creatorUid === user?.uid || coupleSpace?.ownerUid === user?.uid;
                return (
                  <>
                    <div className="min-w-0">
                      <span className="font-bold text-purple-800">{pl.name}</span>
                      <span className="text-[#6b485b]">
                        {' '}
                        · {pl.moodType} · dibuat oleh {pl.creatorName}
                        {pl.description ? ` — ${pl.description}` : ''}
                      </span>
                    </div>
                    {canDeletePl && (
                      <button
                        type="button"
                        onClick={() => {
                          void deleteSpacePlaylist(pl.id);
                          handleFilterSelect('all');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 font-semibold shrink-0 cursor-pointer"
                      >
                        Hapus Playlist
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Create Playlist Collapsible Form */}
          {showCreatePlaylist && (
            <form
              onSubmit={handleCreatePlaylist}
              className="rounded-2xl bg-[#f8f3ff] border border-purple-200 p-4 space-y-3"
            >
              <div className="font-display text-sm font-bold text-[#4a2336]">
                Buat Playlist Baru Berdua
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={newPlName}
                  onChange={(e) => setNewPlName(e.target.value)}
                  placeholder="Nama playlist (mis. Malam Minggu)"
                  className="min-h-[42px] px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-sm"
                />
                <select
                  value={newPlMood}
                  onChange={(e) => setNewPlMood(e.target.value as SharedPlaylistMood)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-sm"
                >
                  <option value="Romantic">Mood: Romantic</option>
                  <option value="Chill">Mood: Chill</option>
                  <option value="Sad">Mood: Sad</option>
                  <option value="Special">Mood: Special</option>
                  <option value="Mood">Mood: Mood Booster</option>
                  <option value="Custom">Mood: Custom</option>
                </select>
              </div>
              <input
                type="text"
                value={newPlDesc}
                onChange={(e) => setNewPlDesc(e.target.value)}
                placeholder="Catatan singkat playlist (opsional)"
                className="w-full min-h-[42px] px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-sm"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylist(false)}
                  className="min-h-[40px] px-4 py-1.5 rounded-xl bg-white border border-purple-200 text-xs font-semibold text-[#6b485b] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingPl}
                  className="min-h-[40px] px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                >
                  {creatingPl ? 'Menyimpan...' : 'Simpan Playlist'}
                </button>
              </div>
            </form>
          )}

          {/* Add Song Collapsible Form */}
          {showAddSongForm && (
            <form
              onSubmit={handleAddSongSubmit}
              className="rounded-2xl bg-[#fff7fb] border border-pink-200 p-4 space-y-3"
            >
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'youtube' as const, label: 'Link YouTube (Verifikasi)', icon: LinkIcon },
                  { id: 'audio_url' as const, label: 'URL Audio MP3/WAV', icon: FileAudio },
                  { id: 'audio_file' as const, label: 'Upload Audio HP', icon: Upload },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSourceTab(t.id);
                        setFormMsg(null);
                      }}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                        sourceTab === t.id
                          ? 'bg-rose-500 text-white'
                          : 'bg-white border border-pink-200 text-[#6b485b]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {sourceTab === 'youtube' && (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6b485b]">
                    <span>Tempel URL video YouTube asli lalu klik simpan untuk verifikasi oEmbed.</span>
                    <a
                      href={buildYouTubeSearchUrl(titleInput || 'Lagu Cinta', artistInput)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Cari di YouTube</span>
                    </a>
                  </div>
                  <input
                    type="url"
                    required
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                  />
                </div>
              )}

              {sourceTab === 'audio_url' && (
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/lagu-kita.mp3"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                />
              )}

              {sourceTab === 'audio_file' && (
                <input
                  type="file"
                  accept="audio/*"
                  required
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-pink-200 bg-white text-xs"
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required={sourceTab !== 'youtube'}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder={
                    sourceTab === 'youtube' ? 'Judul lagu (opsional, otomatis dari YouTube)' : 'Judul lagu'
                  }
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                />
                <input
                  type="text"
                  required={sourceTab !== 'youtube'}
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  placeholder="Nama artis / penyanyi"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <select
                  value={moodInput}
                  onChange={(e) => setMoodInput(e.target.value as RadioMoodTag)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                >
                  <option value="Romantic">Mood: Romantic</option>
                  <option value="Chill">Mood: Chill</option>
                  <option value="Sad">Mood: Sad</option>
                  <option value="Mood">Mood: Mood Booster</option>
                  <option value="Special">Mood: Special</option>
                  <option value="Indie">Mood: Indie</option>
                  <option value="Rock">Mood: Rock</option>
                </select>

                <select
                  value={targetPlaylistInput}
                  onChange={(e) => setTargetPlaylistInput(e.target.value)}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                >
                  <option value="">Simpan ke Playlist Utama</option>
                  {spacePlaylists.map((p) => (
                    <option key={p.id} value={p.id}>
                      Playlist: {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#4a2336] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={markSpecialInput}
                  onChange={(e) => setMarkSpecialInput(e.target.checked)}
                  className="accent-rose-500 w-4 h-4"
                />
                <span>Tandai sebagai Our Special Song ★</span>
              </label>

              {formMsg && (
                <div
                  className={`rounded-xl p-2.5 text-xs ${
                    formMsg.type === 'ok'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {formMsg.text}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSongForm(false)}
                  className="min-h-[42px] px-4 py-1.5 rounded-xl bg-white border border-pink-200 text-xs font-semibold text-[#6b485b] cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={savingSong}
                  className="min-h-[42px] px-5 py-1.5 rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 cursor-pointer disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {savingSong && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {sourceTab === 'youtube' ? 'Verifikasi & Simpan URL' : 'Tambahkan Lagu'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Playlist Rows */}
          {displayedSongs.length === 0 ? (
            <div className="rounded-2xl bg-pink-50/50 border border-pink-100 p-6 text-center text-sm text-[#7c5a6c]">
              Belum ada lagu yang cocok dengan filter ini. Coba ganti filter atau tambahkan lagu favoritmu.
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedSongs.map((song) => {
                const isActive = activeSong?.id === song.id;
                const isSpace = spaceSongIds.has(song.id);
                const isYt = !song.audioUrl && song.sourceType !== 'audio';
                const canDelete = isSpace
                  ? song.ownerUid === user?.uid || coupleSpace?.ownerUid === user?.uid
                  : isAdmin && !song.id.startsWith('audio-');

                return (
                  <div
                    key={song.id}
                    className={`rounded-2xl border p-3 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-50 via-pink-50/80 to-purple-50/60 border-rose-200'
                        : 'bg-white border-pink-100 hover:bg-pink-50/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectTrack(song.id, true, true)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-pink-100 overflow-hidden shrink-0 flex items-center justify-center border border-pink-100">
                        {song.artworkUrl ? (
                          <img
                            src={song.artworkUrl}
                            alt={song.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-rose-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-bold text-[#4a2336] truncate">
                            {song.title}
                          </span>
                          {song.isSpecialSong && (
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                          )}
                          {isActive && <EqualizerBars active={isPlaying} size="sm" />}
                        </div>
                        <div className="text-xs text-[#6b485b] truncate">{song.artist}</div>
                        <div className="text-[11px] text-[#8b687b] truncate">
                          {isYt ? 'YouTube' : 'Audio HTML5'}
                          {song.moodTag ? ` · ${song.moodTag}` : ''}
                          {song.uploaderName ? ` · Ditambahkan oleh ${song.uploaderName}` : ''}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center justify-end gap-1 shrink-0">
                      {isSpace && (
                        <>
                          <button
                            type="button"
                            onClick={() => void toggleSongFavorite(song)}
                            aria-label="Toggle favorit"
                            className={`min-h-[40px] min-w-[38px] rounded-xl flex items-center justify-center cursor-pointer ${
                              song.isFavorite
                                ? 'text-rose-500 bg-rose-50'
                                : 'text-[#9b7a8c] hover:bg-pink-50'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleSongSpecial(song)}
                            aria-label="Jadikan Our Special Song"
                            className={`min-h-[40px] min-w-[38px] rounded-xl flex items-center justify-center cursor-pointer ${
                              song.isSpecialSong
                                ? 'text-amber-500 bg-amber-50'
                                : 'text-[#9b7a8c] hover:bg-pink-50'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${song.isSpecialSong ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveSongOrder(song, 'up')}
                            aria-label="Naikkan urutan lagu"
                            className="min-h-[40px] min-w-[36px] rounded-xl text-[#7c5a6c] hover:bg-pink-50 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void moveSongOrder(song, 'down')}
                            aria-label="Turunkan urutan lagu"
                            className="min-h-[40px] min-w-[36px] rounded-xl text-[#7c5a6c] hover:bg-pink-50 flex items-center justify-center cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handleQuickDedicate(song.title, song.artist, song)}
                        aria-label="Dedikasikan lagu ini"
                        className="min-h-[40px] min-w-[38px] rounded-xl text-purple-600 hover:bg-purple-50 flex items-center justify-center cursor-pointer"
                      >
                        <MailOpen className="w-4 h-4" />
                      </button>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            isSpace ? void removeSpaceSong(song) : void removeSong(song.id)
                          }
                          aria-label="Hapus lagu"
                          className="min-h-[40px] min-w-[38px] rounded-xl text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ==================== TAB 2: CURATED 4 COLLECTIONS CATALOG ==================== */}
      {activeTab === 'catalog' && (
        <section className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#4a2336]">
              Katalog Lagu Pilihan (4 Tema Romantis)
            </h2>
            <p className="text-xs sm:text-sm text-[#6b485b]">
              Koleksi kurasi tanpa link YouTube palsu: ketuk <strong className="text-rose-600">Cari di YouTube</strong>, salin tautan asli dari video favorit kalian, lalu tempel untuk verifikasi otomatis via oEmbed.
            </p>
          </div>

          {catalogStatus && (
            <div
              className={`rounded-2xl p-3 text-xs flex items-center gap-2 ${
                catalogStatus.type === 'ok'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {catalogStatus.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{catalogStatus.text}</span>
            </div>
          )}

          {/* Collection Filter Chips + Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCatalogCollectionFilter('all')}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer border ${
                  catalogCollectionFilter === 'all'
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'bg-pink-50 border-pink-100 text-[#6b485b]'
                }`}
              >
                Semua Tema ({CURATED_RADIO_CATALOG.length})
              </button>
              {RADIO_CATALOG_COLLECTIONS.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setCatalogCollectionFilter(col.id)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 cursor-pointer border ${
                    catalogCollectionFilter === col.id
                      ? 'bg-rose-500 border-rose-500 text-white'
                      : 'bg-pink-50 border-pink-100 text-[#6b485b]'
                  }`}
                >
                  {col.title}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#9b7a8c] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Cari di 25 lagu rekomendasi (Tulus, Slank, Ed Sheeran, Hindia...)"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-2xl border border-pink-200 bg-[#fff9fc] text-sm"
              />
            </div>
          </div>

          {/* Collections & Songs */}
          <div className="space-y-5">
            {RADIO_CATALOG_COLLECTIONS.filter(
              (col) => catalogCollectionFilter === 'all' || catalogCollectionFilter === col.id
            ).map((col) => {
              const items = filteredCatalog.filter((c) => c.collectionId === col.id);
              if (items.length === 0) return null;
              return (
                <div
                  key={col.id}
                  className={`rounded-3xl bg-gradient-to-br ${col.accentGradient} border border-pink-100 p-4 sm:p-5 space-y-3`}
                >
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#4a2336]">
                      {col.title}
                    </h3>
                    <p className="text-xs text-[#6b485b]">{col.subtitle}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {items.map((song) => {
                      const alreadySaved = playlist.find(
                        (p) =>
                          p.title.toLowerCase() === song.title.toLowerCase() &&
                          p.artist.toLowerCase() === song.artist.toLowerCase()
                      );
                      const isEditing = verifyingCatalogId === song.catalogId;

                      return (
                        <div
                          key={song.catalogId}
                          className="rounded-2xl bg-white/95 border border-pink-100 p-3.5 space-y-2.5 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-display text-sm font-bold text-[#4a2336] truncate">
                                {song.title}
                              </div>
                              <div className="text-xs font-medium text-rose-600 truncate">
                                {song.artist} · {song.moodTag || col.defaultMood}
                              </div>
                            </div>
                            {alreadySaved && (
                              <button
                                type="button"
                                onClick={() => selectTrack(alreadySaved.id, true, true)}
                                className="min-h-[34px] px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold shrink-0 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Putar</span>
                              </button>
                            )}
                          </div>

                          <p className="text-xs text-[#6b485b] leading-snug">{song.note}</p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <a
                              href={buildYouTubeSearchUrl(song.title, song.artist)}
                              target="_blank"
                              rel="noreferrer"
                              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-rose-600 text-xs font-semibold hover:bg-pink-100 inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Cari di YouTube</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyingCatalogId(isEditing ? null : song.catalogId);
                                setCatalogUrlDraft('');
                                setCatalogStatus(null);
                              }}
                              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
                            >
                              {isEditing ? 'Tutup Form' : 'Tempel & Verifikasi URL'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickDedicate(song.title, song.artist)}
                              aria-label={`Dedikasikan ${song.title}`}
                              className="min-h-[38px] px-2.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold hover:bg-purple-100 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <MailOpen className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isEditing && (
                            <div className="pt-2 border-t border-pink-100 space-y-2">
                              <input
                                type="url"
                                value={catalogUrlDraft}
                                onChange={(e) => setCatalogUrlDraft(e.target.value)}
                                placeholder="Tempel URL YouTube asli di sini..."
                                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl border border-pink-200 bg-[#fff9fc] text-xs"
                              />
                              <button
                                type="button"
                                disabled={catalogBusy || !catalogUrlDraft.trim()}
                                onClick={() =>
                                  void handleVerifyCatalogSong(
                                    song.title,
                                    song.artist,
                                    song.moodTag || col.defaultMood
                                  )
                                }
                                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {catalogBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Verifikasi oEmbed & Simpan ke Playlist</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ==================== TAB 3: SONG DEDICATION 💌 ==================== */}
      {activeTab === 'dedications' && (
        <section className="space-y-5">
          <form
            onSubmit={handleSendDedication}
            className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-4"
          >
            <div>
              <p className="text-xs font-bold text-rose-500">SONG DEDICATION 💌</p>
              <h2 className="font-display text-lg font-bold text-[#4a2336]">
                Kirim Surat Lagu Spesial untuk {partnerName}
              </h2>
              <p className="text-xs text-[#6b485b]">
                Pasanganmu akan menerima notifikasi manis “Someone dedicated a song to you 💗” secara real-time.
              </p>
            </div>

            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-[#4a2336]">
                Pilih Lagu dari Playlist atau Katalog
              </label>
              <select
                value={dedSongKey}
                onChange={(e) => setDedSongKey(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-2xl border border-pink-200 bg-[#fff9fc] text-sm text-[#4a2336]"
              >
                <option value="">-- Pilih lagu atau tulis manual di bawah --</option>
                <optgroup label="Playlist Bersama">
                  {playlist.map((s) => (
                    <option key={`pl:${s.id}`} value={`pl:${s.id}`}>
                      {s.title} — {s.artist}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Katalog Rekomendasi (4 Tema)">
                  {CURATED_RADIO_CATALOG.map((c) => (
                    <option key={`cat:${c.catalogId}`} value={`cat:${c.catalogId}`}>
                      {c.title} — {c.artist}
                    </option>
                  ))}
                </optgroup>
                <option value="custom">Tulis Judul Lagu Sendiri...</option>
              </select>

              {(!dedSongKey || dedSongKey === 'custom') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={dedCustomTitle}
                    onChange={(e) => setDedCustomTitle(e.target.value)}
                    placeholder="Judul lagu yang didedikasikan"
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                  />
                  <input
                    type="text"
                    value={dedCustomArtist}
                    onChange={(e) => setDedCustomArtist(e.target.value)}
                    placeholder="Nama artis"
                    className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
                  />
                </div>
              )}

              <textarea
                rows={3}
                required
                value={dedMessage}
                onChange={(e) => setDedMessage(e.target.value)}
                placeholder={`Tulis pesan romantis kenapa lagu ini mengingatkanmu pada ${partnerName}...`}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 bg-white text-sm"
              />
            </div>

            {dedStatus && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  dedStatus.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {dedStatus.text}
              </div>
            )}

            <button
              type="submit"
              disabled={sendingDed}
              className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-semibold shadow-md shadow-rose-200/50 hover:brightness-105 inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {sendingDed ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Kirim Dedikasi Lagu 💌</span>
            </button>
          </form>

          {/* Received & Sent Dedications */}
          <div className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-base font-bold text-[#4a2336]">
              Kotak Surat Dedikasi ({songDedications.length})
            </h3>
            {songDedications.length === 0 ? (
              <p className="text-sm text-[#7c5a6c]">
                Belum ada dedikasi lagu. Jadilah yang pertama mengirim surat lagu untuk pasanganmu!
              </p>
            ) : (
              <div className="space-y-2.5">
                {songDedications.map((d) => {
                  const isMine = d.senderUid === user?.uid;
                  const canDelete = isMine || coupleSpace?.ownerUid === user?.uid;
                  return (
                    <div
                      key={d.id}
                      className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 ${
                        !isMine && !d.openedByPartner
                          ? 'bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-rose-200'
                          : 'bg-white border-pink-100'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenDedication(d)}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-pink-100 text-rose-500 flex items-center justify-center shrink-0">
                          <MailOpen className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-rose-600">
                            {isMine ? `Dikirim oleh kamu (${d.senderName})` : `Dari ${d.senderName}`}
                            {!isMine && !d.openedByPartner ? ' · Baru!' : ''}
                          </div>
                          <div className="font-display text-sm font-bold text-[#4a2336] truncate">
                            {d.songTitle} · {d.songArtist}
                          </div>
                          <div className="text-xs text-[#6b485b] truncate">“{d.message}”</div>
                        </div>
                      </button>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenDedication(d)}
                          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                        >
                          Buka
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => void deleteSongDedication(d.id)}
                            aria-label="Hapus dedikasi"
                            className="min-h-[38px] min-w-[38px] rounded-xl text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== TAB 4: OUR SONG STORY & MUSIC HISTORY ==================== */}
      {activeTab === 'stories' && (
        <section className="space-y-5">
          {/* Add Song Story Form */}
          <form
            onSubmit={handleAddStory}
            className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-3.5"
          >
            <div>
              <p className="text-xs font-bold text-rose-500">OUR SONG STORY 📖</p>
              <h2 className="font-display text-lg font-bold text-[#4a2336]">
                Catat Cerita di Balik Lagu Kenangan
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                required
                value={storySongTitle}
                onChange={(e) => setStorySongTitle(e.target.value)}
                placeholder="Judul lagu (mis. Teman Hidup)"
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
              />
              <input
                type="text"
                value={storyArtist}
                onChange={(e) => setStoryArtist(e.target.value)}
                placeholder="Artis (mis. Tulus)"
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
              />
              <input
                type="text"
                value={storyDate}
                onChange={(e) => setStoryDate(e.target.value)}
                placeholder="Tanggal kenangan (mis. 20 Nov 2025)"
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-pink-200 bg-white text-sm"
              />
            </div>

            <textarea
              rows={3}
              required
              value={storyBody}
              onChange={(e) => setStoryBody(e.target.value)}
              placeholder="Ceritakan momen apa yang terjadi saat lagu ini diputar bersama..."
              className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 bg-white text-sm"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="min-h-[42px] px-3.5 py-2 rounded-xl bg-pink-50 border border-pink-200 text-rose-600 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer">
                <ImagePlus className="w-4 h-4" />
                <span>{storyPhoto ? storyPhoto.name : 'Tambah Foto Kenangan (Opsional)'}</span>
                <input
                  ref={storyFileRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setStoryPhoto(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={savingStory}
                className="min-h-[44px] px-5 py-2 rounded-2xl bg-rose-500 text-white text-xs sm:text-sm font-semibold hover:bg-rose-600 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {savingStory && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Simpan Song Story</span>
              </button>
            </div>

            {storyStatus && (
              <div
                className={`rounded-xl p-3 text-xs ${
                  storyStatus.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {storyStatus.text}
              </div>
            )}
          </form>

          {/* Song Stories Grid */}
          <div className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-3">
            <h3 className="font-display text-base font-bold text-[#4a2336]">
              Galeri Cerita Lagu Kita ({songStories.length})
            </h3>
            {songStories.length === 0 ? (
              <p className="text-sm text-[#7c5a6c]">
                Belum ada Song Story tersimpan. Tulis kisah pertama di balik lagu kesukaan kalian di atas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {songStories.map((st) => {
                  const canDelete =
                    st.uploaderUid === user?.uid || coupleSpace?.ownerUid === user?.uid;
                  return (
                    <article
                      key={st.id}
                      className="rounded-2xl bg-[#fff8fb] border border-pink-100 overflow-hidden flex flex-col justify-between"
                    >
                      {st.imageUrl && (
                        <img
                          src={st.imageUrl}
                          alt={st.songTitle}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-display text-sm font-bold text-[#4a2336] truncate">
                              {st.songTitle} · {st.artist}
                            </div>
                            <div className="text-xs text-rose-500 font-medium">
                              {st.dateLabel} · Ditulis oleh {st.uploaderName}
                            </div>
                          </div>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => void deleteSongStory(st)}
                              aria-label="Hapus song story"
                              className="min-h-[36px] min-w-[36px] rounded-xl text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[#5e3c4e] leading-relaxed whitespace-pre-wrap">
                          {st.story}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Music History & Recently Played */}
          <div className="rounded-3xl bg-white/90 border border-pink-100 shadow-sm p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-rose-500" />
              <h3 className="font-display text-base font-bold text-[#4a2336]">
                Riwayat Pemutaran Berdua ({musicHistory.length})
              </h3>
            </div>
            {musicHistory.length === 0 ? (
              <p className="text-sm text-[#7c5a6c]">
                Belum ada riwayat putar. Saat lagu diputar, riwayat otomatis dicatat di sini.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {musicHistory.map((h) => {
                  const found = playlist.find((s) => s.id === h.songId);
                  return (
                    <div
                      key={h.id}
                      className="rounded-2xl bg-pink-50/50 border border-pink-100 px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#4a2336] truncate">
                          {h.songTitle} · {h.artist}
                        </div>
                        <div className="text-[#7c5a6c] flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            Diputar oleh {h.playedByName} ·{' '}
                            {new Date(h.createdAtMs).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      {found && (
                        <button
                          type="button"
                          onClick={() => selectTrack(found.id, true, true)}
                          className="min-h-[36px] px-3 py-1 rounded-xl bg-white border border-pink-200 text-rose-600 font-semibold shrink-0 cursor-pointer"
                        >
                          Putar Ulang
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Dedication Open-Letter Modal */}
      <SongDedicationModal
        dedication={openedDedication}
        partnerDisplayName={myRoleName}
        onClose={() => setOpenedDedication(null)}
        onPlaySong={(d) => void handlePlayDedicationSong(d)}
      />
    </div>
  );
};
