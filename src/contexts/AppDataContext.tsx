import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  ADMIN_EMAIL,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  storage,
} from '../lib/firebase';
import { blobToDataUrl, compressImageFile, idbGet, idbSet } from '../lib/indexedDb';
import { extractYouTubeId, sha256Hex } from '../lib/time';
import {
  DEFAULT_MEMORIES,
  DEFAULT_PROMISES,
  DEFAULT_SECRET_CODE,
  DEFAULT_SITE_CONFIG,
  DEFAULT_SONGS,
  DEFAULT_TIMELINE,
} from '../data/seedCore';
import { SEED_LOVE_LETTERS, SEED_LOVE_QUIZ } from '../data/quizAndLettersData';
import { SEED_TRUTH_OR_DARE } from '../data/truthOrDareData';
import {
  LoveLetterItem,
  MemoryCategory,
  MemoryItem,
  OperationType,
  PromiseItem,
  QuizQuestion,
  SiteConfig,
  SongItem,
  TimelineItem,
  TruthOrDareItem,
} from '../types';

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AppDataContextValue {
  user: User | null;
  isAdmin: boolean;
  authLoading: boolean;
  authError: string | null;
  signInAdmin: () => Promise<void>;
  signOutUser: () => Promise<void>;

  siteConfig: SiteConfig;
  memories: MemoryItem[];
  timeline: TimelineItem[];
  songs: SongItem[];
  truthOrDareList: TruthOrDareItem[];
  quizQuestions: QuizQuestion[];
  loveLetters: LoveLetterItem[];
  promises: PromiseItem[];

  // Music shared state
  currentSongIndex: number;
  setCurrentSongIndex: (index: number) => void;
  playerStatus: PlayerStatus;
  setPlayerStatus: (status: PlayerStatus) => void;
  playerErrorMsg: string | null;
  setPlayerErrorMsg: (msg: string | null) => void;

  // CRUD actions
  updateSiteConfig: (updates: Partial<SiteConfig> & { newSecretCode?: string }) => Promise<void>;
  addMemory: (input: {
    file?: File;
    imageUrl?: string;
    caption: string;
    dateLabel: string;
    category: MemoryCategory;
  }) => Promise<{ syncedToCloud: boolean }>;
  removeMemory: (item: MemoryItem) => Promise<void>;
  saveTimelineItem: (item: Omit<TimelineItem, 'isPublic' | 'ownerUid'>) => Promise<void>;
  removeTimelineItem: (id: string) => Promise<void>;
  addSong: (input: {
    title: string;
    artist: string;
    youtubeUrl?: string;
    audioUrl?: string;
    artworkUrl?: string;
  }) => Promise<{ syncedToCloud: boolean }>;
  removeSong: (id: string) => Promise<void>;
  addTruthOrDare: (item: Omit<TruthOrDareItem, 'id' | 'isPublic' | 'ownerUid'>) => Promise<void>;
  saveQuizQuestion: (item: Omit<QuizQuestion, 'isPublic' | 'ownerUid'>) => Promise<void>;
  removeQuizQuestion: (id: string) => Promise<void>;
  addLoveLetter: (item: Omit<LoveLetterItem, 'id' | 'isPublic' | 'ownerUid'>) => Promise<void>;
  removeLoveLetter: (id: string) => Promise<void>;
  addPromise: (authorName: string, text: string) => Promise<{ syncedToCloud: boolean }>;
  removePromise: (item: PromiseItem) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

const IDB_LOCAL_MEMORIES_KEY = 'local_memories_v1';
const IDB_LOCAL_SONGS_KEY = 'local_songs_v1';
const IDB_LOCAL_PROMISES_KEY = 'local_promises_v1';

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [defaultHash, setDefaultHash] = useState('');
  const [cloudSiteConfig, setCloudSiteConfig] = useState<SiteConfig | null>(null);

  const [cloudMemories, setCloudMemories] = useState<MemoryItem[] | null>(null);
  const [localMemories, setLocalMemories] = useState<MemoryItem[]>([]);

  const [cloudTimeline, setCloudTimeline] = useState<TimelineItem[] | null>(null);
  const [cloudSongs, setCloudSongs] = useState<SongItem[] | null>(null);
  const [localSongs, setLocalSongs] = useState<SongItem[]>([]);

  const [cloudTod, setCloudTod] = useState<TruthOrDareItem[]>([]);
  const [cloudQuiz, setCloudQuiz] = useState<QuizQuestion[] | null>(null);
  const [cloudLetters, setCloudLetters] = useState<LoveLetterItem[]>([]);
  const [cloudPromises, setCloudPromises] = useState<PromiseItem[] | null>(null);
  const [localPromises, setLocalPromises] = useState<PromiseItem[]>([]);

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('idle');
  const [playerErrorMsg, setPlayerErrorMsg] = useState<string | null>(null);

  // Compute default SHA-256 hash once
  useEffect(() => {
    void sha256Hex(DEFAULT_SECRET_CODE).then(setDefaultHash);
  }, []);

  // Load IndexedDB local caches
  useEffect(() => {
    void (async () => {
      const [mems, sngs, prms] = await Promise.all([
        idbGet<MemoryItem[]>(IDB_LOCAL_MEMORIES_KEY),
        idbGet<SongItem[]>(IDB_LOCAL_SONGS_KEY),
        idbGet<PromiseItem[]>(IDB_LOCAL_PROMISES_KEY),
      ]);
      if (mems) setLocalMemories(mems);
      if (sngs) setLocalSongs(sngs);
      if (prms) setLocalPromises(prms);
    })();
  }, []);

  // Auth listener & Admin verification
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser || !currentUser.emailVerified) {
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }
      if (currentUser.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        setAuthLoading(false);
        return;
      }
      try {
        const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // Firestore public listeners
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, 'siteConfig', 'main'),
      (snap) => {
        if (snap.exists()) {
          setCloudSiteConfig(snap.data() as SiteConfig);
        }
      },
      (err) => {
        console.warn('SiteConfig listener fallback:', err.message);
      }
    );

    const qMemories = query(collection(db, 'memories'), where('isPublic', '==', true));
    const unsubMemories = onSnapshot(
      qMemories,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MemoryItem, 'id'>) }));
        setCloudMemories(list);
      },
      (err) => console.warn('Memories listener fallback:', err.message)
    );

    const qTimeline = query(collection(db, 'timeline'), where('isPublic', '==', true));
    const unsubTimeline = onSnapshot(
      qTimeline,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<TimelineItem, 'id'>) }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setCloudTimeline(list);
      },
      (err) => console.warn('Timeline listener fallback:', err.message)
    );

    const qSongs = query(collection(db, 'songs'), where('isPublic', '==', true));
    const unsubSongs = onSnapshot(
      qSongs,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<SongItem, 'id'>) }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setCloudSongs(list);
      },
      (err) => console.warn('Songs listener fallback:', err.message)
    );

    const qTod = query(collection(db, 'truthOrDare'), where('isPublic', '==', true));
    const unsubTod = onSnapshot(
      qTod,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TruthOrDareItem, 'id'>) }));
        setCloudTod(list);
      },
      (err) => console.warn('TruthOrDare listener fallback:', err.message)
    );

    const qQuiz = query(collection(db, 'quizQuestions'), where('isPublic', '==', true));
    const unsubQuiz = onSnapshot(
      qQuiz,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<QuizQuestion, 'id'>) }))
          .sort((a, b) => a.sortOrder - b.sortOrder);
        setCloudQuiz(list);
      },
      (err) => console.warn('Quiz listener fallback:', err.message)
    );

    const qLetters = query(collection(db, 'loveLetters'), where('isPublic', '==', true));
    const unsubLetters = onSnapshot(
      qLetters,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LoveLetterItem, 'id'>) }));
        setCloudLetters(list);
      },
      (err) => console.warn('Letters listener fallback:', err.message)
    );

    const qPromises = query(collection(db, 'promises'), where('isPublic', '==', true));
    const unsubPromises = onSnapshot(
      qPromises,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PromiseItem, 'id'>) }));
        setCloudPromises(list);
      },
      (err) => console.warn('Promises listener fallback:', err.message)
    );

    return () => {
      unsubConfig();
      unsubMemories();
      unsubTimeline();
      unsubSongs();
      unsubTod();
      unsubQuiz();
      unsubLetters();
      unsubPromises();
    };
  }, []);

  const signInAdmin = useCallback(async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedUser = result.user;
      if (!signedUser.emailVerified) {
        await firebaseSignOut(auth);
        setAuthError('Email akun Google belum terverifikasi.');
        return;
      }
      if (signedUser.email !== ADMIN_EMAIL) {
        const snap = await getDoc(doc(db, 'admins', signedUser.uid));
        if (!snap.exists()) {
          setAuthError(`Akun ${signedUser.email} tidak memiliki akses Admin Mode.`);
          await firebaseSignOut(auth);
          return;
        }
      }
      setIsAdmin(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await firebaseSignOut(auth);
    setIsAdmin(false);
  }, []);

  const siteConfig: SiteConfig = useMemo(() => {
    const base = {
      ...DEFAULT_SITE_CONFIG,
      secretCodeHash: DEFAULT_SITE_CONFIG.secretCodeHash || defaultHash,
    };
    return cloudSiteConfig ? { ...base, ...cloudSiteConfig } : base;
  }, [cloudSiteConfig, defaultHash]);

  const memories: MemoryItem[] = useMemo(() => {
    const cloudList = cloudMemories && cloudMemories.length > 0 ? cloudMemories : DEFAULT_MEMORIES;
    const merged = [...localMemories, ...cloudList];
    const seen = new Set<string>();
    return merged.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [cloudMemories, localMemories]);

  const timeline: TimelineItem[] = useMemo(() => {
    if (cloudTimeline && cloudTimeline.length > 0) return cloudTimeline;
    return DEFAULT_TIMELINE;
  }, [cloudTimeline]);

  const songs: SongItem[] = useMemo(() => {
    const cloudList = cloudSongs && cloudSongs.length > 0 ? cloudSongs : DEFAULT_SONGS;
    const merged = [...cloudList, ...localSongs];
    const seen = new Set<string>();
    return merged.filter((s) => {
      if (seen.has(s.youtubeId)) return false;
      seen.add(s.youtubeId);
      return true;
    });
  }, [cloudSongs, localSongs]);

  const truthOrDareList: TruthOrDareItem[] = useMemo(() => {
    return [...cloudTod, ...SEED_TRUTH_OR_DARE];
  }, [cloudTod]);

  const quizQuestions: QuizQuestion[] = useMemo(() => {
    if (cloudQuiz && cloudQuiz.length > 0) {
      const merged = [...cloudQuiz];
      const existingIds = new Set(cloudQuiz.map((q) => q.id));
      SEED_LOVE_QUIZ.forEach((sq) => {
        if (!existingIds.has(sq.id)) merged.push(sq);
      });
      return merged.sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return SEED_LOVE_QUIZ;
  }, [cloudQuiz]);

  const loveLetters: LoveLetterItem[] = useMemo(() => {
    return [...cloudLetters, ...SEED_LOVE_LETTERS];
  }, [cloudLetters]);

  const promises: PromiseItem[] = useMemo(() => {
    const cloudList = cloudPromises && cloudPromises.length > 0 ? cloudPromises : DEFAULT_PROMISES;
    return [...localPromises, ...cloudList];
  }, [cloudPromises, localPromises]);

  // CRUD implementations
  const updateSiteConfig = useCallback(
    async (updates: Partial<SiteConfig> & { newSecretCode?: string }) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Hanya admin yang dapat mengubah pengaturan.');
      const nextHash = updates.newSecretCode?.trim()
        ? await sha256Hex(updates.newSecretCode)
        : siteConfig.secretCodeHash || (await sha256Hex(DEFAULT_SECRET_CODE));

      const path = 'siteConfig/main';
      try {
        const existingSnap = await getDoc(doc(db, 'siteConfig', 'main'));
        const payload = {
          coupleNames: (updates.coupleNames ?? siteConfig.coupleNames).slice(0, 100),
          heroGreeting: (updates.heroGreeting ?? siteConfig.heroGreeting).slice(0, 300),
          couplePhotoUrl: (updates.couplePhotoUrl ?? siteConfig.couplePhotoUrl).slice(0, 1500),
          finalLetter: (updates.finalLetter ?? siteConfig.finalLetter).slice(0, 8000),
          secretHint: (updates.secretHint ?? siteConfig.secretHint).slice(0, 500),
          secretCodeHash: nextHash,
          secretMessage: (updates.secretMessage ?? siteConfig.secretMessage).slice(0, 5000),
          ownerUid: existingSnap.exists()
            ? (existingSnap.data().ownerUid as string)
            : auth.currentUser.uid,
          createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, 'siteConfig', 'main'), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    [isAdmin, siteConfig]
  );

  const addMemory = useCallback(
    async (input: {
      file?: File;
      imageUrl?: string;
      caption: string;
      dateLabel: string;
      category: MemoryCategory;
    }): Promise<{ syncedToCloud: boolean }> => {
      const id = `mem-${Date.now()}`;
      let finalUrl = input.imageUrl?.trim() || '';
      let storagePath: string | undefined;

      if (input.file) {
        const compressed = await compressImageFile(input.file, 1200, 0.8);
        if (auth.currentUser && isAdmin) {
          try {
            const path = `memories/${id}.jpg`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, compressed, { contentType: 'image/jpeg' });
            finalUrl = await getDownloadURL(storageRef);
            storagePath = path;
          } catch {
            // Fallback to IndexedDB data URL if Storage bucket rules aren't configured
            finalUrl = await blobToDataUrl(compressed);
          }
        } else {
          finalUrl = await blobToDataUrl(compressed);
        }
      }

      if (!finalUrl) throw new Error('Pilih foto atau masukkan URL gambar.');

      const canSyncCloud = Boolean(auth.currentUser && isAdmin && !finalUrl.startsWith('data:'));
      if (canSyncCloud && auth.currentUser) {
        const path = `memories/${id}`;
        try {
          await setDoc(doc(db, 'memories', id), {
            caption: input.caption.trim().slice(0, 500),
            dateLabel: input.dateLabel.trim().slice(0, 60) || 'Kenangan Kita',
            category: input.category,
            imageUrl: finalUrl.slice(0, 2000),
            ...(storagePath ? { storagePath } : {}),
            isPublic: true,
            ownerUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return { syncedToCloud: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      const localItem: MemoryItem = {
        id,
        caption: input.caption.trim().slice(0, 500),
        dateLabel: input.dateLabel.trim().slice(0, 60) || 'Kenangan Kita',
        category: input.category,
        imageUrl: finalUrl,
        isPublic: true,
        isLocalOnly: true,
      };
      const nextLocal = [localItem, ...localMemories];
      setLocalMemories(nextLocal);
      await idbSet(IDB_LOCAL_MEMORIES_KEY, nextLocal);
      return { syncedToCloud: false };
    },
    [isAdmin, localMemories]
  );

  const removeMemory = useCallback(
    async (item: MemoryItem) => {
      if (item.isLocalOnly || localMemories.some((m) => m.id === item.id)) {
        const nextLocal = localMemories.filter((m) => m.id !== item.id);
        setLocalMemories(nextLocal);
        await idbSet(IDB_LOCAL_MEMORIES_KEY, nextLocal);
        return;
      }
      if (!auth.currentUser || !isAdmin) {
        throw new Error('Login sebagai Admin di Admin Mode untuk menghapus foto cloud.');
      }
      if (item.storagePath) {
        try {
          await deleteObject(ref(storage, item.storagePath));
        } catch {
          // Continue deleting metadata
        }
      }
      try {
        await deleteDoc(doc(db, 'memories', item.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `memories/${item.id}`);
      }
    },
    [isAdmin, localMemories]
  );

  const saveTimelineItem = useCallback(
    async (item: Omit<TimelineItem, 'isPublic' | 'ownerUid'>) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      const path = `timeline/${item.id}`;
      try {
        const existingSnap = await getDoc(doc(db, 'timeline', item.id));
        await setDoc(doc(db, 'timeline', item.id), {
          title: item.title.trim().slice(0, 160),
          dateLabel: item.dateLabel.trim().slice(0, 80),
          description: item.description.trim().slice(0, 1500),
          ...(item.imageUrl ? { imageUrl: item.imageUrl.trim().slice(0, 2000) } : {}),
          sortOrder: item.sortOrder,
          isPublic: true,
          ownerUid: existingSnap.exists() ? existingSnap.data().ownerUid : auth.currentUser.uid,
          createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    },
    [isAdmin]
  );

  const removeTimelineItem = useCallback(
    async (id: string) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      try {
        await deleteDoc(doc(db, 'timeline', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `timeline/${id}`);
      }
    },
    [isAdmin]
  );

  const addSong = useCallback(
    async (input: {
      title: string;
      artist: string;
      youtubeUrl?: string;
      audioUrl?: string;
      artworkUrl?: string;
    }): Promise<{ syncedToCloud: boolean }> => {
      const id = `song-${Date.now()}`;
      const audioUrl = input.audioUrl?.trim() || '';
      const youtubeId = input.youtubeUrl ? extractYouTubeId(input.youtubeUrl) || '' : '';

      if (!audioUrl && !youtubeId) {
        throw new Error('Masukkan URL YouTube atau URL Audio yang valid.');
      }

      const finalYtId = youtubeId || id;
      const finalYtUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : '';
      const artworkUrl =
        input.artworkUrl?.trim() ||
        (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '');

      if (auth.currentUser && isAdmin && youtubeId) {
        const path = `songs/${id}`;
        try {
          await setDoc(doc(db, 'songs', id), {
            title: input.title.trim().slice(0, 180) || 'Lagu Romantis',
            artist: input.artist.trim().slice(0, 140) || 'Pilihan Kita',
            youtubeUrl: finalYtUrl,
            youtubeId: finalYtId,
            sortOrder: songs.length + 1,
            isPublic: true,
            ownerUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return { syncedToCloud: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      const localSong: SongItem = {
        id,
        title: input.title.trim().slice(0, 180) || 'Lagu Pilihan',
        artist: input.artist.trim().slice(0, 140) || 'Musik',
        youtubeUrl: finalYtUrl,
        youtubeId: finalYtId,
        audioUrl: audioUrl || undefined,
        artworkUrl: artworkUrl || undefined,
        sourceType: audioUrl ? 'audio' : 'youtube',
        sortOrder: songs.length + 1,
        isPublic: true,
      };
      const nextLocal = [...localSongs, localSong];
      setLocalSongs(nextLocal);
      await idbSet(IDB_LOCAL_SONGS_KEY, nextLocal);
      return { syncedToCloud: false };
    },
    [isAdmin, localSongs, songs.length]
  );

  const removeSong = useCallback(
    async (id: string) => {
      if (localSongs.some((s) => s.id === id)) {
        const nextLocal = localSongs.filter((s) => s.id !== id);
        setLocalSongs(nextLocal);
        await idbSet(IDB_LOCAL_SONGS_KEY, nextLocal);
        return;
      }
      if (!auth.currentUser || !isAdmin) throw new Error('Login Admin untuk menghapus lagu cloud.');
      try {
        await deleteDoc(doc(db, 'songs', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `songs/${id}`);
      }
    },
    [isAdmin, localSongs]
  );

  const addTruthOrDare = useCallback(
    async (item: Omit<TruthOrDareItem, 'id' | 'isPublic' | 'ownerUid'>) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      const id = `tod-${Date.now()}`;
      try {
        await setDoc(doc(db, 'truthOrDare', id), {
          kind: item.kind,
          category: item.category,
          prompt: item.prompt.trim().slice(0, 600),
          isPublic: true,
          ownerUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `truthOrDare/${id}`);
      }
    },
    [isAdmin]
  );

  const saveQuizQuestion = useCallback(
    async (item: Omit<QuizQuestion, 'isPublic' | 'ownerUid'>) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      const id = item.id || `quiz-${Date.now()}`;
      try {
        const existingSnap = await getDoc(doc(db, 'quizQuestions', id));
        await setDoc(doc(db, 'quizQuestions', id), {
          question: item.question.trim().slice(0, 400),
          options: item.options.slice(0, 4).map((o) => o.trim().slice(0, 200)),
          correctIndex: item.correctIndex,
          explanation: item.explanation.trim().slice(0, 500),
          sortOrder: item.sortOrder,
          isPublic: true,
          ownerUid: existingSnap.exists() ? existingSnap.data().ownerUid : auth.currentUser.uid,
          createdAt: existingSnap.exists() ? existingSnap.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `quizQuestions/${id}`);
      }
    },
    [isAdmin]
  );

  const removeQuizQuestion = useCallback(
    async (id: string) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      try {
        await deleteDoc(doc(db, 'quizQuestions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `quizQuestions/${id}`);
      }
    },
    [isAdmin]
  );

  const addLoveLetter = useCallback(
    async (item: Omit<LoveLetterItem, 'id' | 'isPublic' | 'ownerUid'>) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      const id = `letter-${Date.now()}`;
      try {
        await setDoc(doc(db, 'loveLetters', id), {
          title: item.title.trim().slice(0, 160),
          body: item.body.trim().slice(0, 3000),
          author: item.author.trim().slice(0, 80) || 'Zikri untuk Diann',
          isPublic: true,
          ownerUid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `loveLetters/${id}`);
      }
    },
    [isAdmin]
  );

  const removeLoveLetter = useCallback(
    async (id: string) => {
      if (!auth.currentUser || !isAdmin) throw new Error('Akses khusus Admin.');
      try {
        await deleteDoc(doc(db, 'loveLetters', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `loveLetters/${id}`);
      }
    },
    [isAdmin]
  );

  const addPromise = useCallback(
    async (authorName: string, text: string): Promise<{ syncedToCloud: boolean }> => {
      const id = `promise-${Date.now()}`;
      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await setDoc(doc(db, 'promises', id), {
            authorName: authorName.trim().slice(0, 60) || 'Zikri & Diann',
            text: text.trim().slice(0, 500),
            isPublic: true,
            ownerUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          return { syncedToCloud: true };
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `promises/${id}`);
        }
      }
      const localItem: PromiseItem = {
        id,
        authorName: authorName.trim().slice(0, 60) || 'Zikri & Diann',
        text: text.trim().slice(0, 500),
        isPublic: true,
        isLocalOnly: true,
      };
      const next = [localItem, ...localPromises];
      setLocalPromises(next);
      await idbSet(IDB_LOCAL_PROMISES_KEY, next);
      return { syncedToCloud: false };
    },
    [localPromises]
  );

  const removePromise = useCallback(
    async (item: PromiseItem) => {
      if (item.isLocalOnly || localPromises.some((p) => p.id === item.id)) {
        const next = localPromises.filter((p) => p.id !== item.id);
        setLocalPromises(next);
        await idbSet(IDB_LOCAL_PROMISES_KEY, next);
        return;
      }
      if (!auth.currentUser) throw new Error('Silakan masuk terlebih dahulu.');
      try {
        await deleteDoc(doc(db, 'promises', item.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `promises/${item.id}`);
      }
    },
    [localPromises]
  );

  const value: AppDataContextValue = {
    user,
    isAdmin,
    authLoading,
    authError,
    signInAdmin,
    signOutUser,
    siteConfig,
    memories,
    timeline,
    songs,
    truthOrDareList,
    quizQuestions,
    loveLetters,
    promises,
    currentSongIndex,
    setCurrentSongIndex,
    playerStatus,
    setPlayerStatus,
    playerErrorMsg,
    setPlayerErrorMsg,
    updateSiteConfig,
    addMemory,
    removeMemory,
    saveTimelineItem,
    removeTimelineItem,
    addSong,
    removeSong,
    addTruthOrDare,
    saveQuizQuestion,
    removeQuizQuestion,
    addLoveLetter,
    removeLoveLetter,
    addPromise,
    removePromise,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}
