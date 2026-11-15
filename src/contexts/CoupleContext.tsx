import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth, db, googleProvider, handleFirestoreError, storage } from '../lib/firebase';
import { compressImageFile } from '../lib/indexedDb';
import { extractYouTubeId } from '../lib/time';
import { useAppData } from './AppDataContext';
import {
  ChatMessage,
  CoupleSpace,
  GameHistoryEntry,
  GameRoom,
  MemoryCategory,
  MemoryCommentItem,
  MemoryItem,
  MultiplayerGameType,
  MusicHistoryItem,
  OperationType,
  PageId,
  PartnerRoleName,
  PromiseItem,
  RadioMoodTag,
  RadioSyncState,
  SharedGameType,
  SharedPlaylist,
  SharedPlaylistMood,
  SongDedication,
  SongItem,
  SongStory,
  SpacePresence,
  TimelineItem,
  UserProfile,
} from '../types';

const PAGE_LABELS: Record<PageId, string> = {
  dashboard: 'Beranda',
  connection: 'Our Connection',
  chat: 'Private Chat',
  countdown: 'Countdown WIT',
  candle: 'Candle Surprise',
  'truth-or-dare': 'Truth or Dare',
  'guess-picture': 'Tebak Gambar',
  'love-quiz': 'Love Quiz',
  music: 'Our Love Radio',
  memories: 'Our Memories',
  'love-letter': 'Love Letter',
  journey: 'Our Journey',
  'mini-games': 'Play Together',
  'secret-message': 'Secret Message',
  'virtual-hug': 'Virtual Hug',
  'our-promise': 'Our Promise',
  'final-surprise': 'Final Surprise',
  admin: 'Admin Mode',
};

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'ZD';
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function timestampToMs(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'seconds' in val) {
    return Number((val as { seconds: number }).seconds) * 1000;
  }
  return Date.now();
}

interface CoupleContextValue {
  firebaseReady: boolean;
  profile: UserProfile | null;
  coupleSpace: CoupleSpace | null;
  isPaired: boolean;
  myRoleName: PartnerRoleName;
  partnerName: string;
  partnerPresence: SpacePresence | null;
  myPresence: SpacePresence | null;
  shareActivePage: boolean;
  setShareActivePage: (share: boolean) => void;
  unreadChatCount: number;

  chatMessages: ChatMessage[];
  spaceMemories: MemoryItem[];
  spaceSongs: SongItem[];
  spacePromises: PromiseItem[];
  spaceTimeline: TimelineItem[];
  sharedGames: Record<string, Record<string, unknown>>;
  gameRooms: GameRoom[];
  gameHistory: GameHistoryEntry[];
  incomingGameInvites: GameRoom[];
  activeGameRooms: GameRoom[];

  // Our Love Radio Real-Time Collections
  spacePlaylists: SharedPlaylist[];
  radioSync: RadioSyncState | null;
  songDedications: SongDedication[];
  unreadDedications: SongDedication[];
  songStories: SongStory[];
  musicHistory: MusicHistoryItem[];

  // Auth helpers for Zikri & Diann
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, roleName: PartnerRoleName) => Promise<void>;
  logoutCoupleAccount: () => Promise<void>;

  // Pairing actions
  createCoupleSpace: (roleName: PartnerRoleName) => Promise<string>;
  joinCoupleSpace: (inviteCode: string, roleName: PartnerRoleName) => Promise<void>;
  regenerateInviteCode: () => Promise<string>;
  leaveCoupleSpace: () => Promise<void>;

  // Chat actions
  sendChatMessage: (text: string, sticker?: string) => Promise<void>;
  markPartnerMessagesRead: () => Promise<void>;

  // Shared Memories & Comments
  uploadSpaceMemory: (input: {
    file: File;
    caption: string;
    dateLabel: string;
    category: MemoryCategory;
  }) => Promise<void>;
  deleteSpaceMemory: (item: MemoryItem) => Promise<void>;
  subscribeMemoryComments: (
    memoryId: string,
    cb: (comments: MemoryCommentItem[]) => void
  ) => () => void;
  addMemoryComment: (memoryId: string, text: string) => Promise<void>;

  // Shared Music, Radio Sync, Dedications & Song Stories
  addSpaceSong: (input: {
    title: string;
    artist: string;
    youtubeUrl?: string;
    audioUrl?: string;
    audioFile?: File;
    artworkUrl?: string;
    playlistId?: string;
    moodTag?: RadioMoodTag;
    isFavorite?: boolean;
    isSpecialSong?: boolean;
  }) => Promise<string>;
  removeSpaceSong: (song: SongItem) => Promise<void>;
  toggleSongFavorite: (song: SongItem) => Promise<void>;
  toggleSongSpecial: (song: SongItem) => Promise<void>;
  moveSongOrder: (song: SongItem, direction: 'up' | 'down') => Promise<void>;
  createSpacePlaylist: (input: {
    name: string;
    description: string;
    moodType: SharedPlaylistMood;
  }) => Promise<string>;
  deleteSpacePlaylist: (playlistId: string) => Promise<void>;
  syncSharedSongState: (song: SongItem, playing: boolean) => Promise<void>;
  updateRadioSync: (input: {
    song: SongItem;
    playlistId: string;
    currentIndex: number;
    playbackStatus: 'playing' | 'paused';
    currentPosition: number;
    joinMember?: boolean;
  }) => Promise<void>;
  joinListeningTogether: () => Promise<void>;
  leaveListeningTogether: () => Promise<void>;
  sendSongDedication: (input: {
    songId: string;
    songTitle: string;
    songArtist: string;
    artworkUrl?: string;
    youtubeUrl?: string;
    audioUrl?: string;
    message: string;
  }) => Promise<void>;
  markDedicationOpened: (dedicationId: string) => Promise<void>;
  deleteSongDedication: (dedicationId: string) => Promise<void>;
  addSongStory: (input: {
    songTitle: string;
    artist: string;
    dateLabel: string;
    story: string;
    photoFile?: File;
  }) => Promise<void>;
  deleteSongStory: (story: SongStory) => Promise<void>;
  recordMusicPlay: (song: SongItem) => Promise<void>;

  updateSharedCandle: (lit: boolean, wish: string) => Promise<void>;
  markSharedAnniversaryOpened: () => Promise<void>;
  addSpacePromise: (text: string) => Promise<void>;
  removeSpacePromise: (promiseId: string) => Promise<void>;
  addSpaceTimelineItem: (input: {
    title: string;
    dateLabel: string;
    description: string;
    imageUrl?: string;
  }) => Promise<void>;

  // Play Together Multiplayer Games (legacy + 10-game Room Engine)
  updateSharedGame: (gameType: SharedGameType, payload: Record<string, unknown>) => Promise<void>;
  createGameRoom: (
    gameType: MultiplayerGameType,
    initialGameState: Record<string, unknown>,
    initialTurnMode?: 'player1' | 'both'
  ) => Promise<string>;
  acceptGameInvite: (roomId: string) => Promise<void>;
  declineGameInvite: (roomId: string) => Promise<void>;
  toggleRoomReady: (roomId: string) => Promise<void>;
  runRoomTransaction: (
    roomId: string,
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
  voteRematchRoom: (
    roomId: string,
    resetGameStateFactory: (room: GameRoom) => {
      gameState: Record<string, unknown>;
      currentTurn: string;
    }
  ) => Promise<void>;
  closeGameRoom: (roomId: string) => Promise<void>;
}

const CoupleContext = createContext<CoupleContextValue | null>(null);

export const CoupleProvider: React.FC<{
  activePage: PageId;
  children: React.ReactNode;
}> = ({ activePage, children }) => {
  const { user } = useAppData();

  const firebaseReady = Boolean(
    firebaseConfig?.projectId &&
      firebaseConfig?.apiKey &&
      firebaseConfig?.firestoreDatabaseId &&
      firebaseConfig.projectId !== 'remixed-project-id'
  );

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null);
  const [serverConfirmedSpaceId, setServerConfirmedSpaceId] = useState<string>('');
  const [isMutatingSpace, setIsMutatingSpace] = useState<boolean>(false);
  const [presenceMap, setPresenceMap] = useState<Record<string, SpacePresence>>({});
  const [shareActivePage, setShareActivePage] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('share_active_page_v1') !== 'false';
    } catch {
      return true;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [spaceMemories, setSpaceMemories] = useState<MemoryItem[]>([]);
  const [spaceSongs, setSpaceSongs] = useState<SongItem[]>([]);
  const [spacePromises, setSpacePromises] = useState<PromiseItem[]>([]);
  const [spaceTimeline, setSpaceTimeline] = useState<TimelineItem[]>([]);
  const [sharedGames, setSharedGames] = useState<Record<string, Record<string, unknown>>>({});
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [spacePlaylists, setSpacePlaylists] = useState<SharedPlaylist[]>([]);
  const [radioSync, setRadioSync] = useState<RadioSyncState | null>(null);
  const [songDedications, setSongDedications] = useState<SongDedication[]>([]);
  const [songStories, setSongStories] = useState<SongStory[]>([]);
  const [musicHistory, setMusicHistory] = useState<MusicHistoryItem[]>([]);

  const updateSharePagePref = (val: boolean) => {
    setShareActivePage(val);
    try {
      window.localStorage.setItem('share_active_page_v1', String(val));
    } catch {
      // Ignore
    }
  };

  // 1. Subscribe to userProfiles/{uid}
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setCoupleSpace(null);
      setServerConfirmedSpaceId('');
      return;
    }
    const path = `userProfiles/${user.uid}`;
    const unsub = onSnapshot(
      doc(db, 'userProfiles', user.uid),
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, path)
    );
    return () => unsub();
  }, [user]);

  const activeSpaceId = profile?.spaceId || '';
  const hasProfileDoc = Boolean(profile);

  // 2A. Stage 1: Discover and subscribe to CoupleSpace via member-scoped list queries
  // (avoids PERMISSION_DENIED if spaceId does not yet exist on server or is stale)
  useEffect(() => {
    if (!user || isMutatingSpace) {
      if (!user) {
        setCoupleSpace(null);
        setServerConfirmedSpaceId('');
      }
      return;
    }

    let member1Spaces: CoupleSpace[] = [];
    let member2Spaces: CoupleSpace[] = [];
    let m1Confirmed = false;
    let m2Confirmed = false;

    const reconcileSpaces = () => {
      const all = [...member1Spaces, ...member2Spaces];
      let matched: CoupleSpace | null = null;
      if (activeSpaceId) {
        matched = all.find((s) => s.id === activeSpaceId) || null;
      } else if (!hasProfileDoc) {
        matched = all[0] || null;
      }
      setCoupleSpace(matched);
      if (matched && (m1Confirmed || m2Confirmed)) {
        setServerConfirmedSpaceId(matched.id);
      } else if (!matched && m1Confirmed && m2Confirmed) {
        setServerConfirmedSpaceId('');
      }
    };

    const q1 = query(collection(db, 'coupleSpaces'), where('member1Uid', '==', user.uid));
    const q2 = query(collection(db, 'coupleSpaces'), where('member2Uid', '==', user.uid));

    const unsub1 = onSnapshot(
      q1,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        m1Confirmed = true;
        member1Spaces = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CoupleSpace, 'id'>),
        }));
        reconcileSpaces();
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'coupleSpaces')
    );

    const unsub2 = onSnapshot(
      q2,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        m2Confirmed = true;
        member2Spaces = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<CoupleSpace, 'id'>),
        }));
        reconcileSpaces();
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'coupleSpaces')
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [user, activeSpaceId, hasProfileDoc, isMutatingSpace]);

  const confirmedSpaceId =
    !isMutatingSpace &&
    coupleSpace &&
    serverConfirmedSpaceId === coupleSpace.id &&
    user &&
    (coupleSpace.member1Uid === user.uid || coupleSpace.member2Uid === user.uid)
      ? coupleSpace.id
      : '';

  // 2B. Stage 2: Subscribe to CoupleSpace real-time subcollections ONLY after server confirms membership
  useEffect(() => {
    if (!user || !confirmedSpaceId) {
      setPresenceMap({});
      setChatMessages([]);
      setSpaceMemories([]);
      setSpaceSongs([]);
      setSpacePromises([]);
      setSpaceTimeline([]);
      setSharedGames({});
      setGameRooms([]);
      setGameHistory([]);
      setSpacePlaylists([]);
      setRadioSync(null);
      setSongDedications([]);
      setSongStories([]);
      setMusicHistory([]);
      return;
    }

    const unsubPresence = onSnapshot(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'presence'),
      (snap) => {
        const next: Record<string, SpacePresence> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          next[d.id] = {
            uid: String(data.uid || d.id),
            roleName: String(data.roleName || 'Pasangan'),
            online: Boolean(data.online),
            sharePage: Boolean(data.sharePage),
            currentPage: String(data.currentPage || 'Privat'),
            lastSeenMs: timestampToMs(data.lastSeen),
          };
        });
        setPresenceMap(next);
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/presence`)
    );

    const qChat = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(150)
    );
    const unsubChat = onSnapshot(
      qChat,
      (snap) => {
        setChatMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              senderUid: String(data.senderUid || ''),
              senderName: String(data.senderName || ''),
              text: String(data.text || ''),
              sticker: String(data.sticker || ''),
              readByPartner: Boolean(data.readByPartner),
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/messages`)
    );

    const qMem = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'memories'),
      orderBy('createdAt', 'desc')
    );
    const unsubMem = onSnapshot(
      qMem,
      (snap) => {
        setSpaceMemories(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              caption: String(data.caption || ''),
              dateLabel: String(data.dateLabel || ''),
              category: data.category as MemoryCategory,
              imageUrl: String(data.imageUrl || ''),
              storagePath: data.storagePath ? String(data.storagePath) : undefined,
              isPublic: false,
              uploaderUid: String(data.uploaderUid || ''),
              uploaderName: String(data.uploaderName || ''),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/memories`)
    );

    const qSongs = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'songs'),
      orderBy('sortOrder', 'asc')
    );
    const unsubSongs = onSnapshot(
      qSongs,
      (snap) => {
        setSpaceSongs(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SongItem, 'id'>),
          }))
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/songs`)
    );

    const qPromises = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'promises'),
      orderBy('createdAt', 'desc')
    );
    const unsubPromises = onSnapshot(
      qPromises,
      (snap) => {
        setSpacePromises(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<PromiseItem, 'id'>),
          }))
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/promises`)
    );

    const qTimeline = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'timeline'),
      orderBy('sortOrder', 'asc')
    );
    const unsubTimeline = onSnapshot(
      qTimeline,
      (snap) => {
        setSpaceTimeline(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TimelineItem, 'id'>),
          }))
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/timeline`)
    );

    const unsubGames = onSnapshot(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'games'),
      (snap) => {
        const map: Record<string, Record<string, unknown>> = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          if (data.payload && typeof data.payload === 'object') {
            map[d.id] = data.payload as Record<string, unknown>;
          }
        });
        setSharedGames(map);
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/games`)
    );

    const qRooms = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms'),
      orderBy('updatedAt', 'desc'),
      limit(30)
    );
    const unsubRooms = onSnapshot(
      qRooms,
      (snap) => {
        setGameRooms(
          snap.docs.map((d) => {
            const data = d.data();
            const rawScore = (data.score || {}) as { player1?: unknown; player2?: unknown };
            const rawRematch = (data.rematchVotes || {}) as { player1?: unknown; player2?: unknown };
            return {
              roomId: String(data.roomId || d.id),
              coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
              player1Id: String(data.player1Id || ''),
              player1Name: String(data.player1Name || 'Zikri'),
              player2Id: String(data.player2Id || ''),
              player2Name: String(data.player2Name || 'Diann'),
              invitedByUid: String(data.invitedByUid || data.player1Id || ''),
              gameType: data.gameType as MultiplayerGameType,
              status: data.status as GameRoom['status'],
              player1Ready: Boolean(data.player1Ready),
              player2Ready: Boolean(data.player2Ready),
              currentTurn: String(data.currentTurn || ''),
              turnNumber: Number(data.turnNumber || 0),
              gameState: (data.gameState as Record<string, unknown>) || {},
              score: {
                player1: Number(rawScore.player1 || 0),
                player2: Number(rawScore.player2 || 0),
              },
              winnerId: String(data.winnerId || ''),
              rematchVotes: {
                player1: Boolean(rawRematch.player1),
                player2: Boolean(rawRematch.player2),
              },
              createdAtMs: timestampToMs(data.createdAt),
              updatedAtMs: timestampToMs(data.updatedAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/gameRooms`)
    );

    const qHistory = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'gameHistory'),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const unsubHistory = onSnapshot(
      qHistory,
      (snap) => {
        setGameHistory(
          snap.docs.map((d) => {
            const data = d.data();
            const rawScore = (data.score || {}) as { player1?: unknown; player2?: unknown };
            return {
              id: d.id,
              roomId: String(data.roomId || ''),
              coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
              gameType: data.gameType as MultiplayerGameType,
              gameTitle: String(data.gameTitle || 'Game Berdua'),
              player1Id: String(data.player1Id || ''),
              player1Name: String(data.player1Name || 'Zikri'),
              player2Id: String(data.player2Id || ''),
              player2Name: String(data.player2Name || 'Diann'),
              score: {
                player1: Number(rawScore.player1 || 0),
                player2: Number(rawScore.player2 || 0),
              },
              winnerId: String(data.winnerId || ''),
              winnerName: String(data.winnerName || ''),
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/gameHistory`)
    );

    const qPlaylists = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'playlists'),
      orderBy('createdAt', 'asc')
    );
    const unsubPlaylists = onSnapshot(
      qPlaylists,
      (snap) => {
        setSpacePlaylists(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
              name: String(data.name || ''),
              description: String(data.description || ''),
              moodType: (data.moodType as SharedPlaylistMood) || 'Custom',
              creatorUid: String(data.creatorUid || ''),
              creatorName: String(data.creatorName || ''),
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `coupleSpaces/${confirmedSpaceId}/playlists`)
    );

    const unsubRadioSync = onSnapshot(
      doc(db, 'coupleSpaces', confirmedSpaceId, 'radioSync', 'current'),
      (snap) => {
        if (!snap.exists()) {
          setRadioSync(null);
          return;
        }
        const data = snap.data();
        setRadioSync({
          coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
          songId: String(data.songId || ''),
          songTitle: String(data.songTitle || ''),
          songArtist: String(data.songArtist || ''),
          playlistId: String(data.playlistId || 'all'),
          currentIndex: Number(data.currentIndex || 0),
          playbackStatus: data.playbackStatus === 'playing' ? 'playing' : 'paused',
          currentPosition: Number(data.currentPosition || 0),
          lastUpdatedByUid: String(data.lastUpdatedByUid || ''),
          lastUpdatedByName: String(data.lastUpdatedByName || ''),
          member1Joined: Boolean(data.member1Joined),
          member2Joined: Boolean(data.member2Joined),
          updatedAtMs: timestampToMs(data.updatedAt),
        });
      },
      (err) =>
        handleFirestoreError(
          err,
          OperationType.GET,
          `coupleSpaces/${confirmedSpaceId}/radioSync/current`
        )
    );

    const qDedications = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'songDedications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const unsubDedications = onSnapshot(
      qDedications,
      (snap) => {
        setSongDedications(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
              senderUid: String(data.senderUid || ''),
              senderName: String(data.senderName || ''),
              songId: String(data.songId || ''),
              songTitle: String(data.songTitle || ''),
              songArtist: String(data.songArtist || ''),
              artworkUrl: String(data.artworkUrl || ''),
              youtubeUrl: String(data.youtubeUrl || ''),
              audioUrl: String(data.audioUrl || ''),
              message: String(data.message || ''),
              openedByPartner: Boolean(data.openedByPartner),
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(
          err,
          OperationType.LIST,
          `coupleSpaces/${confirmedSpaceId}/songDedications`
        )
    );

    const qStories = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'songStories'),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const unsubStories = onSnapshot(
      qStories,
      (snap) => {
        setSongStories(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
              songTitle: String(data.songTitle || ''),
              artist: String(data.artist || ''),
              dateLabel: String(data.dateLabel || ''),
              story: String(data.story || ''),
              imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
              storagePath: data.storagePath ? String(data.storagePath) : undefined,
              uploaderUid: String(data.uploaderUid || ''),
              uploaderName: String(data.uploaderName || ''),
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(
          err,
          OperationType.LIST,
          `coupleSpaces/${confirmedSpaceId}/songStories`
        )
    );

    const qMusicHist = query(
      collection(db, 'coupleSpaces', confirmedSpaceId, 'musicHistory'),
      orderBy('createdAt', 'desc'),
      limit(40)
    );
    const unsubMusicHist = onSnapshot(
      qMusicHist,
      (snap) => {
        setMusicHistory(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              coupleSpaceId: String(data.coupleSpaceId || confirmedSpaceId),
              songId: String(data.songId || ''),
              songTitle: String(data.songTitle || ''),
              artist: String(data.artist || ''),
              sourceType: data.sourceType === 'youtube' ? 'youtube' : 'audio',
              playedByUid: String(data.playedByUid || ''),
              playedByName: String(data.playedByName || ''),
              createdAtMs: timestampToMs(data.createdAt),
            };
          })
        );
      },
      (err) =>
        handleFirestoreError(
          err,
          OperationType.LIST,
          `coupleSpaces/${confirmedSpaceId}/musicHistory`
        )
    );

    return () => {
      unsubPresence();
      unsubChat();
      unsubMem();
      unsubSongs();
      unsubPromises();
      unsubTimeline();
      unsubGames();
      unsubRooms();
      unsubHistory();
      unsubPlaylists();
      unsubRadioSync();
      unsubDedications();
      unsubStories();
      unsubMusicHist();
    };
  }, [user, confirmedSpaceId]);

  const myRoleName: PartnerRoleName = useMemo(() => {
    if (profile?.roleName) return profile.roleName;
    if (coupleSpace && user) {
      if (coupleSpace.member1Uid === user.uid && (coupleSpace.member1Name === 'Diann' || coupleSpace.member1Name === 'Zikri')) {
        return coupleSpace.member1Name;
      }
      if (coupleSpace.member2Uid === user.uid && (coupleSpace.member2Name === 'Diann' || coupleSpace.member2Name === 'Zikri')) {
        return coupleSpace.member2Name;
      }
    }
    return 'Zikri';
  }, [coupleSpace, profile, user]);

  // 3. Real-time Presence Heartbeat + Page Tracking + Offline on Tab Hide/Unload
  useEffect(() => {
    if (!user || !confirmedSpaceId || !coupleSpace) return;
    const isMember =
      coupleSpace.member1Uid === user.uid || coupleSpace.member2Uid === user.uid;
    if (!isMember) return;

    const presenceRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'presence', user.uid);

    const writePresence = async (online: boolean) => {
      try {
        await setDoc(presenceRef, {
          uid: user.uid,
          roleName: myRoleName,
          online,
          sharePage: shareActivePage,
          currentPage: shareActivePage ? PAGE_LABELS[activePage] || activePage : 'Privat',
          lastSeen: serverTimestamp(),
        });
      } catch {
        // Ignore transient network errors during unload
      }
    };

    void writePresence(true);

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void writePresence(true);
      }
    }, 25000);

    const handleVisibility = () => {
      void writePresence(document.visibilityState === 'visible');
    };

    const handleUnload = () => {
      void writePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [user, confirmedSpaceId, coupleSpace, activePage, shareActivePage, myRoleName]);

  const isPaired = Boolean(coupleSpace && coupleSpace.memberCount === 2 && coupleSpace.member2Uid);

  const partnerName = useMemo(() => {
    if (!coupleSpace || !user) return myRoleName === 'Zikri' ? 'Diann' : 'Zikri';
    if (coupleSpace.member1Uid === user.uid) return coupleSpace.member2Name || 'Pasangan';
    return coupleSpace.member1Name || 'Pasangan';
  }, [coupleSpace, myRoleName, user]);

  const partnerPresence = useMemo(() => {
    if (!coupleSpace || !user) return null;
    const partnerUid =
      coupleSpace.member1Uid === user.uid ? coupleSpace.member2Uid : coupleSpace.member1Uid;
    if (!partnerUid) return null;
    return presenceMap[partnerUid] || null;
  }, [coupleSpace, presenceMap, user]);

  const myPresence = user ? presenceMap[user.uid] || null : null;

  const unreadChatCount = useMemo(() => {
    if (!user) return 0;
    return chatMessages.filter((m) => m.senderUid !== user.uid && !m.readByPartner).length;
  }, [chatMessages, user]);

  // Auth functions
  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const registerWithEmail = useCallback(
    async (email: string, password: string, roleName: PartnerRoleName) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'userProfiles', cred.user.uid), {
        uid: cred.user.uid,
        roleName,
        spaceId: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
    []
  );

  const logoutCoupleAccount = useCallback(async () => {
    if (user && confirmedSpaceId) {
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'presence', user.uid), {
          uid: user.uid,
          roleName: myRoleName,
          online: false,
          sharePage: shareActivePage,
          currentPage: 'Offline',
          lastSeen: serverTimestamp(),
        });
      } catch {
        // Ignore
      }
    }
    await signOut(auth);
  }, [confirmedSpaceId, myRoleName, shareActivePage, user]);

  // Pairing actions
  const createCoupleSpace = useCallback(
    async (roleName: PartnerRoleName): Promise<string> => {
      if (!auth.currentUser) throw new Error('Silakan masuk akun terlebih dahulu.');
      const uid = auth.currentUser.uid;
      const spaceId = `space_${uid.slice(0, 12)}_${Date.now()}`;
      const code = generateInviteCode();

      setIsMutatingSpace(true);
      try {
        const profileRef = doc(db, 'userProfiles', uid);
        const profileSnap = await getDoc(profileRef);

        const batch = writeBatch(db);
        batch.set(doc(db, 'coupleSpaces', spaceId), {
          title: 'Zikri ♡ Diann',
          inviteCode: code,
          ownerUid: uid,
          member1Uid: uid,
          member1Name: roleName,
          member2Uid: '',
          member2Name: '',
          memberCount: 1,
          candleLit: true,
          candleWish: '',
          anniversaryOpened: false,
          sharedSongId: '',
          sharedSongTitle: '',
          sharedSongArtist: '',
          sharedSongPlaying: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        batch.set(doc(db, 'inviteCodes', code), {
          code,
          spaceId,
          creatorUid: uid,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (profileSnap.exists()) {
          batch.update(profileRef, {
            roleName,
            spaceId,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(profileRef, {
            uid,
            roleName,
            spaceId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        await batch.commit();
        return code;
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `coupleSpaces/${spaceId}`);
      } finally {
        setIsMutatingSpace(false);
      }
    },
    []
  );

  const joinCoupleSpace = useCallback(
    async (rawCode: string, roleName: PartnerRoleName): Promise<void> => {
      if (!auth.currentUser) throw new Error('Silakan masuk akun terlebih dahulu.');
      const uid = auth.currentUser.uid;
      const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!/^[A-Z0-9]{6,12}$/.test(code)) {
        throw new Error('Format kode undangan tidak valid (6–12 karakter huruf/angka).');
      }

      const inviteRef = doc(db, 'inviteCodes', code);
      const inviteSnap = await getDoc(inviteRef);
      if (!inviteSnap.exists()) {
        throw new Error('Kode undangan tidak ditemukan. Periksa kembali kode dari pasanganmu.');
      }
      const inviteData = inviteSnap.data();
      if (!inviteData.isActive) {
        throw new Error('Kode undangan ini sudah digunakan atau Couple Space sudah terhubung (maksimal 2 anggota).');
      }
      if (inviteData.creatorUid === uid) {
        throw new Error('Kamu tidak bisa bergabung ke ruangmu sendiri dengan akun yang sama. Gunakan akun kedua untuk pasangan.');
      }

      const targetSpaceId = String(inviteData.spaceId);
      setIsMutatingSpace(true);
      try {
        const profileRef = doc(db, 'userProfiles', uid);
        const profileSnap = await getDoc(profileRef);

        const batch = writeBatch(db);
        batch.update(inviteRef, {
          isActive: false,
          updatedAt: serverTimestamp(),
        });
        batch.update(doc(db, 'coupleSpaces', targetSpaceId), {
          member2Uid: uid,
          member2Name: roleName,
          memberCount: 2,
          updatedAt: serverTimestamp(),
        });
        if (profileSnap.exists()) {
          batch.update(profileRef, {
            roleName,
            spaceId: targetSpaceId,
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(profileRef, {
            uid,
            roleName,
            spaceId: targetSpaceId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `coupleSpaces/${targetSpaceId}`);
      } finally {
        setIsMutatingSpace(false);
      }
    },
    []
  );

  const regenerateInviteCode = useCallback(async (): Promise<string> => {
    if (!auth.currentUser || !coupleSpace) throw new Error('Couple Space belum tersedia.');
    const newCode = generateInviteCode();
    await setDoc(doc(db, 'inviteCodes', coupleSpace.inviteCode), {
      code: coupleSpace.inviteCode,
      spaceId: coupleSpace.id,
      creatorUid: auth.currentUser.uid,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return coupleSpace.inviteCode || newCode;
  }, [coupleSpace]);

  const leaveCoupleSpace = useCallback(async () => {
    if (!auth.currentUser) return;
    setIsMutatingSpace(true);
    try {
      const profileRef = doc(db, 'userProfiles', auth.currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        await updateDoc(profileRef, {
          roleName: myRoleName,
          spaceId: '',
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(profileRef, {
          uid: auth.currentUser.uid,
          roleName: myRoleName,
          spaceId: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setServerConfirmedSpaceId('');
      setCoupleSpace(null);
    } finally {
      setIsMutatingSpace(false);
    }
  }, [myRoleName]);

  // Real-time Chat
  const sendChatMessage = useCallback(
    async (text: string, sticker = '') => {
      if (!auth.currentUser || !confirmedSpaceId) throw new Error('Belum terhubung ke Couple Space.');
      const trimmed = text.trim().slice(0, 2000);
      if (!trimmed && !sticker) return;
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'messages', msgId), {
          senderUid: auth.currentUser.uid,
          senderName: myRoleName,
          text: trimmed,
          sticker: sticker.slice(0, 40),
          readByPartner: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `coupleSpaces/${confirmedSpaceId}/messages/${msgId}`);
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const markPartnerMessagesRead = useCallback(async () => {
    if (!auth.currentUser || !confirmedSpaceId) return;
    const unread = chatMessages.filter(
      (m) => m.senderUid !== auth.currentUser?.uid && !m.readByPartner
    );
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.slice(0, 30).forEach((m) => {
      batch.update(doc(db, 'coupleSpaces', confirmedSpaceId, 'messages', m.id), {
        readByPartner: true,
        updatedAt: serverTimestamp(),
      });
    });
    try {
      await batch.commit();
    } catch {
      // Ignore concurrent updates
    }
  }, [confirmedSpaceId, chatMessages]);

  // Shared Memories & Comments
  const uploadSpaceMemory = useCallback(
    async (input: {
      file: File;
      caption: string;
      dateLabel: string;
      category: MemoryCategory;
    }) => {
      if (!auth.currentUser || !confirmedSpaceId) throw new Error('Belum terhubung ke Couple Space.');
      const memId = `smem_${Date.now()}`;
      const compressed = await compressImageFile(input.file, 1280, 0.82);
      const storagePath = `coupleSpaces/${confirmedSpaceId}/memories/${memId}.jpg`;
      const storageRef = ref(storage, storagePath);

      let downloadUrl = '';
      try {
        await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
        downloadUrl = await getDownloadURL(storageRef);
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? `Gagal mengunggah ke Firebase Storage (${err.message}). Pastikan Firebase Storage Rules mengizinkan akses user terautentikasi.`
            : 'Gagal mengunggah ke Firebase Storage.'
        );
      }

      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'memories', memId), {
          caption: input.caption.trim().slice(0, 500),
          dateLabel: input.dateLabel.trim().slice(0, 60) || 'Kenangan Kita',
          category: input.category,
          imageUrl: downloadUrl.slice(0, 2000),
          storagePath,
          uploaderUid: auth.currentUser.uid,
          uploaderName: myRoleName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `coupleSpaces/${confirmedSpaceId}/memories/${memId}`);
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const deleteSpaceMemory = useCallback(
    async (item: MemoryItem) => {
      if (!confirmedSpaceId) return;
      if (item.storagePath) {
        try {
          await deleteObject(ref(storage, item.storagePath));
        } catch {
          // Ignore storage deletion failure
        }
      }
      try {
        await deleteDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'memories', item.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `coupleSpaces/${confirmedSpaceId}/memories/${item.id}`);
      }
    },
    [confirmedSpaceId]
  );

  const subscribeMemoryComments = useCallback(
    (memoryId: string, cb: (comments: MemoryCommentItem[]) => void) => {
      if (!confirmedSpaceId) return () => {};
      const qComments = query(
        collection(db, 'coupleSpaces', confirmedSpaceId, 'memories', memoryId, 'comments'),
        orderBy('createdAt', 'asc')
      );
      return onSnapshot(
        qComments,
        (snap) => {
          cb(
            snap.docs.map((d) => {
              const data = d.data();
              return {
                id: d.id,
                authorUid: String(data.authorUid || ''),
                authorName: String(data.authorName || ''),
                text: String(data.text || ''),
                createdAtMs: timestampToMs(data.createdAt),
              };
            })
          );
        },
        (err) =>
          handleFirestoreError(
            err,
            OperationType.LIST,
            `coupleSpaces/${confirmedSpaceId}/memories/${memoryId}/comments`
          )
      );
    },
    [confirmedSpaceId]
  );

  const addMemoryComment = useCallback(
    async (memoryId: string, text: string) => {
      if (!auth.currentUser || !confirmedSpaceId || !text.trim()) return;
      const cid = `cmt_${Date.now()}`;
      try {
        await setDoc(
          doc(db, 'coupleSpaces', confirmedSpaceId, 'memories', memoryId, 'comments', cid),
          {
            authorUid: auth.currentUser.uid,
            authorName: myRoleName,
            text: text.trim().slice(0, 400),
            createdAt: serverTimestamp(),
          }
        );
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `coupleSpaces/${confirmedSpaceId}/memories/${memoryId}/comments/${cid}`
        );
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  // Shared Music, Playlists, Listening Together Sync, Dedications, Song Stories & History
  const addSpaceSong = useCallback(
    async (input: {
      title: string;
      artist: string;
      youtubeUrl?: string;
      audioUrl?: string;
      audioFile?: File;
      artworkUrl?: string;
      playlistId?: string;
      moodTag?: RadioMoodTag;
      isFavorite?: boolean;
      isSpecialSong?: boolean;
    }): Promise<string> => {
      if (!auth.currentUser || !confirmedSpaceId) throw new Error('Belum terhubung.');
      const songId = `ssong_${Date.now()}`;

      let sourceType: 'audio' | 'youtube' = 'audio';
      let youtubeId = '';
      let youtubeUrl = '';
      let audioUrl = '';
      let storagePath = '';

      if (input.audioFile) {
        if (input.audioFile.size > 15 * 1024 * 1024) {
          throw new Error('Ukuran file audio maksimal 15 MB agar lancar diputar di HP.');
        }
        const safeExt =
          (input.audioFile.name.split('.').pop() || 'mp3')
            .replace(/[^a-zA-Z0-9]/g, '')
            .slice(0, 8) || 'mp3';
        storagePath = `coupleSpaces/${confirmedSpaceId}/songs/${songId}.${safeExt}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, input.audioFile, {
          contentType: input.audioFile.type || 'audio/mpeg',
        });
        audioUrl = await getDownloadURL(storageRef);
        sourceType = 'audio';
      } else if (input.audioUrl?.trim()) {
        audioUrl = input.audioUrl.trim().slice(0, 2000);
        sourceType = 'audio';
      } else if (input.youtubeUrl?.trim()) {
        const ytId = extractYouTubeId(input.youtubeUrl);
        if (!ytId) throw new Error('URL audio langsung atau YouTube tidak valid.');
        youtubeId = ytId;
        youtubeUrl = `https://www.youtube.com/watch?v=${ytId}`;
        sourceType = 'youtube';
      } else {
        throw new Error('Pilih file audio, link MP3/WAV, atau link YouTube.');
      }

      const maxOrder = spaceSongs.reduce((acc, s) => Math.max(acc, s.sortOrder || 0), 0);

      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songs', songId), {
          title: input.title.trim().slice(0, 180) || 'Lagu Bersama',
          artist: input.artist.trim().slice(0, 140) || myRoleName,
          youtubeUrl,
          youtubeId: youtubeId || songId,
          ...(audioUrl ? { audioUrl } : {}),
          ...(input.artworkUrl
            ? { artworkUrl: input.artworkUrl.trim().slice(0, 2000) }
            : sourceType === 'youtube' && youtubeId
            ? { artworkUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` }
            : {}),
          sourceType,
          ...(storagePath ? { storagePath } : {}),
          uploaderName: myRoleName,
          playlistId: (input.playlistId || '').slice(0, 64),
          moodTag: input.moodTag || '',
          isFavorite: Boolean(input.isFavorite),
          isSpecialSong: Boolean(input.isSpecialSong),
          sortOrder: maxOrder + 1,
          isPublic: true,
          ownerUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return songId;
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `coupleSpaces/${confirmedSpaceId}/songs/${songId}`
        );
      }
    },
    [confirmedSpaceId, myRoleName, spaceSongs]
  );

  const removeSpaceSong = useCallback(
    async (song: SongItem) => {
      if (!confirmedSpaceId) return;
      if (song.storagePath) {
        try {
          await deleteObject(ref(storage, song.storagePath));
        } catch {
          // Ignore storage removal errors
        }
      }
      try {
        await deleteDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songs', song.id));
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.DELETE,
          `coupleSpaces/${confirmedSpaceId}/songs/${song.id}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const toggleSongFavorite = useCallback(
    async (song: SongItem) => {
      if (!confirmedSpaceId || !auth.currentUser) return;
      const isCloud = spaceSongs.some((s) => s.id === song.id);
      if (!isCloud) return;
      try {
        await updateDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songs', song.id), {
          isFavorite: !song.isFavorite,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/songs/${song.id}`
        );
      }
    },
    [confirmedSpaceId, spaceSongs]
  );

  const toggleSongSpecial = useCallback(
    async (song: SongItem) => {
      if (!confirmedSpaceId || !auth.currentUser) return;
      const isCloud = spaceSongs.some((s) => s.id === song.id);
      if (!isCloud) return;
      try {
        await updateDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songs', song.id), {
          isSpecialSong: !song.isSpecialSong,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/songs/${song.id}`
        );
      }
    },
    [confirmedSpaceId, spaceSongs]
  );

  const moveSongOrder = useCallback(
    async (song: SongItem, direction: 'up' | 'down') => {
      if (!confirmedSpaceId) return;
      const sorted = [...spaceSongs].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const idx = sorted.findIndex((s) => s.id === song.id);
      if (idx < 0) return;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;
      const other = sorted[swapIdx];

      const batch = writeBatch(db);
      batch.update(doc(db, 'coupleSpaces', confirmedSpaceId, 'songs', song.id), {
        sortOrder: swapIdx + 1,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, 'coupleSpaces', confirmedSpaceId, 'songs', other.id), {
        sortOrder: idx + 1,
        updatedAt: serverTimestamp(),
      });
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/songs/${song.id}`
        );
      }
    },
    [confirmedSpaceId, spaceSongs]
  );

  const createSpacePlaylist = useCallback(
    async (input: { name: string; description: string; moodType: SharedPlaylistMood }) => {
      if (!auth.currentUser || !confirmedSpaceId) {
        throw new Error('Hubungkan Couple Space terlebih dahulu untuk membuat playlist bersama.');
      }
      const plId = `pl_${Date.now()}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'playlists', plId), {
          coupleSpaceId: confirmedSpaceId,
          name: input.name.trim().slice(0, 80) || 'Playlist Berdua',
          description: input.description.trim().slice(0, 240),
          moodType: input.moodType,
          creatorUid: auth.currentUser.uid,
          creatorName: myRoleName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return plId;
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `coupleSpaces/${confirmedSpaceId}/playlists/${plId}`
        );
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const deleteSpacePlaylist = useCallback(
    async (playlistId: string) => {
      if (!confirmedSpaceId) return;
      try {
        await deleteDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'playlists', playlistId));
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.DELETE,
          `coupleSpaces/${confirmedSpaceId}/playlists/${playlistId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const syncSharedSongState = useCallback(
    async (song: SongItem, playing: boolean) => {
      if (!confirmedSpaceId) return;
      const trackKey =
        song.sourceType === 'audio' || song.audioUrl ? song.id : song.youtubeId || song.id;
      try {
        await updateDoc(doc(db, 'coupleSpaces', confirmedSpaceId), {
          sharedSongId: String(trackKey).slice(0, 64),
          sharedSongTitle: song.title.slice(0, 180),
          sharedSongArtist: song.artist.slice(0, 140),
          sharedSongPlaying: playing,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `coupleSpaces/${confirmedSpaceId}`);
      }
    },
    [confirmedSpaceId]
  );

  const updateRadioSync = useCallback(
    async (input: {
      song: SongItem;
      playlistId: string;
      currentIndex: number;
      playbackStatus: 'playing' | 'paused';
      currentPosition: number;
      joinMember?: boolean;
    }) => {
      if (!auth.currentUser || !confirmedSpaceId || !coupleSpace) return;
      const myUid = auth.currentUser.uid;
      const isM1 = coupleSpace.member1Uid === myUid;
      const syncRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'radioSync', 'current');
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(syncRef);
          const prev = snap.exists() ? snap.data() : null;
          const m1Joined = isM1
            ? input.joinMember ?? (prev ? Boolean(prev.member1Joined) : true)
            : Boolean(prev?.member1Joined);
          const m2Joined = !isM1
            ? input.joinMember ?? (prev ? Boolean(prev.member2Joined) : true)
            : Boolean(prev?.member2Joined);

          tx.set(syncRef, {
            coupleSpaceId: confirmedSpaceId,
            songId: (input.song.id || input.song.youtubeId).slice(0, 64),
            songTitle: input.song.title.slice(0, 180),
            songArtist: input.song.artist.slice(0, 140),
            playlistId: (input.playlistId || 'all').slice(0, 64),
            currentIndex: Math.max(0, Math.round(input.currentIndex)),
            playbackStatus: input.playbackStatus,
            currentPosition: Math.max(0, Number(input.currentPosition || 0)),
            lastUpdatedByUid: myUid,
            lastUpdatedByName: myRoleName,
            member1Joined: m1Joined,
            member2Joined: m2Joined,
            updatedAt: serverTimestamp(),
          });
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `coupleSpaces/${confirmedSpaceId}/radioSync/current`
        );
      }
    },
    [confirmedSpaceId, coupleSpace, myRoleName]
  );

  const joinListeningTogether = useCallback(async () => {
    if (!auth.currentUser || !confirmedSpaceId || !coupleSpace) return;
    const myUid = auth.currentUser.uid;
    const isM1 = coupleSpace.member1Uid === myUid;
    const syncRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'radioSync', 'current');
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(syncRef);
        const prev = snap.exists() ? snap.data() : null;
        tx.set(syncRef, {
          coupleSpaceId: confirmedSpaceId,
          songId: String(prev?.songId || 'audio-our-little-world').slice(0, 64),
          songTitle: String(prev?.songTitle || 'Our Little World (Piano Theme)').slice(0, 180),
          songArtist: String(prev?.songArtist || 'Zikri & Diann Anniversary Mix').slice(0, 140),
          playlistId: String(prev?.playlistId || 'all').slice(0, 64),
          currentIndex: Number(prev?.currentIndex || 0),
          playbackStatus: prev?.playbackStatus === 'playing' ? 'playing' : 'paused',
          currentPosition: Number(prev?.currentPosition || 0),
          lastUpdatedByUid: myUid,
          lastUpdatedByName: myRoleName,
          member1Joined: isM1 ? true : Boolean(prev?.member1Joined),
          member2Joined: !isM1 ? true : Boolean(prev?.member2Joined),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `coupleSpaces/${confirmedSpaceId}/radioSync/current`
      );
    }
  }, [confirmedSpaceId, coupleSpace, myRoleName]);

  const leaveListeningTogether = useCallback(async () => {
    if (!auth.currentUser || !confirmedSpaceId || !coupleSpace) return;
    const myUid = auth.currentUser.uid;
    const isM1 = coupleSpace.member1Uid === myUid;
    const syncRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'radioSync', 'current');
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(syncRef);
        if (!snap.exists()) return;
        const prev = snap.data();
        tx.set(syncRef, {
          coupleSpaceId: confirmedSpaceId,
          songId: String(prev.songId || 'audio-our-little-world').slice(0, 64),
          songTitle: String(prev.songTitle || 'Our Little World').slice(0, 180),
          songArtist: String(prev.songArtist || 'Zikri & Diann').slice(0, 140),
          playlistId: String(prev.playlistId || 'all').slice(0, 64),
          currentIndex: Number(prev.currentIndex || 0),
          playbackStatus: prev.playbackStatus === 'playing' ? 'playing' : 'paused',
          currentPosition: Number(prev.currentPosition || 0),
          lastUpdatedByUid: myUid,
          lastUpdatedByName: myRoleName,
          member1Joined: isM1 ? false : Boolean(prev.member1Joined),
          member2Joined: !isM1 ? false : Boolean(prev.member2Joined),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (err) {
      handleFirestoreError(
        err,
        OperationType.WRITE,
        `coupleSpaces/${confirmedSpaceId}/radioSync/current`
      );
    }
  }, [confirmedSpaceId, coupleSpace, myRoleName]);

  const sendSongDedication = useCallback(
    async (input: {
      songId: string;
      songTitle: string;
      songArtist: string;
      artworkUrl?: string;
      youtubeUrl?: string;
      audioUrl?: string;
      message: string;
    }) => {
      if (!auth.currentUser || !confirmedSpaceId) {
        throw new Error('Hubungkan Couple Space untuk mengirim dedikasi lagu.');
      }
      const trimmedMsg = input.message.trim().slice(0, 600);
      if (!trimmedMsg) throw new Error('Tulis pesan dedikasi singkat terlebih dahulu.');
      const did = `ded_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songDedications', did), {
          coupleSpaceId: confirmedSpaceId,
          senderUid: auth.currentUser.uid,
          senderName: myRoleName,
          songId: (input.songId || 'custom').slice(0, 64),
          songTitle: input.songTitle.trim().slice(0, 180) || 'Lagu Spesial',
          songArtist: input.songArtist.trim().slice(0, 140) || 'Artis',
          artworkUrl: (input.artworkUrl || '').slice(0, 2000),
          youtubeUrl: (input.youtubeUrl || '').slice(0, 500),
          audioUrl: (input.audioUrl || '').slice(0, 2000),
          message: trimmedMsg,
          openedByPartner: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `coupleSpaces/${confirmedSpaceId}/songDedications/${did}`
        );
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const markDedicationOpened = useCallback(
    async (dedicationId: string) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      try {
        await updateDoc(
          doc(db, 'coupleSpaces', confirmedSpaceId, 'songDedications', dedicationId),
          {
            openedByPartner: true,
            updatedAt: serverTimestamp(),
          }
        );
      } catch {
        // Ignore if sender opens their own dedication
      }
    },
    [confirmedSpaceId]
  );

  const deleteSongDedication = useCallback(
    async (dedicationId: string) => {
      if (!confirmedSpaceId) return;
      try {
        await deleteDoc(
          doc(db, 'coupleSpaces', confirmedSpaceId, 'songDedications', dedicationId)
        );
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.DELETE,
          `coupleSpaces/${confirmedSpaceId}/songDedications/${dedicationId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const addSongStory = useCallback(
    async (input: {
      songTitle: string;
      artist: string;
      dateLabel: string;
      story: string;
      photoFile?: File;
    }) => {
      if (!auth.currentUser || !confirmedSpaceId) {
        throw new Error('Hubungkan Couple Space untuk menyimpan Song Story.');
      }
      const storyId = `sstory_${Date.now()}`;
      let imageUrl = '';
      let storagePath = '';

      if (input.photoFile) {
        const compressed = await compressImageFile(input.photoFile, 1200, 0.82);
        storagePath = `coupleSpaces/${confirmedSpaceId}/songStories/${storyId}.jpg`;
        const sRef = ref(storage, storagePath);
        await uploadBytes(sRef, compressed, { contentType: 'image/jpeg' });
        imageUrl = await getDownloadURL(sRef);
      }

      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songStories', storyId), {
          coupleSpaceId: confirmedSpaceId,
          songTitle: input.songTitle.trim().slice(0, 180),
          artist: input.artist.trim().slice(0, 140),
          dateLabel: input.dateLabel.trim().slice(0, 60) || 'Kenangan Kita',
          story: input.story.trim().slice(0, 1200),
          ...(imageUrl ? { imageUrl: imageUrl.slice(0, 2000), storagePath } : {}),
          uploaderUid: auth.currentUser.uid,
          uploaderName: myRoleName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `coupleSpaces/${confirmedSpaceId}/songStories/${storyId}`
        );
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const deleteSongStory = useCallback(
    async (story: SongStory) => {
      if (!confirmedSpaceId) return;
      if (story.storagePath) {
        try {
          await deleteObject(ref(storage, story.storagePath));
        } catch {
          // Ignore storage error
        }
      }
      try {
        await deleteDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'songStories', story.id));
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.DELETE,
          `coupleSpaces/${confirmedSpaceId}/songStories/${story.id}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const recordMusicPlay = useCallback(
    async (song: SongItem) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const hid = `mhist_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'musicHistory', hid), {
          coupleSpaceId: confirmedSpaceId,
          songId: (song.id || song.youtubeId).slice(0, 64),
          songTitle: song.title.slice(0, 180),
          artist: song.artist.slice(0, 140),
          sourceType: song.sourceType === 'youtube' ? 'youtube' : 'audio',
          playedByUid: auth.currentUser.uid,
          playedByName: myRoleName,
          createdAt: serverTimestamp(),
        });
      } catch {
        // Ignore history logging failure quietly
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const updateSharedCandle = useCallback(
    async (lit: boolean, wish: string) => {
      if (!confirmedSpaceId) return;
      try {
        await updateDoc(doc(db, 'coupleSpaces', confirmedSpaceId), {
          candleLit: lit,
          candleWish: wish.slice(0, 300),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `coupleSpaces/${confirmedSpaceId}`);
      }
    },
    [confirmedSpaceId]
  );

  const markSharedAnniversaryOpened = useCallback(async () => {
    if (!confirmedSpaceId) return;
    try {
      await updateDoc(doc(db, 'coupleSpaces', confirmedSpaceId), {
        anniversaryOpened: true,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `coupleSpaces/${confirmedSpaceId}`);
    }
  }, [confirmedSpaceId]);

  const addSpacePromise = useCallback(
    async (text: string) => {
      if (!auth.currentUser || !confirmedSpaceId) throw new Error('Belum terhubung.');
      const pid = `sprm_${Date.now()}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'promises', pid), {
          authorName: myRoleName,
          text: text.trim().slice(0, 500),
          isPublic: true,
          ownerUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `coupleSpaces/${confirmedSpaceId}/promises/${pid}`);
      }
    },
    [confirmedSpaceId, myRoleName]
  );

  const removeSpacePromise = useCallback(
    async (promiseId: string) => {
      if (!confirmedSpaceId) return;
      try {
        await deleteDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'promises', promiseId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `coupleSpaces/${confirmedSpaceId}/promises/${promiseId}`);
      }
    },
    [confirmedSpaceId]
  );

  const addSpaceTimelineItem = useCallback(
    async (input: { title: string; dateLabel: string; description: string; imageUrl?: string }) => {
      if (!auth.currentUser || !confirmedSpaceId) throw new Error('Belum terhubung.');
      const tid = `stl_${Date.now()}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'timeline', tid), {
          title: input.title.trim().slice(0, 160),
          dateLabel: input.dateLabel.trim().slice(0, 80),
          description: input.description.trim().slice(0, 1500),
          ...(input.imageUrl ? { imageUrl: input.imageUrl.trim().slice(0, 2000) } : {}),
          sortOrder: spaceTimeline.length + 10,
          isPublic: true,
          ownerUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `coupleSpaces/${confirmedSpaceId}/timeline/${tid}`);
      }
    },
    [confirmedSpaceId, spaceTimeline.length]
  );

  const updateSharedGame = useCallback(
    async (gameType: SharedGameType, payload: Record<string, unknown>) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'games', gameType), {
          gameType,
          payload,
          updatedByUid: auth.currentUser.uid,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `coupleSpaces/${confirmedSpaceId}/games/${gameType}`);
      }
    },
    [confirmedSpaceId]
  );

  // Real-time 10-Game Multiplayer Room Lifecycle & Atomic Transactions
  const createGameRoom = useCallback(
    async (
      gameType: MultiplayerGameType,
      initialGameState: Record<string, unknown>,
      initialTurnMode: 'player1' | 'both' = 'player1'
    ): Promise<string> => {
      if (!auth.currentUser || !confirmedSpaceId || !coupleSpace || !isPaired) {
        throw new Error('Hubungkan akun Zikri & Diann terlebih dahulu di Our Connection.');
      }
      const myUid = auth.currentUser.uid;
      const partnerUid =
        coupleSpace.member1Uid === myUid ? coupleSpace.member2Uid : coupleSpace.member1Uid;
      const myDisplay = myRoleName;
      const partnerDisplay = partnerName;

      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      try {
        await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId), {
          roomId,
          coupleSpaceId: confirmedSpaceId,
          player1Id: myUid,
          player1Name: myDisplay,
          player2Id: partnerUid,
          player2Name: partnerDisplay,
          invitedByUid: myUid,
          gameType,
          status: 'invited',
          player1Ready: true,
          player2Ready: false,
          currentTurn: initialTurnMode === 'both' ? 'both' : myUid,
          turnNumber: 0,
          gameState: initialGameState,
          score: { player1: 0, player2: 0 },
          winnerId: '',
          rematchVotes: { player1: false, player2: false },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return roomId;
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId, coupleSpace, isPaired, myRoleName, partnerName]
  );

  const acceptGameInvite = useCallback(
    async (roomId: string) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const roomRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists()) return;
          const data = snap.data();
          if (data.status === 'invited') {
            tx.update(roomRef, {
              status: 'lobby',
              player1Ready: Boolean(data.player1Ready),
              player2Ready: Boolean(data.player2Ready),
              updatedAt: serverTimestamp(),
            });
          }
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const declineGameInvite = useCallback(
    async (roomId: string) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const roomRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists()) return;
          const data = snap.data();
          tx.update(roomRef, {
            status: 'closed',
            winnerId: String(data.winnerId || ''),
            score: data.score || { player1: 0, player2: 0 },
            gameState: data.gameState || {},
            updatedAt: serverTimestamp(),
          });
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const toggleRoomReady = useCallback(
    async (roomId: string) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const myUid = auth.currentUser.uid;
      const roomRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists()) return;
          const data = snap.data();
          if (data.status !== 'invited' && data.status !== 'lobby') return;
          const isP1 = data.player1Id === myUid;
          const nextP1Ready = isP1 ? !data.player1Ready : Boolean(data.player1Ready);
          const nextP2Ready = !isP1 ? !data.player2Ready : Boolean(data.player2Ready);
          const nextStatus = nextP1Ready && nextP2Ready ? 'playing' : 'lobby';
          tx.update(roomRef, {
            player1Ready: nextP1Ready,
            player2Ready: nextP2Ready,
            status: nextStatus,
            updatedAt: serverTimestamp(),
          });
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const runRoomTransaction = useCallback(
    async (
      roomId: string,
      mutator: (room: GameRoom, myUid: string) => {
        gameState: Record<string, unknown>;
        currentTurn: string;
        turnNumber: number;
        score: { player1: number; player2: number };
        winnerId: string;
        status: 'playing' | 'finished';
        historyTitle?: string;
      } | null
    ) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const myUid = auth.currentUser.uid;
      const roomRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId);
      try {
        const finishedHistoryPayload = await runTransaction(db, async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists()) return null;
          const d = snap.data();
          const roomObj: GameRoom = {
            roomId: String(d.roomId || roomId),
            coupleSpaceId: String(d.coupleSpaceId || confirmedSpaceId),
            player1Id: String(d.player1Id || ''),
            player1Name: String(d.player1Name || 'Zikri'),
            player2Id: String(d.player2Id || ''),
            player2Name: String(d.player2Name || 'Diann'),
            invitedByUid: String(d.invitedByUid || ''),
            gameType: d.gameType as MultiplayerGameType,
            status: d.status as GameRoom['status'],
            player1Ready: Boolean(d.player1Ready),
            player2Ready: Boolean(d.player2Ready),
            currentTurn: String(d.currentTurn || ''),
            turnNumber: Number(d.turnNumber || 0),
            gameState: (d.gameState as Record<string, unknown>) || {},
            score: {
              player1: Number((d.score as { player1?: number })?.player1 || 0),
              player2: Number((d.score as { player2?: number })?.player2 || 0),
            },
            winnerId: String(d.winnerId || ''),
            rematchVotes: {
              player1: Boolean((d.rematchVotes as { player1?: boolean })?.player1),
              player2: Boolean((d.rematchVotes as { player2?: boolean })?.player2),
            },
            createdAtMs: timestampToMs(d.createdAt),
            updatedAtMs: timestampToMs(d.updatedAt),
          };

          if (roomObj.status !== 'playing') return null;
          const result = mutator(roomObj, myUid);
          if (!result) return null;

          tx.update(roomRef, {
            gameState: result.gameState,
            currentTurn: result.currentTurn,
            turnNumber: roomObj.turnNumber + 1,
            score: result.score,
            winnerId: result.winnerId,
            status: result.status,
            updatedAt: serverTimestamp(),
          });

          if (result.status === 'finished' && result.winnerId) {
            const winName =
              result.winnerId === 'draw'
                ? 'Seri Berdua'
                : result.winnerId === roomObj.player1Id
                ? roomObj.player1Name
                : roomObj.player2Name;
            return {
              gameType: roomObj.gameType,
              gameTitle: result.historyTitle || roomObj.gameType,
              player1Id: roomObj.player1Id,
              player1Name: roomObj.player1Name,
              player2Id: roomObj.player2Id,
              player2Name: roomObj.player2Name,
              score: result.score,
              winnerId: result.winnerId,
              winnerName: winName,
            };
          }
          return null;
        });

        if (finishedHistoryPayload) {
          const histId = `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await setDoc(doc(db, 'coupleSpaces', confirmedSpaceId, 'gameHistory', histId), {
            roomId,
            coupleSpaceId: confirmedSpaceId,
            ...finishedHistoryPayload,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const voteRematchRoom = useCallback(
    async (
      roomId: string,
      resetGameStateFactory: (room: GameRoom) => {
        gameState: Record<string, unknown>;
        currentTurn: string;
      }
    ) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const myUid = auth.currentUser.uid;
      const roomRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists()) return;
          const d = snap.data();
          if (d.status !== 'finished') return;
          const isP1 = d.player1Id === myUid;
          const curVotes = (d.rematchVotes || {}) as { player1?: boolean; player2?: boolean };
          const nextV1 = isP1 ? true : Boolean(curVotes.player1);
          const nextV2 = !isP1 ? true : Boolean(curVotes.player2);

          if (nextV1 && nextV2) {
            const roomObj: GameRoom = {
              roomId: String(d.roomId || roomId),
              coupleSpaceId: String(d.coupleSpaceId || confirmedSpaceId),
              player1Id: String(d.player1Id || ''),
              player1Name: String(d.player1Name || 'Zikri'),
              player2Id: String(d.player2Id || ''),
              player2Name: String(d.player2Name || 'Diann'),
              invitedByUid: String(d.invitedByUid || ''),
              gameType: d.gameType as MultiplayerGameType,
              status: d.status as GameRoom['status'],
              player1Ready: true,
              player2Ready: true,
              currentTurn: String(d.currentTurn || ''),
              turnNumber: Number(d.turnNumber || 0),
              gameState: (d.gameState as Record<string, unknown>) || {},
              score: {
                player1: Number((d.score as { player1?: number })?.player1 || 0),
                player2: Number((d.score as { player2?: number })?.player2 || 0),
              },
              winnerId: String(d.winnerId || ''),
              rematchVotes: { player1: false, player2: false },
              createdAtMs: timestampToMs(d.createdAt),
              updatedAtMs: timestampToMs(d.updatedAt),
            };
            const nextReset = resetGameStateFactory(roomObj);
            tx.update(roomRef, {
              rematchVotes: { player1: false, player2: false },
              status: 'playing',
              player1Ready: true,
              player2Ready: true,
              currentTurn: nextReset.currentTurn,
              turnNumber: 0,
              gameState: nextReset.gameState,
              score: roomObj.score,
              winnerId: '',
              updatedAt: serverTimestamp(),
            });
          } else {
            tx.update(roomRef, {
              rematchVotes: { player1: nextV1, player2: nextV2 },
              updatedAt: serverTimestamp(),
            });
          }
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const closeGameRoom = useCallback(
    async (roomId: string) => {
      if (!auth.currentUser || !confirmedSpaceId) return;
      const roomRef = doc(db, 'coupleSpaces', confirmedSpaceId, 'gameRooms', roomId);
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(roomRef);
          if (!snap.exists()) return;
          const d = snap.data();
          tx.update(roomRef, {
            status: 'closed',
            winnerId: String(d.winnerId || ''),
            score: d.score || { player1: 0, player2: 0 },
            gameState: d.gameState || {},
            updatedAt: serverTimestamp(),
          });
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.UPDATE,
          `coupleSpaces/${confirmedSpaceId}/gameRooms/${roomId}`
        );
      }
    },
    [confirmedSpaceId]
  );

  const incomingGameInvites = useMemo(() => {
    if (!user) return [];
    return gameRooms.filter(
      (r) => r.status === 'invited' && r.invitedByUid !== user.uid
    );
  }, [gameRooms, user]);

  const activeGameRooms = useMemo(() => {
    return gameRooms.filter((r) => r.status !== 'closed');
  }, [gameRooms]);

  const unreadDedications = useMemo(() => {
    if (!user) return [];
    return songDedications.filter(
      (d) => d.senderUid !== user.uid && !d.openedByPartner
    );
  }, [songDedications, user]);

  const value: CoupleContextValue = {
    firebaseReady,
    profile,
    coupleSpace,
    isPaired,
    myRoleName,
    partnerName,
    partnerPresence,
    myPresence,
    shareActivePage,
    setShareActivePage: updateSharePagePref,
    unreadChatCount,
    chatMessages,
    spaceMemories,
    spaceSongs,
    spacePromises,
    spaceTimeline,
    sharedGames,
    gameRooms,
    gameHistory,
    incomingGameInvites,
    activeGameRooms,
    spacePlaylists,
    radioSync,
    songDedications,
    unreadDedications,
    songStories,
    musicHistory,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logoutCoupleAccount,
    createCoupleSpace,
    joinCoupleSpace,
    regenerateInviteCode,
    leaveCoupleSpace,
    sendChatMessage,
    markPartnerMessagesRead,
    uploadSpaceMemory,
    deleteSpaceMemory,
    subscribeMemoryComments,
    addMemoryComment,
    addSpaceSong,
    removeSpaceSong,
    toggleSongFavorite,
    toggleSongSpecial,
    moveSongOrder,
    createSpacePlaylist,
    deleteSpacePlaylist,
    syncSharedSongState,
    updateRadioSync,
    joinListeningTogether,
    leaveListeningTogether,
    sendSongDedication,
    markDedicationOpened,
    deleteSongDedication,
    addSongStory,
    deleteSongStory,
    recordMusicPlay,
    updateSharedCandle,
    markSharedAnniversaryOpened,
    addSpacePromise,
    removeSpacePromise,
    addSpaceTimelineItem,
    updateSharedGame,
    createGameRoom,
    acceptGameInvite,
    declineGameInvite,
    toggleRoomReady,
    runRoomTransaction,
    voteRematchRoom,
    closeGameRoom,
  };

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
};

export function useCouple(): CoupleContextValue {
  const ctx = useContext(CoupleContext);
  if (!ctx) throw new Error('useCouple must be used inside CoupleProvider');
  return ctx;
}
